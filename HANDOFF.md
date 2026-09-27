# Handoff: Borrow Buddy (สรุปส่งต่องาน)

อัปเดตล่าสุด: 2026-09-27 (เวอร์ชัน 2: เฟส 5–8 เสร็จทุกข้อ) อ่านไฟล์นี้ก่อน แล้วอ่าน [CONTEXT.md](./CONTEXT.md), [design.md](./design.md), [Tasks.md](./Tasks.md) เพื่อทำงานต่อ

## โปรเจ็กต์คืออะไร
เว็บหน้าเดียวบันทึกว่าเพื่อนยืมของอะไร เมื่อไร ต้องคืนเมื่อไร และกดคืนแล้วได้ เทคโนโลยี: React 19 + Vite 8 (JavaScript), Vitest 5

- **เวอร์ชัน 1 (เฟส 1–4) เสร็จแล้ว**: เก็บข้อมูลใน localStorage
- **เวอร์ชัน 2 (เฟส 5–8) กำลังทำ**: ย้ายข้อมูลไป Supabase, เข้าสู่ระบบด้วยอีเมล + รหัสผ่าน (ปิดสมัครเอง), RLS ให้เห็นเฉพาะ Loan ของตัวเอง, ไม่มีการลบ Loan, นำเข้าข้อมูลเดิมจาก localStorage ครั้งเดียว

## กติกาที่ต้องทำตาม
- ตอบเป็นภาษาไทยสุภาพ กระชับ ประหยัด token
- ใช้ JavaScript เท่านั้น (ไม่ใช้ TypeScript)
- ทำตามคำสั่งผู้ใช้เท่านั้น
- **ห้ามลบไฟล์โดยไม่ถามก่อน** (รวมถึงไฟล์ `.gitkeep`)
- ห้ามแสดงข้อมูลส่วนตัว **ห้ามแสดงค่าใน `.env.local` หรือรหัสผ่านในแชท**
- commit และ push เมื่อผู้ใช้สั่ง (ในเวอร์ชัน 2 ผู้ใช้สั่ง commit + push ตรง ๆ หลังจบแต่ละเฟส)
- ก่อนตั้งค่า/ใช้ไลบรารี ให้ตรวจเอกสารล่าสุดผ่าน Context7 ถ้าไม่มี Context7 ให้ใช้ WebFetch อ่านเอกสารทางการ
- เขียนเทสต์ก่อน (TDD) สำหรับโค้ดใน `src/lib`

## สถานะงานเวอร์ชัน 2

| เฟส / Task | สถานะ | Commit |
|---|---|---|
| เอกสารเวอร์ชัน 2 (design / CONTEXT / Tasks) | เสร็จ | `d196384` |
| T5.1 ปิด "Allow new users to sign up" | เสร็จ 2026-09-27 (`disable_signup: true`, signUp ได้ 422 `signup_disabled`) | – |
| T5.2 สร้างบัญชีเจ้าของ + บัญชีทดสอบ (Auto Confirm) | เสร็จ (มี 2 บัญชี ยืนยันอีเมลแล้ว) | – |
| T5.3 – T5.4 `supabase/schema.sql` (ตาราง, check, index, RLS, grant) | เสร็จ | `0b8ce55` |
| T5.5 รัน `schema.sql` บน Supabase | เสร็จ ผ่าน MCP (migration `create_loans_table_with_rls`) ตรวจนโยบาย/grant/RLS แล้ว | – |
| T5.6 ติดตั้ง supabase-js + `.env.example` + `.env.local` | เสร็จ (`.env.local` ไม่ commit) | `0b8ce55` |
| T6.1 – T6.7 ชั้นข้อมูลใน `src/lib` + เทสต์ | เสร็จ | `f2bd480` |
| เฟส 7 UI (T7.1 – T7.7) | เสร็จ ยังไม่ได้ทดลองเข้าสู่ระบบจริงในเบราว์เซอร์ | – |
| เฟส 8 ตรวจรับ | เสร็จทุกข้อ (2026-09-27) ลบ Loan ทดสอบใน Supabase แล้ว | `b75e2e6` |

`npm test` ผ่าน 117 ข้อ (9 ไฟล์ ลดลงเพราะลบเทสต์ `loadLoans`/`saveLoans`), `npm run lint` และ `npm run build` ผ่าน

ตรวจผ่าน API จริงแล้ว: รหัสผ่านผิดได้ข้อความไทยถูก, `anon` อ่าน/เขียน `loans` ไม่ได้ (42501)

## ทำต่อจากตรงนี้
1. ~~T5.1~~ เสร็จแล้ว (2026-09-27)
2. ~~`public.rls_auto_enable()`~~ ผู้ใช้รัน `revoke execute ... from public, anon, authenticated` แล้ว (2026-09-27) ยังไม่ทราบว่าผู้ใช้เปิด Leaked Password Protection แล้วหรือไม่ (API ตรวจไม่ได้)
3. ~~เฟส 8~~ ผ่านทุกข้อแล้ว (2026-09-27) ผู้ใช้ลบ Loan ทดสอบ (`friend_name like 'ทดสอบ%'`) ผ่าน SQL Editor แล้ว
4. วิธีตรวจ RLS ที่ใช้: `execute_sql` เป็นบล็อก `do` ที่ `set local role authenticated` + `request.jwt.claims` ของบัญชี A แล้ว `raise exception` ท้ายบล็อกเพื่อย้อนกลับทุกอย่าง

