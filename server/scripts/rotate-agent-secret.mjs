/**
 * Rotates one AI agent's secret and writes it straight into the newsroom's
 * `.env`.
 *
 * The plaintext secret is never printed. It is generated, hashed into the
 * database, and written to the target file in one step — so it does not pass
 * through a terminal, a log, or this transcript.
 *
 * Usage:
 *   node scripts/rotate-agent-secret.mjs <agentId> <path-to-.env>
 *
 * This only rotates. It never grants permissions, changes the publish mode, or
 * touches any agent other than the id given.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const [agentId, envPath] = process.argv.slice(2);

if (!agentId || !envPath) {
  console.error('Usage: node scripts/rotate-agent-secret.mjs <agentId> <path-to-.env>');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const agent = await prisma.aiAgent.findUnique({ where: { id: agentId } });
  if (!agent) throw new Error(`No AiAgent with id ${agentId}`);

  // Refuse anything that could publish on its own. A rotation script is not
  // the place to hand credentials to an agent nobody reviewed.
  if (agent.permissions.includes('news.publish')) {
    throw new Error(`Agent ${agent.name} holds news.publish. Refusing to issue a secret for it.`);
  }
  if (agent.environment !== 'STAGING') {
    throw new Error(`Agent ${agent.name} is ${agent.environment}, not STAGING. Refusing.`);
  }

  const apiSecret = randomBytes(32).toString('base64url');
  await prisma.aiAgent.update({
    where: { id: agentId },
    data: { apiSecretHash: await argon2.hash(apiSecret, { type: argon2.argon2id }) },
  });

  let env = readFileSync(envPath, 'utf8');
  const set = (key, value) =>
    new RegExp(`^${key}=.*$`, 'm').test(env)
      ? (env = env.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`))
      : (env += `\n${key}=${value}\n`);

  set('AI_AGENT_KEY', agent.apiKey);
  set('AI_AGENT_SECRET', apiSecret);
  writeFileSync(envPath, env, 'utf8');

  console.log(`Rotated the secret for "${agent.name}" (${agent.environment}).`);
  console.log(`Permissions unchanged: ${agent.permissions.join(', ')}`);
  console.log(`Publish mode unchanged: ${agent.defaultPublishMode}`);
  console.log(`Credentials written to ${envPath}. The secret was not printed.`);
} finally {
  await prisma.$disconnect();
}
