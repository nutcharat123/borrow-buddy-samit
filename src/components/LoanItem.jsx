import { useState } from 'react'
import { formatThaiDate } from '../lib/dateFormat.js'
import {
  STATUS,
  STATUS_LABEL,
  getDaysOverdue,
  getLoanStatus,
  markReturned,
  validateLoan,
} from '../lib/loanRules.js'

// การ์ด Loan หนึ่งรายการ ปุ่ม: คืนแล้ว (ค่าเริ่มต้นวันนี้ เลือกวันอื่นได้), ยกเลิกการคืน, แก้ไข
// ไม่มีปุ่มลบ, busy = กำลังบันทึกรายการใดอยู่ ปิดปุ่มกันกดซ้ำ
export default function LoanItem({ loan, today, busy, onMarkReturned, onUnmarkReturned, onEdit }) {
  const status = getLoanStatus(loan, today)
  const daysOverdue = getDaysOverdue(loan, today)
  const isReturned = status === STATUS.RETURNED

  const [pickDate, setPickDate] = useState(false)
  const [returnDate, setReturnDate] = useState(today)
  const [errors, setErrors] = useState([])

  const handleMarkReturned = () => {
    const found = validateLoan(markReturned(loan, today, returnDate))
    setErrors(found)
    if (found.length > 0) return
    onMarkReturned(loan, returnDate)
  }

  return (
    <li className={`loan-card loan-${status}`}>
      <div className="loan-head">
        <div className="loan-title">
          <strong>{loan.itemName}</strong>
          <p className="loan-friend">
            <span aria-hidden="true">👤</span> เพื่อน: {loan.friendName}
          </p>
        </div>
        <span className={`status status-${status}`}>
          {STATUS_LABEL[status]}
          {status === STATUS.OVERDUE && ` ${daysOverdue} วัน`}
        </span>
      </div>

      <dl className="loan-dates">
        <div>
          <dt>วันที่ยืม</dt>
          <dd>{formatThaiDate(loan.borrowedDate)}</dd>
        </div>
        <div>
          <dt>กำหนดคืน</dt>
          <dd>{formatThaiDate(loan.dueDate)}</dd>
        </div>
        {isReturned && (
          <div>
            <dt>วันที่คืนจริง</dt>
            <dd>{formatThaiDate(loan.returnedDate)}</dd>
          </div>
        )}
      </dl>

      {!isReturned && pickDate && (
        <label className="return-date">
          วันที่คืนจริง
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </label>
      )}
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="loan-actions">
        {isReturned ? (
          <button type="button" onClick={() => onUnmarkReturned(loan)} disabled={busy}>
            ยกเลิกการคืน
          </button>
        ) : (
          <button type="button" className="mark-returned" onClick={handleMarkReturned} disabled={busy}>
            ✓ คืนแล้ว
          </button>
        )}
        <button type="button" onClick={() => onEdit(loan)} disabled={busy}>
          แก้ไข
        </button>
      </div>
      {!isReturned && !pickDate && (
        <button type="button" className="link-button" onClick={() => setPickDate(true)}>
          เลือกวันที่คืนอื่น
        </button>
      )}
    </li>
  )
}
