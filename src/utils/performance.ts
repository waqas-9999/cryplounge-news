/**
 * Performance Optimization Utilities
 * Code splitting, lazy loading, and caching strategies
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Intersection Observer for lazy loading
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;

  constructor(callback: (entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit) {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      options || {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  observe(element: Element) {
    this.observer?.observe(element);
  }

  unobserve(element: Element) {
    this.observer?.unobserve(element);
  }

  disconnect() {
    this.observer?.disconnect();
  }
}

/**
 * Image lazy loading with placeholder
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
) {
  if (placeholder) {
    img.src = placeholder;
  }

  const loader = new LazyLoader((entry) => {
    const image = entry.target as HTMLImageElement;
    image.src = src;
    image.classList.add('loaded');
  });

  loader.observe(img);
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: 'image' | 'script' | 'style' | 'font') {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch next page resources
 */
export function prefetchPage(url: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Simple in-memory cache
 */
export class Cache<T = any> {
  private cache: Map<string, { data: T; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const now = Date.now();
    const isExpired = now - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Local storage with expiration
 */
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'cryplounge_') {
    this.prefix = prefix;
  }

  set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000) {
    if (typeof window === 'undefined') return;

    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (e) {
      console.error('LocalStorageCache: Failed to set item', e);
    }
  }

  get<T = any>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const now = Date.now();
      const isExpired = now - item.timestamp > item.ttl;

      if (isExpired) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (e) {
      console.error('LocalStorageCache: Failed to get item', e);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(callback: () => void) {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Create a memoized version of a function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch multiple updates into a single render
 */
export function batchUpdates<T>(
  updates: Array<() => void>,
  delay: number = 16
): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
      setTimeout(resolve, delay);
    });
  });
}

/**
 * Check if browser supports webp
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Get optimal image format
 */
export async function getOptimalImageFormat(): Promise<'webp' | 'jpg'> {
  const webpSupported = await supportsWebP();
  return webpSupported ? 'webp' : 'jpg';
}

/**
 * Compress image URL for faster loading
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  quality: number = 80
): string {
  // If it's an Unsplash URL, add optimization parameters
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('fm', 'webp');
    params.set('auto', 'format');
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  return url;
}

// Export singleton instances
export const memoryCache = new Cache();
export const storageCache = new LocalStorageCache();
