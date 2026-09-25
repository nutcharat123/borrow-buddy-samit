import { describe, expect, it } from 'vitest'
import { ERROR_MESSAGE, toThaiError } from './supabaseErrors.js'

describe('toThaiError', () => {
  it.each([
    [{ code: 'invalid_credentials' }, ERROR_MESSAGE.INVALID_CREDENTIALS],
    [{ code: 'email_not_confirmed' }, ERROR_MESSAGE.EMAIL_NOT_CONFIRMED],
    [{ code: 'signup_disabled' }, ERROR_MESSAGE.SIGNUP_DISABLED],
    [{ code: 'user_banned' }, ERROR_MESSAGE.USER_BANNED],
    [{ code: 'over_request_rate_limit' }, ERROR_MESSAGE.RATE_LIMIT],
    [{ status: 429 }, ERROR_MESSAGE.RATE_LIMIT],
    [{ code: 'session_expired' }, ERROR_MESSAGE.SESSION_EXPIRED],
    [{ code: 'refresh_token_not_found' }, ERROR_MESSAGE.SESSION_EXPIRED],
    [{ code: 'PGRST301' }, ERROR_MESSAGE.SESSION_EXPIRED],
    [{ code: '23514' }, ERROR_MESSAGE.INVALID_DATA],
    [{ code: '22007' }, ERROR_MESSAGE.INVALID_DATA],
    [{ code: '42501' }, ERROR_MESSAGE.FORBIDDEN],
    [{ code: 'PGRST116' }, ERROR_MESSAGE.NOT_FOUND],
  ])('%o -> ข้อความไทยที่ถูก', (error, expected) => {
    expect(toThaiError(error)).toBe(expected)
  })

  it('AuthRetryableFetchError = เชื่อมต่อไม่ได้', () => {
    expect(toThaiError({ name: 'AuthRetryableFetchError', message: '' })).toBe(ERROR_MESSAGE.NETWORK)
  })

  it('TypeError จาก fetch = เชื่อมต่อไม่ได้', () => {
    expect(toThaiError(new TypeError('Failed to fetch'))).toBe(ERROR_MESSAGE.NETWORK)
  })

  it('ข้อผิดพลาดของ PostgREST ที่ห่อ fetch ล้ม = เชื่อมต่อไม่ได้', () => {
    expect(toThaiError({ code: '', message: 'TypeError: fetch failed' })).toBe(ERROR_MESSAGE.NETWORK)
  })

  it('ไม่รู้จัก = ข้อความทั่วไป', () => {
    expect(toThaiError({ code: 'something_new', message: 'boom' })).toBe(ERROR_MESSAGE.UNKNOWN)
  })

  it('ไม่มีข้อผิดพลาด = null', () => {
    expect(toThaiError(null)).toBeNull()
  })
})
