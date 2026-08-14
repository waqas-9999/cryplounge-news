import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { readIdempotencyKey } from './agent-submission.controller';

/** Minimal stand-in for an express request carrying only headers. */
function req(headers: Record<string, string | string[] | undefined>): Request {
  return { headers } as unknown as Request;
}

describe('Idempotency-Key header', () => {
  it('accepts the documented key format', () => {
    expect(readIdempotencyKey(req({ 'idempotency-key': 'newsroom-job-20260813-001' }))).toBe(
      'newsroom-job-20260813-001'
    );
  });

  it('treats an absent header as opt-out, preserving existing behaviour', () => {
    // Callers that predate this feature must keep working unchanged.
    expect(readIdempotencyKey(req({}))).toBeNull();
    expect(readIdempotencyKey(req({ 'idempotency-key': '' }))).toBeNull();
    expect(readIdempotencyKey(req({ 'idempotency-key': '   ' }))).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    expect(readIdempotencyKey(req({ 'idempotency-key': '  job-12345678  ' }))).toBe('job-12345678');
  });

  // Ignoring a key the caller believed was protecting them is worse than
  // telling them it was wrong. `it.each` names the offending value in the
  // failure output, which a loop inside one test would not.
  it.each([
    ['under 8 characters', 'short'],
    ['contains whitespace', 'has spaces in it'],
    ['non-ASCII', 'emoji-🚀-key'],
    ['punctuation outside the allowed set', 'semi;colon;injection'],
    ['over the length bound', 'x'.repeat(201)],
  ])('refuses a malformed key (%s)', (_reason, value) => {
    expect(() => readIdempotencyKey(req({ 'idempotency-key': value }))).toThrow(BadRequestException);
  });

  it('accepts the full allowed character set', () => {
    const key = 'Newsroom.Job_2026:08-13';
    expect(readIdempotencyKey(req({ 'idempotency-key': key }))).toBe(key);
  });

  it('uses the first value when the header is repeated', () => {
    expect(readIdempotencyKey(req({ 'idempotency-key': ['job-11111111', 'job-22222222'] }))).toBe(
      'job-11111111'
    );
  });
});
