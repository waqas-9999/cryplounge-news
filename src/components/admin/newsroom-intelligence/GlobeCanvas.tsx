'use client';

/**
 * The newsroom globe.
 *
 * ## Why canvas + d3-geo rather than a WebGL globe library
 *
 * The repository already ships `d3-geo`, `topojson-client` and the
 * `world-atlas` geometry for the analytics map, and has no Three.js or globe
 * dependency. An orthographic projection is a true spherical projection —
 * rotation, limb clipping and great-circle arcs are exact, not faked — and at
 * the scale this page renders (tens of publisher bases, not millions of
 * points) a single 2D canvas holds 60fps with no new dependency. If the page
 * ever needs per-story points in the thousands, that is the moment to move the
 * point layer to WebGL; the data model does not change.
 *
 * ## Rendering discipline
 *
 * Nothing here causes a React render per frame. Props are copied into refs;
 * one `requestAnimationFrame` loop reads the refs and draws. React hears from
 * the canvas only when the hovered node changes or a node is clicked.
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import {
  geoCircle,
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { PIPELINE_STAGES, STAGE_META, type PipelineStage } from './model';

export interface GlobeNode {
  key: string;
  label: string;
  lat: number;
  lon: number;
  /** Stories matching the current filters. */
  count: number;
  /** Stories at this base before filtering, for the dimmed state. */
  total: number;
  stages: Partial<Record<PipelineStage, number>>;
  /** Share of matching stories still moving through the pipeline, 0-1. */
  activity: number;
  color: string;
}

export interface GlobeArc {
  id: string;
  from: [number, number];
  to: [number, number];
  color: string;
}

export interface GlobeHandle {
  pulse: (key: string, color: string) => void;
  focus: (key: string) => void;
  resetView: () => void;
}

interface GlobeCanvasProps {
  nodes: GlobeNode[];
  arcs: GlobeArc[];
  selectedKey: string | null;
  paused: boolean;
  /** Centre of activity [lon, lat] the idle globe rests on. */
  anchor: [number, number] | null;
  /** Screen space the floating panels cover, so the globe centres in what remains. */
  insets: { left: number; right: number; top: number; bottom: number };
  onHover: (node: GlobeNode | null, point: { x: number; y: number } | null) => void;
  onSelect: (key: string | null) => void;
}

const GOLD = '#EFB81A';
const TAU = Math.PI * 2;

/* ------------------------------------------------------------ geometry -- */

const topology = worldAtlas as unknown as Topology;
const LAND = feature(topology, topology.objects.countries) as unknown as GeoPermissibleObjects;
const BORDERS = mesh(topology, topology.objects.countries as never, (a, b) => a !== b) as GeoPermissibleObjects;
const GRATICULE = geoGraticule10();
const SPHERE: GeoPermissibleObjects = { type: 'Sphere' };

