import { describe, expect, it, vi } from 'vitest'
import { importLegacyLoans, prepareLegacyImport } from './localImport.js'

const legacy = (overrides = {}) => ({
  id: 'old-1',
  friendName: 'ต้น',
  itemName: 'ร่มสีฟ้า',
  borrowedDate: '2026-09-01',
  dueDate: '2026-09-24',
  returnedDate: null,
  ...overrides,
})

const { id: _id, ...withoutId } = legacy()

describe('prepareLegacyImport', () => {
  it('รายการถูกต้องผ่าน และตัด id เดิมออก', () => {
    expect(prepareLegacyImport([legacy()])).toEqual({ valid: [withoutId], invalidCount: 0 })
  })

  it('returnedDate ไม่มี = null', () => {
    const { returnedDate: _r, ...noReturned } = legacy()
    expect(prepareLegacyImport([noReturned]).valid[0].returnedDate).toBeNull()
  })

  it('แยกรายการผิดกติกาออกและนับจำนวน', () => {
    const loans = [
      legacy(),
      legacy({ friendName: '  ' }),
      legacy({ dueDate: '2026-08-01' }),
      legacy({ returnedDate: '2026-08-01' }),
    ]
    expect(prepareLegacyImport(loans)).toEqual({ valid: [withoutId], invalidCount: 3 })
  })

  it('ข้อมูลรูปแบบผิด (ไม่ใช่ object, ชนิดผิด, วันที่ผิดรูปแบบ) นับเป็นผิด ไม่โยนข้อผิดพลาด', () => {
    const loans = [
      null,
      'ข้อความ',
      legacy({ friendName: 123 }),
      legacy({ borrowedDate: '1/9/2026' }),
      legacy({ dueDate: '2026-02-30' }),
      legacy({ returnedDate: 20260901 }),
    ]
    expect(prepareLegacyImport(loans)).toEqual({ valid: [], invalidCount: 6 })
  })
})

describe('importLegacyLoans', () => {
  it('ส่งเฉพาะรายการที่ถูกต้องในคำสั่งเดียว', async () => {
    const repo = { createLoans: vi.fn().mockResolvedValue({ loans: [{ id: 'new-1' }], error: null }) }
    const result = await importLegacyLoans(repo, [legacy(), legacy({ itemName: '' })])
    expect(repo.createLoans).toHaveBeenCalledTimes(1)
    expect(repo.createLoans).toHaveBeenCalledWith([withoutId])
    expect(result).toEqual({ loans: [{ id: 'new-1' }], importedCount: 1, skippedCount: 1, error: null })
  })

  it('ไม่มีรายการถูกต้องเลย = ไม่เรียกเซิร์ฟเวอร์', async () => {
    const repo = { createLoans: vi.fn() }
    const result = await importLegacyLoans(repo, [legacy({ itemName: '' })])
    expect(repo.createLoans).not.toHaveBeenCalled()
    expect(result).toEqual({ loans: [], importedCount: 0, skippedCount: 1, error: null })
  })

  it('เซิร์ฟเวอร์ผิดพลาด = ไม่นับว่านำเข้า และคืนข้อความ', async () => {
    const repo = { createLoans: vi.fn().mockResolvedValue({ loans: [], error: 'ผิดพลาด' }) }
    const result = await importLegacyLoans(repo, [legacy()])
    expect(result).toEqual({ loans: [], importedCount: 0, skippedCount: 0, error: 'ผิดพลาด' })
  })
})
