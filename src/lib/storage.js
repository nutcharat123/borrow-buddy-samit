export const STORAGE_KEY = 'borrow-buddy:loans'

export const LOAD_WARNING = 'อ่านข้อมูลเดิมไม่ได้ จึงเริ่มด้วยรายการว่าง ข้อมูลเดิมยังไม่ถูกลบจนกว่าจะบันทึกรายการใหม่'
export const SAVE_WARNING = 'บันทึกข้อมูลไม่สำเร็จ ข้อมูลล่าสุดอาจไม่ถูกเก็บไว้'

// storage รับเป็นพารามิเตอร์ เพื่อให้ทดสอบด้วย storage จำลองได้
// อ่านอย่างเดียว ไม่เขียนอะไรกลับ เพื่อไม่ทับข้อมูลเดิมที่อ่านไม่ได้
export function loadLoans(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return { loans: [], warning: null }
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return { loans: [], warning: LOAD_WARNING }
    return { loans: data, warning: null }
  } catch {
    return { loans: [], warning: LOAD_WARNING }
  }
}

// คืน null เมื่อสำเร็จ หรือข้อความเตือนภาษาไทยเมื่อบันทึกไม่ได้
export function saveLoans(loans, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(loans))
    return null
  } catch {
    return SAVE_WARNING
  }
}

// ---- เวอร์ชัน 2: นำเข้าข้อมูลเดิม (design.md ข้อ 9) ----

export const LEGACY_READ_WARNING = 'อ่านข้อมูลเดิมในเครื่องนี้ไม่ได้ จึงนำเข้าไม่ได้ ข้อมูลเดิมยังไม่ถูกแก้ไข'
export const IMPORT_MARK_WARNING = 'จำสถานะการนำเข้าข้อมูลเดิมไม่ได้ ระบบอาจถามซ้ำในครั้งหน้า'
export const IMPORT_MARK_PREFIX = 'borrow-buddy:imported:'
export const IMPORT_MARK = { IMPORTED: 'imported', SKIPPED: 'skipped' }

// อ่าน Loan เดิมของเวอร์ชัน 1 อย่างเดียว ไม่เขียนหรือลบคีย์เดิม
export function readLegacyLoans(storage = globalThis.localStorage) {
  const { loans, warning } = loadLoans(storage)
  return { loans, warning: warning && LEGACY_READ_WARNING }
}

// เครื่องหมายแยกตามบัญชีเจ้าของ คืน IMPORT_MARK.* หรือ null ถ้ายังไม่เคยตั้ง
export function getImportMark(ownerId, storage = globalThis.localStorage) {
  try {
    const value = storage.getItem(IMPORT_MARK_PREFIX + ownerId)
    return Object.values(IMPORT_MARK).includes(value) ? value : null
  } catch {
    return null
  }
}

// คืน null เมื่อสำเร็จ หรือข้อความเตือนภาษาไทยเมื่อบันทึกไม่ได้
export function setImportMark(ownerId, mark, storage = globalThis.localStorage) {
  try {
    storage.setItem(IMPORT_MARK_PREFIX + ownerId, mark)
    return null
  } catch {
    return IMPORT_MARK_WARNING
  }
}