## โครงโค้ดปัจจุบัน
`src/lib` (ตรรกะล้วน มีเทสต์ทุกไฟล์): `today` เป็นสตริง ISO `YYYY-MM-DD` ที่ส่งเข้าฟังก์ชันเสมอ
- `loanRules.js`: `STATUS`, `STATUS_LABEL`, `getLoanStatus`, `getDaysOverdue`, `validateLoan`, `groupLoans`, `filterLoansByFriend`, `markReturned`, `unmarkReturned` (ไม่เปลี่ยนในเวอร์ชัน 2)
- `dateFormat.js`: `formatThaiDate(iso)`, `toIsoDate(date)` (ไม่เปลี่ยน)
- `theme.js`: `getInitialTheme`, `saveTheme`, `toggleTheme`, `THEME` (คีย์ `borrow-buddy:theme` ยังอยู่ใน localStorage)
- `supabaseClient.js`: `readSupabaseConfig(env)` → `{ config, error }`, `getSupabase()` → `{ client, error }` (สร้างครั้งเดียว ไม่โยนข้อผิดพลาด)
- `loanMapper.js`: `LOAN_COLUMNS`, `toLoan(row)`, `toRow(loan)` (ไม่ส่ง `id` / `owner_id`)
- `supabaseErrors.js`: `ERROR_MESSAGE`, `toThaiError(error)` → ข้อความไทย หรือ `null`
- `loanRepository.js`: `createLoanRepository(client)` → `listLoans`, `createLoan`, `updateLoan`, `createLoans` คืน `{ loans|loan, error }` error เป็นข้อความไทย **ไม่มีฟังก์ชันลบ**
- `localImport.js`: `prepareLegacyImport(items)`, `importLegacyLoans(repository, items)`
- `storage.js`: `readLegacyLoans`, `getImportMark` / `setImportMark` (คีย์ `borrow-buddy:imported:<ownerId>`, ค่า `IMPORT_MARK.IMPORTED` / `SKIPPED`) (ลบ `loadLoans` / `saveLoans` แล้วใน T7.4)

`src/components` (ไม่มีเทสต์ ตรวจด้วยมือ): `LoanForm` (`onSave` เป็น async คืน true/false), `LoanList`, `LoanItem` (prop `busy`), `SearchBox`, `ThemeToggle`, `LoginForm`, `AccountBar`, `LocalImportBanner`

`src/App.jsx`: ติดตาม session ด้วย `onAuthStateChange`, ออกจากระบบด้วย `signOut({ scope: 'local' })`, หน้าหลักอยู่ใน `OwnerHome` ที่ใส่ `key` ตาม user id เพื่อล้าง Loan เมื่อออกจากระบบ/เปลี่ยนบัญชี

`supabase/schema.sql`: รันซ้ำได้, `revoke all` จาก `anon`/`authenticated` แล้ว grant เฉพาะ select/insert/update ให้ `authenticated`, นโยบายใช้ `(select auth.uid()) = owner_id`

## ข้อตัดสินใจและสิ่งที่ควรรู้
- ใช้ **publishable key** (`VITE_SUPABASE_PUBLISHABLE_KEY`) ตามเอกสาร Supabase ล่าสุด แทน anon key ห้ามใช้ secret / service role key ในหน้าเว็บ
- `.gitignore` กัน `.env.local` แล้ว และไม่กัน `.env.example`
- ตั้งชื่อไฟล์ `supabaseErrors.js` (ไม่ใช่ `authErrors.js`) เพราะแปลงข้อผิดพลาดของฐานข้อมูลด้วย
- การนำเข้าข้อมูลเดิมไม่ลบข้อมูลใน localStorage และตรวจรูปแบบวันที่ก่อนส่ง เพื่อไม่ให้ฐานข้อมูลปฏิเสธทั้งชุด
- `npm test` = `vitest run --passWithNoTests` (Vitest ใช้สภาพแวดล้อม node) ฟังก์ชันที่ใช้ storage/client รับเป็นพารามิเตอร์เพื่อทดสอบด้วยของจำลอง
- ใน Git Bash บน Windows heredoc ที่ยาวและมีเครื่องหมาย `'` เคยพัง ให้ใช้เครื่องมือ Write เขียนไฟล์แทน
- ไฟล์เทมเพลตที่ไม่ใช้แล้ว: `src/assets/*`, `public/icons.svg` การลบต้องถามผู้ใช้ก่อน
- `src/components/.gitkeep` และ `src/lib/.gitkeep` เก็บไว้ ห้ามลบโดยไม่ถาม
- วิธีทดสอบในเบราว์เซอร์: `npm run dev` ที่ http://localhost:5173/ ล้างข้อมูลทดสอบทุกครั้งหลังตรวจ
