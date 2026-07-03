-- Run this in the Supabase SQL Editor if `tests` was created before this feature existed.
-- (schema.sql already includes these columns for fresh installs.)

alter table tests
  add column if not exists result_delay_minutes integer not null default 2,
  add column if not exists results_declared     boolean not null default false,
  add column if not exists results_declared_at  timestamptz;
