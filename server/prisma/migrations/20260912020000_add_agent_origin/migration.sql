-- Agent origin for articles and media.
--
-- Until now "was this filed by an agent?" was answered with
-- `"createdById" IS NULL`. That is unsound: "createdById" is ON DELETE SET NULL,
-- so deleting an editor makes their drafts look agent-filed, and seeded or
-- imported articles never had a creator. These columns record origin
-- explicitly. Null means "not known to be agent-filed" and must fail closed.
--
-- Additive and nullable: existing rows and the running CMS are unaffected.
-- Written with IF NOT EXISTS guards so a partially applied run can be re-run.

ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "createdByAgentId" TEXT;
ALTER TABLE "Media"   ADD COLUMN IF NOT EXISTS "uploadedByAgentId" TEXT;

CREATE INDEX IF NOT EXISTS "Article_createdByAgentId_status_idx"
  ON "Article" ("createdByAgentId", "status");
CREATE INDEX IF NOT EXISTS "Media_uploadedByAgentId_idx"
  ON "Media" ("uploadedByAgentId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Article_createdByAgentId_fkey') THEN
    ALTER TABLE "Article" ADD CONSTRAINT "Article_createdByAgentId_fkey"
      FOREIGN KEY ("createdByAgentId") REFERENCES "AiAgent"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Media_uploadedByAgentId_fkey') THEN
    ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedByAgentId_fkey"
      FOREIGN KEY ("uploadedByAgentId") REFERENCES "AiAgent"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Backfill "Article"."createdByAgentId".
--
-- An article is attributed to an agent only when recorded evidence names that
-- agent, and only when every piece of evidence for that article names the SAME
-- agent. `"createdById" IS NULL` is a precondition here, never evidence.
--
-- Evidence, strongest first:
--   1. "AgentIdempotencyKey": a completed `agents.articles.submit` whose result
--      is the article. Carries the agent id as a foreign key.
--   2. "AgentRequestLog": a successful POST to `agents/articles` whose result
--      is the article. Carries the agent id (null once the agent is deleted,
--      in which case it is not evidence).
--   3. "AuditLog": the CREATE entry `submitArticle` writes, whose actor label
--      is `Agent: <name>` and whose summary is `Agent "<name>" submitted
--      article ...`, with no user id. Agent names are not unique, so this
--      counts only when exactly one agent currently holds that name.
--
-- Not evidence, and therefore left null: a null "createdById" alone, seeded,
-- imported or deleted-editor articles, and any article whose sources disagree
-- about which agent filed it.
--
-- Status and every other column are untouched. Idempotent: rows already
-- attributed are skipped, so re-running changes nothing.
-- ---------------------------------------------------------------------------

WITH unique_agent_names AS (
  SELECT MIN("id") AS agent_id, "name"
  FROM "AiAgent"
  GROUP BY "name"
  HAVING COUNT(*) = 1
),
evidence AS (
  SELECT k."resultEntityId" AS article_id, k."agentId" AS agent_id
  FROM "AgentIdempotencyKey" k
  WHERE k."operation" = 'agents.articles.submit'
    AND k."status" = 'COMPLETED'
    AND k."resultEntity" = 'Article'
    AND k."resultEntityId" IS NOT NULL

  UNION ALL

  SELECT l."resultEntityId", l."agentId"
  FROM "AgentRequestLog" l
  WHERE l."endpoint" = 'agents/articles'
    AND l."method" = 'POST'
    AND l."statusCode" = 201
    AND l."resultEntity" = 'Article'
    AND l."resultEntityId" IS NOT NULL
    AND l."agentId" IS NOT NULL

  UNION ALL

  SELECT a."entityId", n.agent_id
  FROM "AuditLog" a
  JOIN unique_agent_names n
    ON a."userEmail" = 'Agent: ' || n."name"
   AND starts_with(a."summary", 'Agent "' || n."name" || '" submitted article ')
  WHERE a."action" = 'CREATE'
    AND a."entity" = 'Article'
    AND a."entityId" IS NOT NULL
    AND a."userId" IS NULL
),
resolved AS (
  SELECT article_id, MIN(agent_id) AS agent_id
  FROM evidence
  GROUP BY article_id
  HAVING COUNT(DISTINCT agent_id) = 1
)
UPDATE "Article" ar
SET "createdByAgentId" = r.agent_id
FROM resolved r
JOIN "AiAgent" ag ON ag."id" = r.agent_id
WHERE ar."id" = r.article_id
  AND ar."createdById" IS NULL
  AND ar."createdByAgentId" IS NULL;
