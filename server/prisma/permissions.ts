/**
 * The permission catalogue and the default role grants.
 *
 * Permissions live in the database so an administrator can adjust a role
 * without a deploy — this file only supplies the starting point. It is the
 * single source for what keys exist, so a guard and a seed can never disagree
 * about whether `news.publish` is a real permission.
 */

export interface PermissionDefinition {
  key: string;
  module: string;
  description: string;
}

/** Every capability the API checks. Adding one here makes it grantable. */
export const PERMISSIONS: PermissionDefinition[] = [
  // Content — one set per type, identical shape so the admin UI is uniform.
  ...contentPermissions('news', 'News', 'article'),
  ...contentPermissions('projects', 'Ecosystem', 'project'),
  ...contentPermissions('research', 'Research', 'research report'),
  ...contentPermissions('regulations', 'Regulation', 'regulation'),
  ...contentPermissions('events', 'Events', 'event'),
  ...contentPermissions('founders', 'Founders', 'founder profile'),

  { key: 'taxonomy.manage', module: 'Taxonomy', description: 'Manage categories, tags and labels' },
  { key: 'authors.manage', module: 'Authors', description: 'Manage author profiles' },

  { key: 'media.read', module: 'Media', description: 'Browse the media library' },
  { key: 'media.upload', module: 'Media', description: 'Upload files' },
  { key: 'media.delete', module: 'Media', description: 'Delete files' },

  { key: 'users.read', module: 'Users', description: 'View staff accounts' },
  { key: 'users.manage', module: 'Users', description: 'Invite, edit and disable staff accounts' },
  { key: 'roles.manage', module: 'Users', description: 'Change roles and permission grants' },

  { key: 'settings.read', module: 'Settings', description: 'View site settings' },
  { key: 'settings.manage', module: 'Settings', description: 'Change site settings' },
  { key: 'navigation.manage', module: 'Settings', description: 'Edit header and footer menus' },
  { key: 'homepage.manage', module: 'Settings', description: 'Configure homepage sections' },
  { key: 'seo.manage', module: 'SEO', description: 'Manage SEO defaults and redirects' },
  { key: 'localization.manage', module: 'Localization', description: 'Manage languages and translations' },
  { key: 'ads.manage', module: 'Advertising', description: 'Manage ad slots and campaigns' },

  { key: 'analytics.read', module: 'Analytics', description: 'View analytics and reports' },
  { key: 'audit.read', module: 'Audit', description: 'Read the audit log' },
  { key: 'agents.manage', module: 'AI Agents', description: 'Manage AI agent credentials and permissions' },
];

function contentPermissions(prefix: string, module: string, noun: string): PermissionDefinition[] {
  return [
    { key: `${prefix}.read`, module, description: `View any ${noun}, including drafts` },
    { key: `${prefix}.create`, module, description: `Create a ${noun}` },
    { key: `${prefix}.update`, module, description: `Edit a ${noun}` },
    { key: `${prefix}.publish`, module, description: `Publish or schedule a ${noun}` },
    { key: `${prefix}.delete`, module, description: `Delete a ${noun}` },
  ];
}

export interface RoleDefinitionSeed {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  /** '*' grants everything. */
  permissions: string[] | '*';
}

const CONTENT_TYPES = ['news', 'projects', 'research', 'regulations', 'events', 'founders'];

const forEachContent = (suffixes: string[]) =>
  CONTENT_TYPES.flatMap(type => suffixes.map(suffix => `${type}.${suffix}`));

/**
 * Default grants.
 *
 * The distinction that matters: AUTHOR can write but not publish. Publishing
 * is what makes content public, so it stays with EDITOR and above.
 */
export const ROLES: RoleDefinitionSeed[] = [
  {
    key: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Unrestricted access, including role and permission changes',
    isSystem: true,
    permissions: '*',
  },
  {
    key: 'ADMIN',
    name: 'Admin',
    description: 'Full operational access; cannot alter permission grants',
    isSystem: true,
    permissions: [
      ...forEachContent(['read', 'create', 'update', 'publish', 'delete']),
      'taxonomy.manage',
      'authors.manage',
      'media.read',
      'media.upload',
      'media.delete',
      'users.read',
      'users.manage',
      'settings.read',
      'settings.manage',
      'navigation.manage',
      'homepage.manage',
      'seo.manage',
      'localization.manage',
      'ads.manage',
      'analytics.read',
      'audit.read',
      'agents.manage',
    ],
  },
  {
    key: 'EDITOR',
    name: 'Editor',
    description: 'Creates, edits and publishes content across every section',
    isSystem: true,
    permissions: [
      ...forEachContent(['read', 'create', 'update', 'publish', 'delete']),
      'taxonomy.manage',
      'authors.manage',
      'media.read',
      'media.upload',
      'media.delete',
      'homepage.manage',
      'seo.manage',
      'analytics.read',
    ],
  },
  {
    key: 'AUTHOR',
    name: 'Author',
    description: 'Writes and edits own content; submits for review rather than publishing',
    isSystem: true,
    permissions: [
      ...forEachContent(['read', 'create', 'update']),
      'media.read',
      'media.upload',
    ],
  },
  {
    key: 'MODERATOR',
    name: 'Moderator',
    description: 'Reviews queued content without publishing rights',
    isSystem: true,
    permissions: [...forEachContent(['read', 'update']), 'media.read'],
  },
  {
    key: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access to the admin',
    isSystem: true,
    permissions: [...forEachContent(['read']), 'media.read', 'analytics.read'],
  },
];
