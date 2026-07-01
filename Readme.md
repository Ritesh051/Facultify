# Facultify

A multi-tenant education platform for institutions to manage teachers and students.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Auth | Supabase Auth (PKCE + magic links) |
| Database | Supabase PostgreSQL with RLS |
| Email | Resend |
| State | Zustand (`useAppStore`) |
| Styling | Tailwind CSS + shadcn/ui |

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# Supabase project URL (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anon key (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase service role key — server only, never expose to the browser
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend API key (from resend.com → API Keys)
RESEND_API_KEY=your-resend-api-key

# The "from" address for invite emails (must be a verified domain in Resend)
RESEND_FROM_EMAIL=invites@yourdomain.com
```

---

## Supabase Configuration

### 1. Authentication → URL Configuration

Go to **Supabase Dashboard → Authentication → URL Configuration** and configure:

**Site URL** (your production URL):
```
https://yourdomain.com
```

**Redirect URLs** — add both:
```
http://localhost:3000/**
https://yourdomain.com/**
```

The `**` wildcard covers every path (`/auth/callback`, `/invite/teacher/*`, `/dashboard`, etc.) without listing each one individually.

> **Why this matters:** Supabase validates the `redirectTo` in invite/magic-link generation against this allowlist. If the URL is not listed, Supabase silently falls back to the Site URL and the teacher invite flow breaks.

### 2. Email OTP / PKCE

Supabase projects created after mid-2023 have **PKCE for email OTPs enabled by default**. This means invite links arrive at the callback URL with `?code=` (query param) instead of `#access_token=` (URL hash). The invite acceptance page (`/invite/teacher/[id]`) handles both automatically:

- `?code=xxx` → forwards to `/auth/callback` which does the PKCE exchange server-side
- `#access_token=xxx` → handles the hash-based flow inline via `onAuthStateChange`

You do **not** need to change any PKCE settings in your Supabase project.

### 3. Email Templates

Facultify sends its own invite emails via Resend and does **not** use Supabase's built-in email templates. The Supabase "Invite user" template is never triggered by the invite flow.

### 4. Database: Required Tables

Run this in the **Supabase SQL Editor**:

```sql
-- User profiles (one row per auth.users entry)
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  institution_id uuid not null,
  role           text not null check (role in ('admin', 'teacher', 'student')),
  entity_id      uuid,
  created_at     timestamptz default now()
);

-- Institutions
create table if not exists institutions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  admin_id   uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Teachers (created by admin; user_id is null until the invite is accepted)
create table if not exists teachers (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id),
  user_id        uuid references auth.users(id),
  name           text not null,
  email          text not null,
  subject        text,
  created_at     timestamptz default now()
);

-- Students (same pattern)
create table if not exists students (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id),
  user_id        uuid references auth.users(id),
  name           text not null,
  email          text not null,
  created_at     timestamptz default now()
);
```

### 5. Row Level Security (RLS)

```sql
-- Profiles
alter table profiles enable row level security;
create policy "users read own profile" on profiles
  for select using (auth.uid() = id);
create policy "service role manages profiles" on profiles
  for all using (true) with check (true);  -- service role key bypasses RLS

-- Institutions
alter table institutions enable row level security;
create policy "admin reads own institution" on institutions
  for select using (admin_id = auth.uid());

-- Teachers
alter table teachers enable row level security;
create policy "admin reads institution teachers" on teachers
  for select using (
    institution_id = (select institution_id from profiles where id = auth.uid())
  );
create policy "teacher reads own row" on teachers
  for select using (user_id = auth.uid());

-- Students
alter table students enable row level security;
create policy "admin reads institution students" on students
  for select using (
    institution_id = (select institution_id from profiles where id = auth.uid())
  );
create policy "student reads own row" on students
  for select using (user_id = auth.uid());
```

> **Note:** The `/api/auth/finalize` and `/auth/callback` routes use the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. This is required to link teacher rows and upsert profiles for a first-time user who has no profile yet.

---

## Auth Flow

### Admin Login

```
/auth/login
  signInWithPassword()
  initSession()  →  loads profile from DB into Zustand
  /dashboard     →  role === "admin"  →  /admin
```

### Teacher Invite Flow (PKCE — modern Supabase default)

```
Admin creates teacher in /admin/teachers → clicks "Invite"
  POST /api/invite
    generateLink({ type: "invite", redirectTo: "/invite/teacher/[id]" })
    sendTeacherInviteEmail via Resend

Teacher receives email → clicks "Access My Teacher Dashboard"
  Supabase verifies OTP → redirects to /invite/teacher/[id]?code=xxx

/invite/teacher/[id] page detects ?code=xxx
  → router.replace("/auth/callback?code=xxx")

/auth/callback (route handler, server-side)
  exchangeCodeForSession(code)         — exchanges code for tokens, sets cookies
  look up teachers row by user email
  upsert profiles row { role: "teacher", entity_id: teacher.id }
  update teachers.user_id = user.id
  → redirect /dashboard

/dashboard
  initSession()  →  role === "teacher"
  → /teacher
```

### Teacher Invite Flow (hash — older Supabase projects)

```
Teacher receives email → clicks "Access My Teacher Dashboard"
  Supabase redirects to /invite/teacher/[id]#access_token=xxx

/invite/teacher/[id] page detects #access_token= in hash
  supabase.auth.onAuthStateChange → SIGNED_IN fires
  POST /api/auth/finalize
    links teachers row + upserts profiles
    returns { destination: "/dashboard" }
  → router.replace("/dashboard") → /teacher
```

### /dashboard — The Central Entry Point

Every auth flow lands here. It runs `initSession()` fresh, then routes by role:

| Role | Redirect |
|------|----------|
| `admin` | `/admin` |
| `teacher` | `/teacher` |
| `student` | `/student` |
| no profile | `/auth/login` |

---

## Key Files

| File | Purpose |
|------|---------|
| `app/api/invite/route.ts` | Generates Supabase invite link, sends custom email via Resend |
| `app/invite/teacher/[teacherId]/page.tsx` | Invite acceptance — detects PKCE vs hash flow automatically |
| `app/auth/callback/route.ts` | PKCE code exchange; links teacher/student rows; redirects to `/dashboard` |
| `app/api/auth/finalize/route.ts` | Hash-flow server action; links rows; returns `{ destination }` |
| `app/dashboard/page.tsx` | Role-based router — single entry point after any login or invite |
| `app/teacher/layout.tsx` | Guards `/teacher/*`; redirects non-teachers to `/dashboard` |
| `app/admin/layout.tsx` | Guards `/admin/*`; redirects non-admins to `/dashboard` |
| `app/student/layout.tsx` | Guards `/student/*`; redirects non-students to `/dashboard` |
| `store/app-store.ts` | Zustand store — `initSession()` fetches profile + entity data from DB |
| `middleware.ts` | Refreshes session cookies; redirects unauthenticated users to login |
| `lib/email.ts` | Resend HTML email template for teacher invites |

---

## Common Issues

**Teacher still gets redirected to /admin after accepting invite**

The layouts use a `ready` flag (useState) to block the role check until `initSession()` completes. If you see this in development, hard-refresh the page. The stale Zustand state from the previous admin session is cleared when `initSession()` runs.

**Invite link opens to /auth/login with `?error=invalid_link`**

The `?code=` or `#access_token=` is missing from the URL. This means:
1. The link was already used (one-time-use), or
2. The link expired (default: 24 hours in Supabase), or
3. The `redirectTo` URL was not in the Supabase allowlist, so Supabase stripped the token.

Fix: re-send the invite from the admin dashboard. Ensure the redirect URL is in the Supabase allowlist.

**"Invalid redirect URL" error from /api/invite**

The app origin is not in your Supabase redirect URLs allowlist. Add `http://localhost:3000/**` (development) and `https://yourdomain.com/**` (production) to **Authentication → URL Configuration → Redirect URLs**.

---

## Local Development

```bash
npm install
npm run dev   # http://localhost:3000
```

Ensure `http://localhost:3000/**` is in your Supabase redirect URLs before testing invite flows locally.
