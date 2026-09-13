/**
 * Editor assist for held-back stories: which ones look worth another look.
 *
 * ## What this is not
 *
 * Not a decision, not a model, and not a threshold anything acts on. Nothing
 * reads this score except the admin page, which labels it as an assist. An
 * editor decides; the newsroom then re-runs every gate regardless.
 *
 * ## Why deterministic
 *
 * An editor has to be able to see why a story ranked where it did, and the
 * same evidence must always rank the same way. So the score is a small sum of
 * named factors, each derived from something the newsroom actually recorded,
 * and every factor that moved it is returned in words.
 */

export interface AssistInput {
  /** The discovery news score, 0-100, when a discovery record exists. */
  discoveryScore: number | null;
  decisionClass: string | null;
  stateCode: string | null;
  /** False for a hard rejection. */
  recoverable: boolean;
  rewriteCount: number;
  /** From the latest research report; null when research never produced one. */
  research: {
    sources: number;
    primarySources: number;
    claims: number;
    verified: number;
    partiallyVerified: number;
  } | null;
}

export type AssistBand = 'STRONG' | 'POSSIBLE' | 'WEAK' | 'HARD_REJECTION';

export interface AssistResult {
  score: number;
  band: AssistBand;
  factors: string[];
}

export function recoveryAssist(input: AssistInput): AssistResult {
  const factors: string[] = [];

  if (!input.recoverable) {
    // A hard rejection is shown, never ranked: re-opening it is an explicit
    // editorial decision, not something a score should suggest.
    return { score: 0, band: 'HARD_REJECTION', factors: ['The newsroom marked this a hard rejection'] };
  }

  let score = 0;

  if (input.discoveryScore !== null) {
    const part = Math.round(Math.max(0, Math.min(100, input.discoveryScore)) * 0.3);
    score += part;
    factors.push(`News score ${Math.round(input.discoveryScore)} (+${part})`);
  } else {
    factors.push('No discovery score recorded (+0)');
  }

  if (input.research && input.research.claims > 0) {
    const established = input.research.verified + input.research.partiallyVerified * 0.5;
    const part = Math.round((established / input.research.claims) * 25);
    score += part;
    factors.push(
      `${input.research.verified} of ${input.research.claims} claims verified, ` +
        `${input.research.partiallyVerified} single-sourced (+${part})`
    );
  } else {
    factors.push('No research claims on record (+0)');
  }

  if (input.research?.primarySources) {
    score += 10;
    factors.push('Has a primary source (+10)');
  }
  if ((input.research?.sources ?? 0) >= 2) {
    score += 10;
    factors.push(`${input.research!.sources} sources (+10)`);
  }

  switch (input.decisionClass) {
    case 'SYSTEM':
      // A timeout or an unreadable response says nothing about the story.
      score += 20;
      factors.push('Stopped by a system failure, not an editorial judgement (+20)');
      break;
    case 'WRITING':
      score += 10;
      factors.push('Stopped at writing, after research succeeded (+10)');
      break;
    case 'EDITORIAL':
      score += 5;
      factors.push('The AI editor refused the draft (+5)');
      break;
    case 'RESEARCH':
      if (input.stateCode === 'SOURCE_BLOCKED') {
        // The publisher refused the page; nothing was concluded about the story.
        score += 10;
        factors.push('The lead publisher refused the page; the story itself was not judged (+10)');
      } else {
        factors.push('Research could not establish the story (+0)');
      }
      break;
    default:
      break;
  }

  if (input.rewriteCount >= 2) {
    score -= 5;
    factors.push(`${input.rewriteCount} editorial rewrites already spent (-5)`);
  }

  score = Math.max(0, Math.min(100, score));
  const band: AssistBand = score >= 65 ? 'STRONG' : score >= 40 ? 'POSSIBLE' : 'WEAK';
  return { score, band, factors };
}
