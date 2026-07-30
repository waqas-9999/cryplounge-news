/**
 * Domain model for the Ecosystem project directory.
 *
 * This is the shape the UI consumes. It is deliberately independent of where
 * the data comes from: today a seeded module, tomorrow a REST payload. Only
 * `src/services/*` should know the difference.
 */

import type { ProjectCategory } from '@/lib/taxonomy';

export type ProjectStatus = 'live' | 'beta' | 'testnet' | 'deprecated';

/** Keys are fixed so the UI can map them to icons and labels. */
export interface ProjectLinks {
  website?: string;
  x?: string;
  github?: string;
  discord?: string;
  telegram?: string;
  linkedin?: string;
  youtube?: string;
  medium?: string;
  docs?: string;
  whitepaper?: string;
}

export interface Project {
  id: string;
  /** URL segment: /ecosystem/<slug> */
  slug: string;
  name: string;
  /** One line, shown on cards. Keep under ~120 characters. */
  tagline: string;
  /** Editorial description: what it does, the problem, who it's for. */
  about: string;
  keyFeatures: string[];

  category: ProjectCategory;
  /** Primary chain the project is identified with. */
  blockchain: string;
  /** Every chain it is deployed on, primary first. */
  supportedNetworks: string[];

  status: ProjectStatus;
  /** Editorially verified as the official project, not a clone. */
  verified: boolean;
  openSource: boolean;
  launchYear?: number;
  nativeToken?: string;

  /** Emoji or short mark used until real logo assets exist. */
  logo: string;
  /** Brand colour, used for the logo tile background. */
  accent: string;

  links: ProjectLinks;
  tags: string[];

  featured: boolean;
  editorsPick: boolean;
  /** ISO date the project was added to the directory. */
  addedAt: string;

  seo?: {
    title?: string;
    description?: string;
  };
}

/** A hand-curated grouping shown on the Ecosystem homepage. */
export interface ProjectCollection {
  slug: string;
  title: string;
  description: string;
  projectSlugs: string[];
}
