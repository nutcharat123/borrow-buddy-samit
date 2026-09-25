-- Borrow Buddy v2: ตาราง loans + RLS (อ้างอิง design.md ข้อ 4 และ 6)
-- รันใน Supabase SQL Editor ได้ซ้ำโดยไม่พัง

-- ตาราง ------------------------------------------------------------------

create table if not exists public.loans (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users (id),
  friend_name   text not null,
  item_name     text not null,
  borrowed_date date not null,
  due_date      date not null,
  returned_date date,
  created_at    timestamptz not null default now(),

  constraint loans_friend_name_not_blank check (length(trim(friend_name)) > 0),
  constraint loans_item_name_not_blank   check (length(trim(item_name)) > 0),
  constraint loans_due_after_borrowed    check (due_date >= borrowed_date),
  constraint loans_returned_after_borrowed
    check (returned_date is null or returned_date >= borrowed_date)
);

create index if not exists loans_owner_id_idx on public.loans using btree (owner_id);

-- สิทธิ์ระดับตาราง: anon ทำอะไรไม่ได้, authenticated ไม่มีสิทธิ์ delete ----------

revoke all on public.loans from anon, authenticated;
grant select, insert, update on public.loans to authenticated;

-- RLS: เจ้าของเห็นและแก้ได้เฉพาะ Loan ของตัวเอง ไม่มีนโยบาย delete ------------

alter table public.loans enable row level security;

drop policy if exists "loans_select_own" on public.loans;
create policy "loans_select_own"
  on public.loans for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "loans_insert_own" on public.loans;
create policy "loans_insert_own"
  on public.loans for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "loans_update_own" on public.loans;
create policy "loans_update_own"
  on public.loans for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
