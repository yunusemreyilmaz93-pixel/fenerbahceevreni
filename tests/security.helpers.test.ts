/**
 * Unit tests for free security helpers (no Firebase emulator required).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  honeypotTriggered,
  isAdminToken,
  publicErrorBody,
  sanitizeEmail,
  sanitizeStr,
} from '../server/security';

describe('honeypotTriggered', () => {
  it('accepts empty honeypot fields', () => {
    expect(honeypotTriggered({ website: '', name: 'Ali' })).toBe(false);
    expect(honeypotTriggered({ name: 'Ali' })).toBe(false);
    expect(honeypotTriggered(null)).toBe(false);
  });

  it('flags bot-filled honeypot fields', () => {
    expect(honeypotTriggered({ website: 'http://spam.example' })).toBe(true);
    expect(honeypotTriggered({ _gotcha: 'x' })).toBe(true);
    expect(honeypotTriggered({ fax: '123' })).toBe(true);
  });
});

describe('sanitizeEmail', () => {
  it('normalizes valid emails', () => {
    expect(sanitizeEmail('  User@Example.COM ')).toBe('user@example.com');
  });

  it('rejects invalid emails', () => {
    expect(sanitizeEmail('nope')).toBeNull();
    expect(sanitizeEmail('')).toBeNull();
    expect(sanitizeEmail(null)).toBeNull();
    expect(sanitizeEmail('a@b')).toBeNull();
  });
});

describe('sanitizeStr', () => {
  it('trims and enforces max length', () => {
    expect(sanitizeStr('  hello  ', 10)).toBe('hello');
    expect(sanitizeStr('too-long-value', 5)).toBeNull();
    expect(sanitizeStr('', 10, true)).toBeNull();
    expect(sanitizeStr('', 10, false)).toBe('');
  });
});

describe('isAdminToken', () => {
  const prev = process.env.ADMIN_EMAILS;
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'yunusemreyilmaz93@gmail.com';
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = prev;
  });

  it('accepts admin custom claim', () => {
    expect(isAdminToken({ admin: true })).toBe(true);
  });

  it('accepts allowlisted email', () => {
    expect(isAdminToken({ email: 'yunusemreyilmaz93@gmail.com' })).toBe(true);
  });

  it('rejects random users', () => {
    expect(isAdminToken({ email: 'hacker@example.com' })).toBe(false);
    expect(isAdminToken({})).toBe(false);
  });
});

describe('publicErrorBody', () => {
  const prev = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = prev;
  });

  it('omits extras in production', () => {
    process.env.NODE_ENV = 'production';
    const body = publicErrorBody('fail', { debug: { stack: 'x' } });
    expect(body.success).toBe(false);
    expect(body.message).toBe('fail');
    expect(body.debug).toBeUndefined();
  });

  it('includes extras outside production', () => {
    process.env.NODE_ENV = 'development';
    const body = publicErrorBody('fail', { debug: { stack: 'x' } });
    expect(body.debug).toEqual({ stack: 'x' });
  });
});
