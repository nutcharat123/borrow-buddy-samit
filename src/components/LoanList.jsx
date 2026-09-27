import { STATUS_LABEL, groupLoans } from '../lib/loanRules.js'
import LoanItem from './LoanItem.jsx'

// แสดงเฉพาะกลุ่มใน statuses ตามลำดับที่ส่งมา (แต่ละกลุ่มเรียงจาก groupLoans แล้ว)
export default function LoanList({ loans, statuses, today, busy, onMarkReturned, onUnmarkReturned, onEdit }) {
  const groups = groupLoans(loans, today)
  const shown = statuses.filter((status) => groups[status].length > 0)

  if (shown.length === 0) {
    return (
      <p className="empty-state">
        <span aria-hidden="true">🎉</span> ไม่มีรายการ
      </p>
    )
  }

  return (
    <div className="loan-groups">
      {shown.map((status) => (
        <section key={status}>
          <h2 className={`group-title group-${status}`}>
            {STATUS_LABEL[status]} ({groups[status].length})
          </h2>
          <ul className="loan-list">
            {groups[status].map((loan) => (
              <LoanItem
                key={loan.id}
                loan={loan}
                today={today}
                busy={busy}
                onMarkReturned={onMarkReturned}
                onUnmarkReturned={onUnmarkReturned}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
