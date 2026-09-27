import { describe, expect, it } from 'vitest'
import { STATUS } from './loanRules.js'
import { TAB, TAB_STATUSES, countByStatus } from './tabs.js'

const today = '2026-09-27'
const loan = (overrides) => ({
  friendName: 'เอ',
  itemName: 'ร่ม',
  borrowedDate: '2026-09-01',
  dueDate: '2026-09-30',
  returnedDate: null,
  ...overrides,
})

describe('TAB_STATUSES', () => {
  it('Tab ค้างคืนแสดงเกินกำหนดก่อนยังไม่คืน', () => {
    expect(TAB_STATUSES[TAB.ACTIVE]).toEqual([STATUS.OVERDUE, STATUS.OUTSTANDING])
  })

  it('Tab คืนแล้วแสดงเฉพาะคืนแล้ว', () => {
    expect(TAB_STATUSES[TAB.RETURNED]).toEqual([STATUS.RETURNED])
  })

  it('Tab เพิ่มไม่มีรายการ', () => {
    expect(TAB_STATUSES[TAB.ADD]).toBeUndefined()
  })
})

describe('countByStatus', () => {
  it('ไม่มีรายการ ได้ศูนย์ทุกสถานะ', () => {
    expect(countByStatus([], today)).toEqual({ overdue: 0, outstanding: 0, returned: 0 })
  })

  it('นับแยกตามสถานะของวันนี้', () => {
    const loans = [
      loan({ dueDate: '2026-09-20' }),
      loan({ dueDate: '2026-09-26' }),
      loan({ dueDate: '2026-09-27' }),
      loan({ returnedDate: '2026-09-10' }),
    ]
    expect(countByStatus(loans, today)).toEqual({ overdue: 2, outstanding: 1, returned: 1 })
  })
})
