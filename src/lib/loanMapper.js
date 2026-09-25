// คอลัมน์ที่แอปอ่านจากตาราง loans (ไม่อ่าน owner_id เพราะ RLS กรองให้แล้ว)
export const LOAN_COLUMNS = 'id, friend_name, item_name, borrowed_date, due_date, returned_date'

// แถวในตาราง (snake_case) -> Loan ที่แอปใช้ (camelCase)
export function toLoan(row) {
  return {
    id: row.id,
    friendName: row.friend_name,
    itemName: row.item_name,
    borrowedDate: row.borrowed_date,
    dueDate: row.due_date,
    returnedDate: row.returned_date,
  }
}

// Loan -> ข้อมูลสำหรับ insert/update ไม่ส่ง id และ owner_id ให้ฐานข้อมูลกำหนดเอง
export function toRow(loan) {
  return {
    friend_name: loan.friendName,
    item_name: loan.itemName,
    borrowed_date: loan.borrowedDate,
    due_date: loan.dueDate,
    returned_date: loan.returnedDate ?? null,
  }
}
