// แถบนำเข้าข้อมูลเดิมจาก localStorage ของเวอร์ชัน 1 (design.md ข้อ 9)
// readWarning = อ่านข้อมูลเดิมไม่ได้ จึงมีแค่ปุ่มไม่นำเข้า
export default function LocalImportBanner({ count, readWarning, importing, error, onImport, onSkip }) {
  return (
    <section className="import-banner" aria-label="นำเข้าข้อมูลเดิม">
      <p>{readWarning ?? `พบข้อมูลเดิม ${count} รายการในเครื่องนี้`}</p>
      {!readWarning && (
        <p className="hint">นำเข้าแล้วข้อมูลเดิมในเครื่องยังอยู่ ไม่ถูกลบ</p>
      )}
      {error && (
        <ul role="alert">
          <li>{error}</li>
        </ul>
      )}
      <div className="form-actions">
        {!readWarning && (
          <button type="button" className="primary" onClick={onImport} disabled={importing}>
            {importing ? 'กำลังนำเข้า…' : error ? 'ลองนำเข้าใหม่' : 'นำเข้า'}
          </button>
        )}
        <button type="button" onClick={onSkip} disabled={importing}>
          ไม่นำเข้า
        </button>
      </div>
    </section>
  )
}
