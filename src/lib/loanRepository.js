import { LOAN_COLUMNS, toLoan, toRow } from './loanMapper.js'
import { toThaiError } from './supabaseErrors.js'

const TABLE = 'loans'

// รันคำสั่ง Supabase แล้วคืน { data, error } เสมอ error เป็นข้อความไทย ไม่โยนต่อ
async function run(buildQuery) {
  try {
    const { data, error } = await buildQuery()
    return { data, error: toThaiError(error) }
  } catch (thrown) {
    return { data: null, error: toThaiError(thrown) }
  }
}

// client รับเป็นพารามิเตอร์ เพื่อให้ทดสอบด้วย client จำลองได้
// ตั้งใจไม่มีฟังก์ชันลบ Loan (design.md ข้อ 6)
export function createLoanRepository(client) {
  return {
    async listLoans() {
      const { data, error } = await run(() =>
        client.from(TABLE).select(LOAN_COLUMNS).order('due_date', { ascending: true }),
      )
      return { loans: error ? [] : data.map(toLoan), error }
    },

    async createLoan(loan) {
      const { data, error } = await run(() =>
        client.from(TABLE).insert(toRow(loan)).select(LOAN_COLUMNS).single(),
      )
      return { loan: error ? null : toLoan(data), error }
    },

    async updateLoan(loan) {
      const { data, error } = await run(() =>
        client.from(TABLE).update(toRow(loan)).eq('id', loan.id).select(LOAN_COLUMNS).single(),
      )
      return { loan: error ? null : toLoan(data), error }
    },

    // insert หลายรายการในคำสั่งเดียว สำเร็จทั้งหมดหรือไม่มีรายการใดถูกเพิ่ม
    async createLoans(loans) {
      const { data, error } = await run(() =>
        client.from(TABLE).insert(loans.map(toRow)).select(LOAN_COLUMNS),
      )
      return { loans: error ? [] : data.map(toLoan), error }
    },
  }
}
