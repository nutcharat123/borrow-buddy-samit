import { describe, expect, it } from 'vitest'
import { LOAN_COLUMNS } from './loanMapper.js'
import { createLoanRepository } from './loanRepository.js'
import { ERROR_MESSAGE } from './supabaseErrors.js'

// supabase client จำลอง: บันทึกทุกการเรียกในโซ่คำสั่ง แล้วคืนผลที่กำหนด
const fakeClient = (result) => {
  const calls = []
  const builder = {
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single']) {
    builder[method] = (...args) => {
      calls.push([method, ...args])
      return builder
    }
  }
  return {
    calls,
    from: (table) => {
      calls.push(['from', table])
      return builder
    },
  }
}

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

const { id: _id, ...newLoan } = loan
const { id: _rowId, ...rowWithoutId } = row

describe('createLoanRepository', () => {
  it('ไม่มีฟังก์ชันลบ', () => {
    const repo = createLoanRepository(fakeClient({ data: [], error: null }))
    expect(Object.keys(repo).sort()).toEqual(['createLoan', 'createLoans', 'listLoans', 'updateLoan'])
  })

  it('ไม่เคยเรียก delete ไม่ว่าจะใช้ฟังก์ชันใด', async () => {
    const many = fakeClient({ data: [row], error: null })
    const one = fakeClient({ data: row, error: null })
    await createLoanRepository(many).listLoans()
    await createLoanRepository(many).createLoans([newLoan])
    await createLoanRepository(one).createLoan(newLoan)
    await createLoanRepository(one).updateLoan(loan)
    const calls = [...many.calls, ...one.calls]
    expect(calls.some(([method]) => method === 'delete')).toBe(false)
  })
})

describe('listLoans', () => {
  it('อ่านจากตาราง loans ด้วยคอลัมน์ที่กำหนด และแปลงเป็น Loan', async () => {
    const client = fakeClient({ data: [row], error: null })
    const result = await createLoanRepository(client).listLoans()
    expect(result).toEqual({ loans: [loan], error: null })
    expect(client.calls).toEqual([
      ['from', 'loans'],
      ['select', LOAN_COLUMNS],
      ['order', 'due_date', { ascending: true }],
    ])
  })

  it('ผิดพลาด = รายการว่างพร้อมข้อความไทย', async () => {
    const client = fakeClient({ data: null, error: { code: '42501' } })
    expect(await createLoanRepository(client).listLoans()).toEqual({
      loans: [],
      error: ERROR_MESSAGE.FORBIDDEN,
    })
  })

  it('client โยนข้อผิดพลาด = ไม่โยนต่อ คืนข้อความไทย', async () => {
    const client = {
      from: () => {
        throw new TypeError('Failed to fetch')
      },
    }
    expect(await createLoanRepository(client).listLoans()).toEqual({
      loans: [],
      error: ERROR_MESSAGE.NETWORK,
    })
  })
})

describe('createLoan', () => {
  it('insert แถวที่ไม่มี id แล้วคืน Loan จากเซิร์ฟเวอร์', async () => {
    const client = fakeClient({ data: row, error: null })
    expect(await createLoanRepository(client).createLoan(newLoan)).toEqual({ loan, error: null })
    expect(client.calls).toEqual([
      ['from', 'loans'],
      ['insert', rowWithoutId],
      ['select', LOAN_COLUMNS],
      ['single'],
    ])
  })

  it('ผิด check constraint = ข้อความไทย', async () => {
    const client = fakeClient({ data: null, error: { code: '23514' } })
    expect(await createLoanRepository(client).createLoan(newLoan)).toEqual({
      loan: null,
      error: ERROR_MESSAGE.INVALID_DATA,
    })
  })
})

describe('updateLoan', () => {
  it('update ตาม id โดยไม่ส่ง id และ owner_id ในข้อมูล', async () => {
    const returned = { ...row, returned_date: '2026-09-20' }
    const client = fakeClient({ data: returned, error: null })
    const result = await createLoanRepository(client).updateLoan({ ...loan, returnedDate: '2026-09-20' })
    expect(result).toEqual({ loan: { ...loan, returnedDate: '2026-09-20' }, error: null })
    expect(client.calls).toEqual([
      ['from', 'loans'],
      ['update', { ...rowWithoutId, returned_date: '2026-09-20' }],
      ['eq', 'id', 'uuid-1'],
      ['select', LOAN_COLUMNS],
      ['single'],
    ])
  })

  it('ไม่พบแถว (ไม่มีสิทธิ์หรือไม่มีอยู่) = ข้อความไทย', async () => {
    const client = fakeClient({ data: null, error: { code: 'PGRST116' } })
    expect(await createLoanRepository(client).updateLoan(loan)).toEqual({
      loan: null,
      error: ERROR_MESSAGE.NOT_FOUND,
    })
  })
})

describe('createLoans', () => {
  it('insert หลายแถวในคำสั่งเดียว', async () => {
    const client = fakeClient({ data: [row, { ...row, id: 'uuid-2' }], error: null })
    const result = await createLoanRepository(client).createLoans([newLoan, newLoan])
    expect(result).toEqual({ loans: [loan, { ...loan, id: 'uuid-2' }], error: null })
    expect(client.calls).toEqual([
      ['from', 'loans'],
      ['insert', [rowWithoutId, rowWithoutId]],
      ['select', LOAN_COLUMNS],
    ])
  })

  it('ผิดพลาด = ไม่มีรายการใดถูกเพิ่ม พร้อมข้อความไทย', async () => {
    const client = fakeClient({ data: null, error: { name: 'AuthRetryableFetchError' } })
    expect(await createLoanRepository(client).createLoans([newLoan])).toEqual({
      loans: [],
      error: ERROR_MESSAGE.NETWORK,
    })
  })
})
