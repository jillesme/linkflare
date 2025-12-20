import { describe, it, expect } from 'vitest'
import { isReservedUsername, RESERVED_USERNAMES } from './reserved-usernames'

describe('isReservedUsername', () => {
  it('returns true for reserved usernames', () => {
    expect(isReservedUsername('dashboard')).toBe(true)
    expect(isReservedUsername('api')).toBe(true)
    expect(isReservedUsername('admin')).toBe(true)
    expect(isReservedUsername('login')).toBe(true)
    expect(isReservedUsername('settings')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isReservedUsername('DASHBOARD')).toBe(true)
    expect(isReservedUsername('Dashboard')).toBe(true)
    expect(isReservedUsername('API')).toBe(true)
    expect(isReservedUsername('Admin')).toBe(true)
  })

  it('returns false for valid usernames', () => {
    expect(isReservedUsername('johndoe')).toBe(false)
    expect(isReservedUsername('alice123')).toBe(false)
    expect(isReservedUsername('myusername')).toBe(false)
    expect(isReservedUsername('cool_user')).toBe(false)
  })

  it('has expected reserved usernames in the set', () => {
    expect(RESERVED_USERNAMES.has('dashboard')).toBe(true)
    expect(RESERVED_USERNAMES.has('authentication')).toBe(true)
    expect(RESERVED_USERNAMES.has('api')).toBe(true)
  })
})
