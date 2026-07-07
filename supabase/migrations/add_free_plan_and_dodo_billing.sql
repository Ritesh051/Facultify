-- Run this in the Supabase SQL Editor against the already-provisioned project.
-- (schema.sql already reflects this end state for fresh installs.)
--
-- IMPORTANT: run the three `alter type` statements below as one paste/execution,
-- then the rest separately — Postgres won't let a brand-new enum value be used
-- in the same transaction that creates it, so if your SQL editor wraps each
-- statement in its own transaction this order doesn't matter, but if it batches
-- everything into one transaction you must run the enum block first and commit
-- before running anything that references 'free', 'institution', or 'campus'.

-- ─── 1. Enum: add 'free', rename 'growth'→'institution', 'enterprise'→'campus' ─
alter type subscription_tier add value if not exists 'free' before 'starter';
alter type subscription_tier rename value 'growth' to 'institution';
alter type subscription_tier rename value 'enterprise' to 'campus';

-- ─── 2. institutions: free-tier defaults + Dodo billing columns ──────────────
alter table institutions
  alter column subscription_tier    set default 'free',
  alter column max_teachers         set default 1,
  alter column max_students         set default 20,
  alter column ai_generations_limit set default 10;

alter table institutions
  add column if not exists billing_status       text not null default 'free',
  add column if not exists dodo_customer_id     text,
  add column if not exists dodo_subscription_id text,
  add column if not exists current_period_end   timestamptz;

create unique index if not exists institutions_dodo_customer_id_idx
  on institutions (dodo_customer_id) where dodo_customer_id is not null;

-- ─── 3. Enforcement triggers: reject inserts once a plan limit is hit ────────
create or replace function enforce_teacher_limit()
returns trigger language plpgsql security definer as $$
declare
  v_max   integer;
  v_count integer;
begin
  select max_teachers into v_max from institutions where id = NEW.institution_id;
  select count(*) into v_count from teachers where institution_id = NEW.institution_id;
  if v_count >= v_max then
    raise exception 'LIMIT_TEACHERS_EXCEEDED';
  end if;
  return NEW;
end;
$$;

drop trigger if exists before_teacher_insert on teachers;
create trigger before_teacher_insert
  before insert on teachers
  for each row execute function enforce_teacher_limit();

create or replace function enforce_student_limit()
returns trigger language plpgsql security definer as $$
declare
  v_max   integer;
  v_count integer;
begin
  select max_students into v_max from institutions where id = NEW.institution_id;
  select count(*) into v_count from students where institution_id = NEW.institution_id;
  if v_count >= v_max then
    raise exception 'LIMIT_STUDENTS_EXCEEDED';
  end if;
  return NEW;
end;
$$;

drop trigger if exists before_student_insert on students;
create trigger before_student_insert
  before insert on students
  for each row execute function enforce_student_limit();

-- ─── 4. Existing rows: drop anyone still sitting above the new free-tier caps
-- into a sane starting point. Adjust/skip this if you already have real paying
-- customers whose limits should NOT be touched.
-- update institutions set max_teachers = 1, max_students = 20, subscription_tier = 'free'
--   where subscription_tier = 'free';
