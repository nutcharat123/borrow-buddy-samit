import { describe, expect, it } from 'vitest'
import {
  IMPORT_MARK,
  IMPORT_MARK_PREFIX,
  IMPORT_MARK_WARNING,
  LEGACY_READ_WARNING,
  LOAD_WARNING,
  SAVE_WARNING,
  STORAGE_KEY,
  getImportMark,
  loadLoans,
  readLegacyLoans,
  saveLoans,
  setImportMark,
} from './storage.js'

const memoryStorage = (initial = {}) => {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value)
    },
  }
}

const brokenStorage = () => ({
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('quota')
  },
})

const loan = {
  id: '1',
  friendName: 'ต้น',
  itemName: 'ร่มสีฟ้า',
  borrowedDate: '2026-09-01',
  dueDate: '2026-09-24',
  returnedDate: null,
}

describe('loadLoans', () => {
  it('ยังไม่มีข้อมูล = รายการว่าง ไม่มีคำเตือน', () => {
    expect(loadLoans(memoryStorage())).toEqual({ loans: [], warning: null })
  })

  it('อ่าน Loan ที่บันทึกไว้ได้ครบ', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify([loan]) })
    expect(loadLoans(storage)).toEqual({ loans: [loan], warning: null })
  })

  it('JSON เสีย = รายการว่างพร้อมคำเตือนภาษาไทย', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{เสีย' })
    expect(loadLoans(storage)).toEqual({ loans: [], warning: LOAD_WARNING })
  })

  it('JSON ถูกต้องแต่ไม่ใช่อาร์เรย์ = รายการว่างพร้อมคำเตือน', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{"a":1}' })
    expect(loadLoans(storage)).toEqual({ loans: [], warning: LOAD_WARNING })
  })

  it('อ่าน storage ไม่ได้ = รายการว่างพร้อมคำเตือน', () => {
    expect(loadLoans(brokenStorage())).toEqual({ loans: [], warning: LOAD_WARNING })
  })

  it('ข้อมูลเสียต้องไม่ถูกเขียนทับตอนอ่าน', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{เสีย' })
    loadLoans(storage)
    expect(storage.data[STORAGE_KEY]).toBe('{เสีย')
  })
})

describe('saveLoans', () => {
  it('บันทึกเป็น JSON ใต้คีย์เดียว และอ่านกลับได้เหมือนเดิม', () => {
    const storage = memoryStorage()
    expect(saveLoans([loan], storage)).toBeNull()
    expect(Object.keys(storage.data)).toEqual([STORAGE_KEY])
    expect(loadLoans(storage).loans).toEqual([loan])
  })

  it('บันทึกรายการว่างได้', () => {
    const storage = memoryStorage()
    expect(saveLoans([], storage)).toBeNull()
    expect(loadLoans(storage)).toEqual({ loans: [], warning: null })
  })

  it('บันทึกไม่ได้ = คืนคำเตือนภาษาไทย ไม่โยนข้อผิดพลาด', () => {
    expect(saveLoans([loan], brokenStorage())).toBe(SAVE_WARNING)
  })
})

describe('readLegacyLoans', () => {
  it('อ่าน Loan เดิมจากคีย์เวอร์ชัน 1', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify([loan]) })
    expect(readLegacyLoans(storage)).toEqual({ loans: [loan], warning: null })
  })

  it('ไม่มีข้อมูลเดิม = รายการว่าง ไม่มีคำเตือน', () => {
    expect(readLegacyLoans(memoryStorage())).toEqual({ loans: [], warning: null })
  })

  it('JSON เสีย = คำเตือนภาษาไทย และไม่เขียนทับคีย์เดิม', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{เสีย' })
    expect(readLegacyLoans(storage)).toEqual({ loans: [], warning: LEGACY_READ_WARNING })
    expect(storage.data).toEqual({ [STORAGE_KEY]: '{เสีย' })
  })

  it('อ่าน storage ไม่ได้ = คำเตือนภาษาไทย', () => {
    expect(readLegacyLoans(brokenStorage())).toEqual({ loans: [], warning: LEGACY_READ_WARNING })
  })
})

describe('เครื่องหมายนำเข้าข้อมูลเดิม', () => {
  it('ยังไม่เคยตั้ง = null', () => {
    expect(getImportMark('owner-a', memoryStorage())).toBeNull()
  })

  it('ตั้งแล้วอ่านกลับได้ ทั้ง imported และ skipped', () => {
    const storage = memoryStorage()
    expect(setImportMark('owner-a', IMPORT_MARK.IMPORTED, storage)).toBeNull()
    expect(getImportMark('owner-a', storage)).toBe(IMPORT_MARK.IMPORTED)
    setImportMark('owner-b', IMPORT_MARK.SKIPPED, storage)
    expect(getImportMark('owner-b', storage)).toBe(IMPORT_MARK.SKIPPED)
  })

  it('แยกตามบัญชีเจ้าของ', () => {
    const storage = memoryStorage()
    setImportMark('owner-a', IMPORT_MARK.IMPORTED, storage)
    expect(getImportMark('owner-b', storage)).toBeNull()
  })

  it('ตั้งเครื่องหมายแล้วข้อมูลเดิมยังอยู่', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify([loan]) })
    setImportMark('owner-a', IMPORT_MARK.IMPORTED, storage)
    expect(storage.data[STORAGE_KEY]).toBe(JSON.stringify([loan]))
  })

  it('ค่าที่ไม่รู้จักใน storage = null', () => {
    const storage = memoryStorage({ [`${IMPORT_MARK_PREFIX}owner-a`]: 'แปลก' })
    expect(getImportMark('owner-a', storage)).toBeNull()
  })

  it('storage ใช้ไม่ได้ = อ่านได้ null, ตั้งแล้วคืนคำเตือน ไม่โยนข้อผิดพลาด', () => {
    expect(getImportMark('owner-a', brokenStorage())).toBeNull()
    expect(setImportMark('owner-a', IMPORT_MARK.IMPORTED, brokenStorage())).toBe(IMPORT_MARK_WARNING)
  })
})
