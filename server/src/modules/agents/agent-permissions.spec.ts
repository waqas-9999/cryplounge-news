import {
  AGENT_ALLOWED_PERMISSIONS,
  checkAgentPermissions,
  describeRejections,
  grantsAutonomousPublishing,
} from './agent-permissions';

/**
 * The security property under test: an AI agent can hold content permissions
 * and nothing else. These are the assertions that would fail loudly if someone
 * widened the allow-list without thinking it through.
 */
describe('agent permission allow-list', () => {
  it('accepts the content permissions an agent legitimately needs', () => {
    const check = checkAgentPermissions(['news.create', 'news.update', 'media.upload']);
    expect(check.allowed).toBe(true);
    expect(check.rejected).toEqual([]);
  });

  it('accepts an empty set', () => {
    expect(checkAgentPermissions([]).allowed).toBe(true);
  });

  it.each([
    'users.manage',
    'users.read',
    'roles.manage',
    'settings.manage',
    'ai.automation.manage',
    'agents.manage',
    'webhooks.manage',
    'audit.read',
  ])('refuses the administrative permission %s', key => {
    const check = checkAgentPermissions([key]);
    expect(check.allowed).toBe(false);
    expect(check.rejected[0]?.key).toBe(key);
    // Every refusal explains itself, so the error is actionable.
    expect(check.rejected[0]?.reason.length).toBeGreaterThan(10);
  });

  it('refuses taxonomy.manage so an agent cannot invent categories', () => {
    const check = checkAgentPermissions(['taxonomy.manage']);
    expect(check.allowed).toBe(false);
    expect(describeRejections(check)).toContain('existing ones');
  });

  it('refuses destructive content permissions', () => {
    expect(checkAgentPermissions(['news.delete']).allowed).toBe(false);
    expect(checkAgentPermissions(['media.delete']).allowed).toBe(false);
  });

  it('refuses the whole request when one key is forbidden', () => {
    // The example from the brief: a valid key smuggled in alongside a bad one.
    const check = checkAgentPermissions(['news.create', 'users.manage']);
    expect(check.allowed).toBe(false);
    expect(check.rejected.map(item => item.key)).toEqual(['users.manage']);
  });

  it('fails closed for keys it has never seen', () => {
    // A permission added to the catalogue later must not be grantable to an
    // agent until someone opts it in here.
    const check = checkAgentPermissions(['some.future.permission']);
    expect(check.allowed).toBe(false);
    expect(check.rejected[0]?.reason).toContain('not on the list');
  });

  it('never allows a permission whose key implies administration', () => {
    for (const key of AGENT_ALLOWED_PERMISSIONS) {
      expect(key).not.toMatch(/^(users|roles|settings|agents|webhooks|audit|ai)\./);
      expect(key).not.toMatch(/\.delete$/);
    }
  });

  it('identifies grants that allow publishing without a human', () => {
    expect(grantsAutonomousPublishing(['news.create'])).toBe(false);
    expect(grantsAutonomousPublishing(['news.create', 'news.publish'])).toBe(true);
  });
});
