import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// URL validation schema (same as in links.ts)
const urlSchema = z.string().max(2048).refine(
  (val) => {
    try {
      const url = new URL(val)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  },
  { message: 'Invalid URL' }
)

// Username validation regex (same as in authentication.ts)
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(
    /^[a-zA-Z0-9_.]+$/,
    'Only letters, numbers, underscores, and dots allowed'
  )

describe('URL validation', () => {
  it('accepts valid https URLs', () => {
    expect(urlSchema.safeParse('https://example.com').success).toBe(true)
    expect(urlSchema.safeParse('https://sub.example.com/path').success).toBe(true)
    expect(urlSchema.safeParse('https://example.com:8080/path?query=1').success).toBe(true)
  })

  it('accepts valid http URLs', () => {
    expect(urlSchema.safeParse('http://example.com').success).toBe(true)
    expect(urlSchema.safeParse('http://localhost:3000').success).toBe(true)
  })

  it('rejects URLs without protocol', () => {
    expect(urlSchema.safeParse('example.com').success).toBe(false)
    expect(urlSchema.safeParse('www.example.com').success).toBe(false)
  })

  it('rejects non-http/https protocols', () => {
    expect(urlSchema.safeParse('ftp://example.com').success).toBe(false)
    expect(urlSchema.safeParse('javascript:alert(1)').success).toBe(false)
    expect(urlSchema.safeParse('file:///etc/passwd').success).toBe(false)
  })

  it('rejects invalid URLs', () => {
    expect(urlSchema.safeParse('not a url').success).toBe(false)
    expect(urlSchema.safeParse('').success).toBe(false)
  })
})

describe('Username validation', () => {
  it('accepts valid usernames', () => {
    expect(usernameSchema.safeParse('johndoe').success).toBe(true)
    expect(usernameSchema.safeParse('john_doe').success).toBe(true)
    expect(usernameSchema.safeParse('john.doe').success).toBe(true)
    expect(usernameSchema.safeParse('user123').success).toBe(true)
    expect(usernameSchema.safeParse('ABC').success).toBe(true)
  })

  it('rejects usernames that are too short', () => {
    expect(usernameSchema.safeParse('ab').success).toBe(false)
    expect(usernameSchema.safeParse('a').success).toBe(false)
  })

  it('rejects usernames that are too long', () => {
    const longUsername = 'a'.repeat(31)
    expect(usernameSchema.safeParse(longUsername).success).toBe(false)
  })

  it('rejects usernames with invalid characters', () => {
    expect(usernameSchema.safeParse('user@name').success).toBe(false)
    expect(usernameSchema.safeParse('user name').success).toBe(false)
    expect(usernameSchema.safeParse('user-name').success).toBe(false)
    expect(usernameSchema.safeParse('user!name').success).toBe(false)
  })
})
