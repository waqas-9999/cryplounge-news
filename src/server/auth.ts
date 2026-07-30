import 'server-only';

import { randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { Role, User } from '@prisma/client';
import { db } from './db';

/**
 * Staff authentication.
 *
 * Replaces the previous client-side check against two hardcoded credential
 * pairs that shipped in the browser bundle. Now:
 *  - passwords are bcrypt hashes, compared on the server only
 *  - the session is an opaque random token stored in Postgres
 *  - the cookie is httpOnly + sameSite=lax + secure in production, so client
 *    JavaScript cannot read or forge it
 */

const SESSION_COOKIE = 'cryplounge_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const BCRYPT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

function newSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/** Constant-time compare, so token checks do not leak length or prefix. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type SessionUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'avatarUrl'>;

/**
 * Verify credentials and open a session. Returns null on any failure — the
 * caller must not distinguish "unknown email" from "wrong password" in its
 * response, or it becomes an account enumeration oracle.
 */
export async function login(
  email: string,
  password: string,
  context: { userAgent?: string; ipAddress?: string } = {}
): Promise<SessionUser | null> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!user || !user.isActive) {
    // Spend comparable time so timing does not reveal whether the account
    // exists.
    await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin');
    return null;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  const token = newSessionToken();
  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    },
  });

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

/** Resolve the current staff user, or null. Safe to call from any server code. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || !safeEqual(session.token, token)) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (!session.user.isActive) return null;

  const { id, email, name, role, avatarUrl } = session.user;
  return { id, email, name, role, avatarUrl };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

/* ----------------------------------------------------------- authorisation --- */

/**
 * Role capability matrix. Higher roles inherit nothing implicitly — each
 * capability lists the roles that hold it, so widening access is a visible
 * one-line change rather than an ordering accident.
 */
const CAPABILITIES = {
  'content.read': ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER'],
  'content.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
  'content.publish': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'content.delete': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'media.upload': ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
  'media.delete': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'users.read': ['SUPER_ADMIN', 'ADMIN'],
  'users.write': ['SUPER_ADMIN', 'ADMIN'],
  'roles.write': ['SUPER_ADMIN'],
  'settings.write': ['SUPER_ADMIN', 'ADMIN'],
  'audit.read': ['SUPER_ADMIN', 'ADMIN'],
} as const satisfies Record<string, readonly Role[]>;

export type Capability = keyof typeof CAPABILITIES;

export function roleHas(role: Role, capability: Capability): boolean {
  return (CAPABILITIES[capability] as readonly Role[]).includes(role);
}

/** Thrown by `requireUser` / `requireCapability`; mapped to 401/403 by the API. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError('Authentication required', 401);
  return user;
}

export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await requireUser();
  if (!roleHas(user.role, capability)) {
    throw new AuthError(`Missing capability: ${capability}`, 403);
  }
  return user;
}
