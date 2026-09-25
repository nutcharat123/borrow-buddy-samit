import { validateLoan } from './loanRules.js'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// วันที่ต้องเป็น 'YYYY-MM-DD' และมีอยู่จริง (กัน 2026-02-30 ที่ฐานข้อมูลจะปฏิเสธทั้งชุด)
function isIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

// แปลงข้อมูลเดิมหนึ่งรายการเป็น Loan ที่ไม่มี id หรือ null ถ้ารูปแบบหรือกติกาผิด
function toImportableLoan(item) {
  if (!item || typeof item !== 'object') return null
  const { friendName, itemName, borrowedDate, dueDate } = item
  const returnedDate = item.returnedDate ?? null
  if (typeof friendName !== 'string' || typeof itemName !== 'string') return null
  if (!isIsoDate(borrowedDate) || !isIsoDate(dueDate)) return null
  if (returnedDate !== null && !isIsoDate(returnedDate)) return null
  const loan = { friendName, itemName, borrowedDate, dueDate, returnedDate }
  return validateLoan(loan).length === 0 ? loan : null
}

// แยก Loan เดิมเป็นรายการที่นำเข้าได้ (ตัด id เดิมออก) และจำนวนที่ผิด
export function prepareLegacyImport(items) {
  const valid = []
  let invalidCount = 0
  for (const item of items) {
    const loan = toImportableLoan(item)
    if (loan) valid.push(loan)
    else invalidCount += 1
  }
  return { valid, invalidCount }
}

// นำเข้าข้อมูลเดิมครั้งเดียวผ่าน repository (insert ชุดเดียว)
export async function importLegacyLoans(repository, items) {
  const { valid, invalidCount } = prepareLegacyImport(items)
  if (valid.length === 0) {
    return { loans: [], importedCount: 0, skippedCount: invalidCount, error: null }
  }
  const { loans, error } = await repository.createLoans(valid)
  if (error) return { loans: [], importedCount: 0, skippedCount: 0, error }
  return { loans, importedCount: loans.length, skippedCount: invalidCount, error: null }
}