/** The sub-solar point now, so the night side is the real night side. */
function subsolarPoint(date: Date): [number, number] {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86_400_000;
  const declination = 23.44 * Math.sin((TAU * (day - 81)) / 365);
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return [-15 * (hours - 12), declination];
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

export const GlobeCanvas = forwardRef<GlobeHandle, GlobeCanvasProps>(function GlobeCanvas(
  { nodes, arcs, selectedKey, paused, anchor, insets, onHover, onSelect },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live inputs for the draw loop.
  const props = useRef({ nodes, arcs, selectedKey, paused, anchor, insets, onHover, onSelect });
  props.current = { nodes, arcs, selectedKey, paused, anchor, insets, onHover, onSelect };

  const view = useRef({
    rotation: [40, -30] as [number, number],
    /** Last time the reader moved the globe; idle sway waits for them. */
    touchedAt: -Infinity,
    anchored: false,
    zoom: 1,
    velocity: 0,
    dragging: false,
    moved: false,
    last: { x: 0, y: 0 },
    hovered: null as string | null,
    pointer: null as { x: number; y: number } | null,
    tween: null as null | { from: [number, number]; to: [number, number]; zoomFrom: number; zoomTo: number; start: number; ms: number },
    pulses: [] as Array<{ key: string; color: string; start: number }>,
    screen: new Map<string, { x: number; y: number; r: number; node: GlobeNode }>(),
  });

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useImperativeHandle(ref, () => ({
    pulse(key, color) {
      if (reducedMotion) return;
      const pulses = view.current.pulses;
      // Bounded: a burst of events must not become a burst of work.
      if (pulses.length > 48) pulses.shift();
      pulses.push({ key, color, start: performance.now() });
    },
    focus(key) {
      const node = props.current.nodes.find(candidate => candidate.key === key);
      if (!node) return;
      const v = view.current;
      v.tween = {
        from: [...v.rotation],
        to: [-node.lon, Math.max(-60, Math.min(60, -node.lat))],
        zoomFrom: v.zoom,
        zoomTo: Math.max(v.zoom, 1.7),
        start: performance.now(),
        ms: reducedMotion ? 1 : 950,
      };
    },
    resetView() {
      const v = view.current;
      v.tween = { from: [...v.rotation], to: [v.rotation[0], -22], zoomFrom: v.zoom, zoomTo: 1, start: performance.now(), ms: reducedMotion ? 1 : 700 };
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const projection = geoOrthographic().clipAngle(90).precision(0.6);
    const path = geoPath(projection, ctx);

    let frame = 0;
    let previous = performance.now();

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min(now - previous, 64);
      previous = now;
      const v = view.current;
      const p = props.current;

      /* --------------------------------------------------------- motion -- */
      if (v.tween) {
        const t = Math.min(1, (now - v.tween.start) / v.tween.ms);
        const k = easeInOutCubic(t);
        // Shortest way round in longitude.
        const dl = ((v.tween.to[0] - v.tween.from[0] + 540) % 360) - 180;
        v.rotation = [v.tween.from[0] + dl * k, v.tween.from[1] + (v.tween.to[1] - v.tween.from[1]) * k];
        v.zoom = v.tween.zoomFrom + (v.tween.zoomTo - v.tween.zoomFrom) * k;
        if (t >= 1) v.tween = null;
      } else if (!v.dragging) {
        if (Math.abs(v.velocity) > 0.001) {
          v.rotation[0] += v.velocity * dt;
          v.velocity *= 0.94;
        } else if (p.anchor && !v.hovered && !p.selectedKey && now - v.touchedAt > 8000) {
          // Rest on the centre of activity; sway slowly around it unless paused.
          const sway = p.paused || reducedMotion ? 0 : Math.sin(now / 11000) * 16;
          const targetLon = -p.anchor[0] + sway;
          const targetLat = Math.max(-45, Math.min(10, -p.anchor[1] * 0.75));
          if (!v.anchored) {
            v.rotation = [targetLon, targetLat];
            v.anchored = true;
          } else {
            const dl = ((targetLon - v.rotation[0] + 540) % 360) - 180;
            const k = Math.min(1, dt * 0.0012);
            v.rotation[0] += dl * k;
            v.rotation[1] += (targetLat - v.rotation[1]) * k;
          }
        }
      }

      const free = {
        x: p.insets.left,
        y: p.insets.top,
        w: Math.max(width - p.insets.left - p.insets.right, 200),
        h: Math.max(height - p.insets.top - p.insets.bottom, 200),
      };
      const cx = free.x + free.w / 2;
      const cy = free.y + free.h / 2;
      const radius = Math.min(free.w, free.h) * 0.47 * v.zoom;
      projection.translate([cx, cy]).scale(radius).rotate([v.rotation[0], v.rotation[1]]);
      const centre: [number, number] = [-v.rotation[0], -v.rotation[1]];

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      /* ----------------------------------------------------- atmosphere -- */
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.94, cx, cy, radius * 1.28);
      halo.addColorStop(0, 'rgba(120,160,230,0.16)');
      halo.addColorStop(0.35, 'rgba(90,130,210,0.06)');
      halo.addColorStop(1, 'rgba(60,90,160,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.28, 0, TAU);
      ctx.fill();

      /* ---------------------------------------------------------- ocean -- */
      const ocean = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.1, cx, cy, radius);
      ocean.addColorStop(0, '#141A23');
      ocean.addColorStop(0.7, '#0B0F15');
      ocean.addColorStop(1, '#07090D');
      ctx.beginPath();
      path(SPHERE);
      ctx.fillStyle = ocean;
      ctx.fill();

      ctx.beginPath();
      path(GRATICULE);
      ctx.strokeStyle = 'rgba(160,180,210,0.055)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      /* ----------------------------------------------------------- land -- */
      ctx.beginPath();
      path(LAND);
      ctx.fillStyle = '#1A2029';
      ctx.fill();
      ctx.beginPath();
      path(BORDERS);
      ctx.strokeStyle = 'rgba(200,210,225,0.07)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      /* ---------------------------------------------------------- night -- */
      const sun = subsolarPoint(new Date());
      const antisolar: [number, number] = [sun[0] + 180, -sun[1]];
      for (const [r, alpha] of [
        [96, 0.1],
        [90, 0.2],
        [84, 0.14],
      ] as const) {
        ctx.beginPath();
        path(geoCircle().center(antisolar).radius(r)());
        ctx.fillStyle = `rgba(2,3,6,${alpha})`;
        ctx.fill();
      }

      /* ------------------------------------------------------- rim light -- */
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.82, cx, cy, radius);
      rim.addColorStop(0, 'rgba(140,170,220,0)');
      rim.addColorStop(1, 'rgba(140,170,220,0.10)');
      ctx.beginPath();
      path(SPHERE);
      ctx.fillStyle = rim;
      ctx.fill();
      ctx.strokeStyle = 'rgba(170,195,235,0.16)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      /* ----------------------------------------------------------- arcs -- */
      // Real links only: a story whose sources are based in two places.
      for (let i = 0; i < p.arcs.length; i += 1) {
        const arc = p.arcs[i]!;
        ctx.beginPath();
        path({ type: 'LineString', coordinates: [arc.from, arc.to] });
        ctx.strokeStyle = withAlpha(arc.color, 0.22);
        ctx.lineWidth = 0.9;
        ctx.stroke();

        if (reducedMotion) continue;
        const interpolate = geoInterpolate(arc.from, arc.to);
        const t = ((now / 3200 + i * 0.37) % 1 + 1) % 1;
        const point = interpolate(t);
        if (geoDistance(point, centre) > Math.PI / 2 - 0.03) continue;
        const projected = projection(point);
        if (!projected) continue;
        const glow = ctx.createRadialGradient(projected[0], projected[1], 0, projected[0], projected[1], 5);
        glow.addColorStop(0, withAlpha(arc.color, 0.9));
        glow.addColorStop(1, withAlpha(arc.color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(projected[0], projected[1], 5, 0, TAU);
        ctx.fill();
      }

      /* ---------------------------------------------------------- nodes -- */
      v.screen.clear();
      const nodeScale = Math.sqrt(Math.min(v.zoom, 2.2));
      const ordered = [...p.nodes].sort((a, b) => a.count - b.count);
      const labelled = new Set(
        [...p.nodes].sort((a, b) => b.count - a.count).slice(0, 6).map(node => node.key)
      );
      const labelQueue: Array<{ node: GlobeNode; x: number; y: number; r: number; limb: number; emphasis: boolean }> = [];

      for (const node of ordered) {
        const coordinates: [number, number] = [node.lon, node.lat];
        const distance = geoDistance(coordinates, centre);
        if (distance > Math.PI / 2 - 0.02) continue;
        const projected = projection(coordinates);
        if (!projected) continue;
        const [x, y] = projected;
        // Fade toward the limb, where a point is seen edge-on.
        const limb = Math.min(1, Math.cos(distance) * 1.6 + 0.15);
        const dimmed = node.count === 0;
        const r = (3 + Math.sqrt(Math.max(node.count, dimmed ? node.total : 0)) * 2.1) * nodeScale;
        const isSelected = p.selectedKey === node.key;
        const isHovered = v.hovered === node.key;

        v.screen.set(node.key, { x, y, r, node });

        if (dimmed) {
          ctx.beginPath();
          ctx.arc(x, y, Math.max(2, r * 0.45), 0, TAU);
          ctx.fillStyle = `rgba(140,150,165,${0.22 * limb})`;
          ctx.fill();
          continue;
        }

        // Halo scales with how much is still moving here, not with raw size.
        const haloR = r * (2.2 + node.activity * 1.8);
        const nodeHalo = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        nodeHalo.addColorStop(0, withAlpha(node.color, (0.28 + node.activity * 0.22) * limb));
        nodeHalo.addColorStop(1, withAlpha(node.color, 0));
        ctx.fillStyle = nodeHalo;
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, TAU);
        ctx.fill();

        // Core.
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.8, r * 0.34), 0, TAU);
        ctx.fillStyle = withAlpha('#F2F4F7', 0.92 * limb);
        ctx.fill();

        // Stage-mix ring: each arc segment is a real share of this base's stories.
        const total = PIPELINE_STAGES.reduce((sum, stage) => sum + (node.stages[stage] ?? 0), 0) || 1;
        const gap = total > 1 ? 0.07 : 0;
        let angle = -Math.PI / 2;
        ctx.lineWidth = isSelected || isHovered ? 2.4 : 1.8;
        ctx.lineCap = 'butt';
        for (const stage of PIPELINE_STAGES) {
          const share = (node.stages[stage] ?? 0) / total;
          if (share <= 0) continue;
          const sweep = share * TAU;
          ctx.beginPath();
          ctx.arc(x, y, r, angle + gap / 2, angle + Math.max(sweep - gap / 2, gap / 2 + 0.02));
          ctx.strokeStyle = withAlpha(STAGE_META[stage].color, 0.95 * limb);
          ctx.stroke();
          angle += sweep;
        }

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, r + 6, 0, TAU);
          ctx.setLineDash([2, 4]);
          ctx.lineDashOffset = reducedMotion ? 0 : -now / 90;
          ctx.strokeStyle = withAlpha(GOLD, 0.9);
          ctx.lineWidth = 1.1;
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (isHovered) {
          ctx.beginPath();
          ctx.arc(x, y, r + 5, 0, TAU);
          ctx.strokeStyle = 'rgba(232,234,237,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if ((labelled.has(node.key) || isSelected || isHovered) && limb > 0.55) {
          labelQueue.push({ node, x, y, r, limb, emphasis: isSelected || isHovered });
        }
      }

      /* --------------------------------------------------------- labels -- */
      // Emphasised first, then busiest. A label that would collide with one
      // already placed tries the other side, then gives way: close bases such
      // as New York and Washington must not print over each other.
      labelQueue.sort((a, b) => Number(b.emphasis) - Number(a.emphasis) || b.node.count - a.node.count);
      const placed: Array<[number, number, number, number]> = [];
      const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
      for (const item of labelQueue) {
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        if ('letterSpacing' in spaced) spaced.letterSpacing = '0.9px';
        const text = item.node.label.toUpperCase();
        const countText = `${item.node.count} ${item.node.count === 1 ? 'story' : 'stories'}`;
        // Box covers both lines, so a count never prints under a neighbour's name.
        const w = Math.max(ctx.measureText(text).width, countText.length * 6.2) + 6;
        const h = 30;
        const top = item.y - 13;
        const spot = [item.x + item.r + 9, item.x - item.r - 9 - w].find(
          lx => !placed.some(([px, py, pw, ph]) => lx < px + pw && lx + w > px && top < py + ph && top + h > py)
        );
        if (spot === undefined) continue;
        placed.push([spot, top, w, h]);
        ctx.fillStyle = withAlpha('#E8EAED', (item.emphasis ? 0.96 : 0.74) * item.limb);
        ctx.fillText(text, spot, item.y - 1);
        ctx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        if ('letterSpacing' in spaced) spaced.letterSpacing = '0px';
        ctx.fillStyle = withAlpha('#8B929C', item.limb);
        ctx.fillText(countText, spot, item.y + 11);
      }

      /* --------------------------------------------------------- pulses -- */
      v.pulses = v.pulses.filter(pulse => now - pulse.start < 1600);
      for (const pulse of v.pulses) {
        const spot = v.screen.get(pulse.key);
        if (!spot) continue;
        const t = (now - pulse.start) / 1600;
        const eased = 1 - (1 - t) ** 3;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r + 2 + eased * 22, 0, TAU);
        ctx.strokeStyle = withAlpha(pulse.color, 0.7 * (1 - t));
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };

    frame = requestAnimationFrame(draw);

    /* ------------------------------------------------------ interaction -- */
    const hit = (x: number, y: number) => {
      let best: { key: string; node: GlobeNode; d: number } | null = null;
      for (const [key, spot] of view.current.screen) {
        const d = Math.hypot(spot.x - x, spot.y - y);
        if (d <= Math.max(spot.r + 6, 10) && (!best || d < best.d)) best = { key, node: spot.node, d };
      }
      return best;
    };

    const local = (event: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      const v = view.current;
      v.dragging = true;
      v.moved = false;
      v.velocity = 0;
      v.tween = null;
      v.touchedAt = performance.now();
      v.last = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const v = view.current;
      const point = local(event);
      if (v.dragging) {
        const dx = event.clientX - v.last.x;
        const dy = event.clientY - v.last.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) v.moved = true;
        const sensitivity = 0.25 / v.zoom;
        v.rotation[0] += dx * sensitivity;
        v.rotation[1] = Math.max(-60, Math.min(60, v.rotation[1] - dy * sensitivity));
        v.touchedAt = performance.now();
        v.velocity = (dx * sensitivity) / 16;
        v.last = { x: event.clientX, y: event.clientY };
        return;
      }
      const found = hit(point.x, point.y);
      const key = found?.key ?? null;
      canvas.style.cursor = key ? 'pointer' : 'grab';
      if (key !== v.hovered) {
        v.hovered = key;
        props.current.onHover(found?.node ?? null, found ? point : null);
      } else if (key) {
        props.current.onHover(found!.node, point);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const v = view.current;
      canvas.releasePointerCapture(event.pointerId);
      const wasDrag = v.moved;
      v.dragging = false;
      if (wasDrag) return;
      const point = local(event);
      props.current.onSelect(hit(point.x, point.y)?.key ?? null);
    };

    const onLeave = () => {
      if (view.current.hovered) {
        view.current.hovered = null;
        props.current.onHover(null, null);
      }
    };

    const onDoubleClick = (event: MouseEvent) => {
      const point = local(event);
      const found = hit(point.x, point.y);
      if (found) {
        props.current.onSelect(found.key);
        const v = view.current;
        v.tween = {
          from: [...v.rotation],
          to: [-found.node.lon, Math.max(-60, Math.min(60, -found.node.lat))],
          zoomFrom: v.zoom,
          zoomTo: Math.max(v.zoom, 1.8),
          start: performance.now(),
          ms: reducedMotion ? 1 : 950,
        };
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const v = view.current;
      v.tween = null;
      v.touchedAt = performance.now();
      v.zoom = Math.max(0.75, Math.min(2.8, v.zoom * Math.exp(-event.deltaY * 0.0012)));
    };

    const onKey = (event: KeyboardEvent) => {
      const v = view.current;
      const step = 6 / v.zoom;
      if (event.key === 'ArrowLeft') v.rotation[0] -= step;
      else if (event.key === 'ArrowRight') v.rotation[0] += step;
      else if (event.key === 'ArrowUp') v.rotation[1] = Math.max(-60, v.rotation[1] - step);
      else if (event.key === 'ArrowDown') v.rotation[1] = Math.min(60, v.rotation[1] + step);
      else if (event.key === '+' || event.key === '=') v.zoom = Math.min(2.8, v.zoom * 1.12);
      else if (event.key === '-') v.zoom = Math.max(0.75, v.zoom / 1.12);
      else return;
      v.touchedAt = performance.now();
      event.preventDefault();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('dblclick', onDoubleClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('dblclick', onDoubleClick);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('keydown', onKey);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      aria-label="Globe of newsroom activity by publisher base. Drag or use arrow keys to rotate, plus and minus to zoom."
      role="img"
      className="absolute inset-0 h-full w-full cursor-grab touch-none outline-none focus-visible:ring-1 focus-visible:ring-[#EFB81A]/40"
    />
  );
});
