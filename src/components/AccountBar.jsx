// อีเมลของเจ้าของที่เข้าสู่ระบบอยู่ และปุ่มออกจากระบบ
export default function AccountBar({ email, signingOut, onSignOut }) {
  return (
    <div className="account-bar">
      <span>
        เข้าสู่ระบบเป็น <strong>{email}</strong>
      </span>
      <button type="button" onClick={onSignOut} disabled={signingOut}>
        {signingOut ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}
      </button>
    </div>
  )
}
