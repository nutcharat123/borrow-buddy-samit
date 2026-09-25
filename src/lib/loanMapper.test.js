import { describe, expect, it } from 'vitest'
import { LOAN_COLUMNS, toLoan, toRow } from './loanMapper.js'

const row = {
  id: 'uuid-1',
  friend_name: 'ต้น',
  item_name: 'ร่มสีฟ้า',
  borrowed_date: '2026-09-01',
  due_date: '2026-09-24',
  returned_date: null,
}

const loan = {
  id: 'uuid-1',
  friendName: 'ต้น',
  itemName: 'ร่มสีฟ้า',
  borrowedDate: '2026-09-01',
  dueDate: '2026-09-24',
  returnedDate: null,
}

describe('toLoan', () => {
  it('แปลงแถวเป็น Loan ครบทุกฟิลด์', () => {
    expect(toLoan(row)).toEqual(loan)
  })

  it('ไม่รวมคอลัมน์อื่น เช่น owner_id', () => {
    expect(toLoan({ ...row, owner_id: 'o', created_at: 'x' })).toEqual(loan)
  })

  it('returned_date ที่มีค่าแปลงมาครบ', () => {
    expect(toLoan({ ...row, returned_date: '2026-09-20' }).returnedDate).toBe('2026-09-20')
  })
})

describe('toRow', () => {
  it('แปลง Loan เป็นแถว ไม่ส่ง id และ owner_id', () => {
    const { id: _id, ...expected } = row
    expect(toRow(loan)).toEqual(expected)
  })

  it('returnedDate ไม่ระบุ = null', () => {
    const { returnedDate: _r, ...noReturned } = loan
    expect(toRow(noReturned).returned_date).toBeNull()
  })

  it('แปลงไป-กลับได้ Loan เดิม', () => {
    expect(toLoan({ id: loan.id, ...toRow(loan) })).toEqual(loan)
  })
})

describe('LOAN_COLUMNS', () => {
  it('เลือกเฉพาะคอลัมน์ที่ใช้ ไม่มี owner_id', () => {
    expect(LOAN_COLUMNS.split(',').map((c) => c.trim())).toEqual(Object.keys(row))
  })
})
