import { describe, expect, it } from 'vitest'
import { CONFIG_ERROR, readSupabaseConfig } from './supabaseClient.js'

describe('readSupabaseConfig', () => {
  it('ตั้งค่าครบ = คืน url และ key ที่ตัดช่องว่างแล้ว', () => {
    const env = {
      VITE_SUPABASE_URL: ' https://abc.supabase.co ',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
    }
    expect(readSupabaseConfig(env)).toEqual({
      config: { url: 'https://abc.supabase.co', key: 'sb_publishable_x' },
      error: null,
    })
  })

  it('ไม่มี url = ข้อความภาษาไทย', () => {
    expect(readSupabaseConfig({ VITE_SUPABASE_PUBLISHABLE_KEY: 'k' })).toEqual({
      config: null,
      error: CONFIG_ERROR,
    })
  })

  it('key ว่าง = ข้อความภาษาไทย', () => {
    const env = { VITE_SUPABASE_URL: 'https://abc.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: '  ' }
    expect(readSupabaseConfig(env).error).toBe(CONFIG_ERROR)
  })
})
