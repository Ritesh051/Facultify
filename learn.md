# Facultify — Architecture Guide

A plain-language walkthrough of how this project is built, what every technology does, and *why* each decision was made.

---

## Table of Contents

1. [What is Facultify?](#1-what-is-facultify)
2. [Tech Stack](#2-tech-stack)
3. [Project Folder Structure](#3-project-folder-structure)
4. [The Three Roles](#4-the-three-roles)
5. [How Pages are Protected](#5-how-pages-are-protected)
6. [The Database](#6-the-database)
7. [Row Level Security — How Data is Isolated](#7-row-level-security--how-data-is-isolated)
8. [Authentication Flow](#8-authentication-flow)
9. [Session State — Zustand Store](#9-session-state--zustand-store)
10. [The Service Layer](#10-the-service-layer)
11. [Email Invites — Resend](#11-email-invites--resend)
12. [Key Engineering Decisions](#12-key-engineering-decisions)
13. [Dashboards — What's Built](#13-dashboards--whats-built)
14. [Glossary](#14-glossary)

---

## 1. What is Facultify?

Facultify is a **multi-tenant SaaS platform** for educational institutions.

- **SaaS** = Software as a Service. Users sign up and use the app without installing anything.
- **Multi-tenant** = Multiple schools/institutions share the same app and database, but each one can only see its own data. School A cannot see School B's teachers, students, or tests.

Each institution has three types of users:

| Role | What they do |
|---|---|
| **Admin** | Owns the institution account. Manages teachers, views analytics, handles billing. |
| **Teacher** | Creates tests, manages student batches, grades submissions. |
| **Student** | Takes tests, views results and personal analytics. |

---

## 2. Tech Stack

### Framework & Language

**Next.js 15 (App Router)**
- Next.js is a framework built on top of React. It handles both the frontend (pages) and backend (API routes) in a single project.
- The "App Router" is how Next.js 13+ organizes pages. Each folder inside `app/` becomes a URL. A file called `page.tsx` inside `app/admin/` becomes the `/admin` page.
- **Why Next.js?** Because it gives you server-side rendering, API routes, middleware, and file-based routing all in one. You don't need a separate Express backend.

**TypeScript**
- TypeScript is JavaScript with types. Instead of `const user = {}`, you write `const user: User = {}` and TypeScript tells you immediately if you're using a field that doesn't exist.
- **Why?** Catches bugs before runtime. When you have 10 tables and 50 functions, knowing the exact shape of your data is essential.

---

### UI & Styling

**Tailwind CSS**
- A utility-first CSS library. Instead of writing `.card { padding: 16px; background: white; }` in a separate file, you write `className="p-4 bg-white"` directly on the element.
- **Why?** Faster to write. No context switching between JS and CSS files. Consistent spacing.

**shadcn/ui**
- A collection of pre-built, accessible UI components (buttons, dialogs, tables, dropdowns, etc.).
- Unlike most UI libraries, shadcn/ui doesn't come as an npm package you import. Instead, you *copy* the component source code into your project (`components/ui/`). You own the code.
- **Why?** You can customize every component exactly. No fighting a library's CSS. No bundle size surprises.

**Recharts**
- A React library for drawing charts (bar charts, line charts, pie charts).
- **Why?** Simple React-first API. Used for analytics dashboards.

**Sonner**
- Shows small notification messages ("toast" notifications) at the corner of the screen.
- **Why?** Minimal, looks good, one-line API: `toast.success("Teacher added!")`.

**Lucide React**
- An icon library. Every icon in the app (`<Users />`, `<GraduationCap />`, etc.) comes from here.

---

### Backend & Database

**Supabase**
Supabase is the entire backend. It provides:
1. **PostgreSQL database** — A powerful relational database.
2. **Supabase Auth** — User signup, login, magic links, and invite emails.
3. **Row Level Security (RLS)** — Security rules written directly in the database so users can only see their own data.
4. **Edge Functions** — Serverless functions that run close to users (used for AI test generation).
5. **JavaScript SDK** — A client library that talks to all of the above from your app.

**Why Supabase?** It replaces what would otherwise need to be a whole separate backend (Node.js + Express + Postgres + Auth system + email setup). One service handles everything.

**Resend**
- A service for sending transactional emails (emails triggered by user actions, like "you've been invited").
- **Why Resend instead of Supabase's built-in emails?** Supabase can send invite emails, but the template is plain and you can't customize it from code. With Resend, you write real HTML emails with the teacher's name, the institution name, and a styled button — all dynamically filled in.

---

### State Management

**Zustand**
- A simple global state library. Think of it as a shared box that any component in the app can read from or write to.
- **Why Zustand?** The logged-in user's data (their name, role, institution) needs to be available everywhere — in the nav bar, on every page, in every component. Zustand stores this once and any component can read it without prop drilling.
- **Why not Redux?** Redux is far more complex with boilerplate. Zustand is simpler and sufficient for this use case.

---

## 3. Project Folder Structure

```
Facultify/
│
├── app/                         ← Everything Next.js serves as pages or API
│   ├── page.tsx                 ← Landing page (public, no login needed)
│   ├── dashboard/
│   │   └── page.tsx             ← Universal router: reads role → redirects to right dashboard
│   ├── onboard/
│   │   └── page.tsx             ← 4-step institution setup wizard
│   ├── auth/
│   │   ├── login/page.tsx       ← Email + password login
│   │   ├── signup/page.tsx      ← New admin account creation
│   │   ├── callback/route.ts    ← PKCE code → session exchange + profile creation
│   │   └── confirm/page.tsx     ← Hash-based (#access_token) token handler
│   ├── invite/
│   │   └── teacher/[teacherId]/
│   │       └── page.tsx         ← Invite link landing: handles both PKCE and hash flows
│   ├── admin/
│   │   ├── layout.tsx           ← Auth guard: must be logged in as admin
│   │   ├── page.tsx             ← Admin dashboard
│   │   ├── teachers/page.tsx    ← Manage and invite teachers
│   │   ├── analytics/page.tsx   ← Institution-wide charts (live data)
│   │   ├── billing/page.tsx     ← Subscription and invoices
│   │   └── settings/page.tsx    ← Institution settings
│   ├── teacher/
│   │   ├── layout.tsx           ← Auth guard + nav/sidebar for teacher
│   │   ├── page.tsx             ← Teacher dashboard
│   │   ├── [id]/page.tsx        ← Invite landing redirect → /teacher
│   │   ├── create-test/         ← 3-step test builder
│   │   ├── tests/               ← View and manage tests
│   │   ├── ai-generator/        ← AI-powered test creation
│   │   ├── checking/            ← Grade submissions
│   │   └── students/page.tsx    ← Full student & batch management (live data)
│   ├── student/
│   │   ├── layout.tsx           ← Auth guard + nav/sidebar for student
│   │   ├── page.tsx             ← Student dashboard
│   │   ├── tests/               ← Upcoming and past tests
│   │   ├── test/[id]/           ← Live exam interface
│   │   ├── analytics/           ← Personal performance
│   │   └── profile/             ← Student profile
│   └── api/
│       ├── auth/
│       │   └── finalize/route.ts ← POST: server-side profile creation + role routing
│       ├── invite/route.ts       ← POST: send teacher invite email
│       └── invite-student/
│           └── route.ts          ← POST: send student invite email
│
├── components/
│   ├── ui/                      ← 28 shadcn/ui base components
│   ├── dashboards/              ← Nav, sidebar, stats cards, page headers
│   ├── marketing/               ← Landing page sections
│   └── testing/                 ← Exam timer, question display
│
├── lib/
│   ├── supabase-service.ts      ← ALL database functions live here
│   ├── email.ts                 ← HTML email templates (teacher + student)
│   ├── types.ts                 ← TypeScript types for every entity
│   ├── utils.ts                 ← Helpers: formatDate, timeAgo, cn(), etc.
│   ├── mock-data.ts             ← Subscription plan config (only real use)
│   └── supabase/
│       ├── client.ts            ← Browser Supabase client (Client Components)
│       ├── server.ts            ← Server Supabase client (Route Handlers)
│       └── admin.ts             ← Service-role client (bypasses all RLS)
│
├── store/
│   └── app-store.ts             ← Zustand store: logged-in user session
│
├── supabase/
│   └── schema.sql               ← Full database schema (run once in Supabase)
│
├── middleware.ts                 ← Runs before EVERY request: checks auth cookie
└── .env.local                   ← Secret keys (never commit this file)
```

---

## 4. The Three Roles

### Admin
The institution owner. Signs up, completes onboarding, and manages everything.

**Can do:**
- Invite teachers by email
- Activate or deactivate teacher accounts
- View institution-wide analytics (test volume, student performance, subject breakdown)
- Manage billing and subscription plan
- Edit institution settings (name, domain)

**Cannot do:** Create tests, add students, grade submissions (those belong to teachers).

---

### Teacher
Added by the admin via email invite.

**Can do:**
- Create tests (manual 3-step builder or AI-generated)
- Create student batches (groups of students)
- Add students to batches (students also get an email invite)
- Grade written answers with feedback
- View their class analytics

**Cannot do:** See other teachers' tests or students, access billing or admin settings.

---

### Student
Added by a teacher via email invite.

**Can do:**
- Take tests assigned to their batch
- View their past results and scores
- See personal analytics (score history, subject breakdown)
- View their profile

**Cannot do:** See other students' submissions, access teacher/admin pages, create anything.

---

## 5. How Pages are Protected

There are **two layers** of protection:

### Layer 1 — Middleware (`middleware.ts`)

Middleware runs **before any request reaches a page**. It runs at the "edge" (before the server even processes the request).

What it does:
1. Checks if you have a valid Supabase session cookie.
2. If you try to visit `/admin`, `/teacher`, `/student`, `/dashboard`, or `/onboard` without a session → redirect to `/auth/login` (preserving the intended destination via `?next=`).
3. If you have a session → let the request through.
4. `/invite/*` is **intentionally public** — unauthenticated teachers and students land there to accept their invite and set up their account.

This is a fast first check. It doesn't check your *role* — just whether you're logged in at all.

### Layer 2 — Layout Auth Guards

Every protected section has a `layout.tsx` file. This layout:
1. Calls `initSession()` from the Zustand store (loads your user data from Supabase).
2. Checks your role. If the role doesn't match the section (e.g. a teacher visiting `/admin`), redirects to `/dashboard`, which then re-routes them to the right place.
3. While loading, shows a role-coloured spinner (blue for admin/teacher, orange for student).

**Why two layers?** Middleware is very fast but only checks the cookie, not the role. The layout does the deeper role check with actual DB data.

### The `/dashboard` Page — Universal Router

`app/dashboard/page.tsx` is a thin client page that:
1. Calls `initSession()` to load the user's session.
2. Reads `activeSession.role`.
3. Immediately redirects: `admin → /admin`, `teacher → /teacher`, `student → /student`.
4. Shows a spinner with the Facultify logo while deciding.

This is the safe landing zone. Layouts redirect role-mismatched users here instead of hardcoding `/auth/login`, so a teacher accidentally visiting `/admin` ends up at their own dashboard rather than being logged out.

---

## 6. The Database

Supabase uses **PostgreSQL** — a powerful relational database. The full schema is in `supabase/schema.sql`.

### Tables

| Table | What it stores |
|---|---|
| `institutions` | One row per school/institution. Stores name, domain, subscription plan, teacher/student limits. |
| `profiles` | Links a Supabase Auth user (their login account) to a role and an entity row. This is the glue between "who is logged in" and "who are they in the app". |
| `teachers` | Teacher records. `user_id` is empty until the teacher accepts their invite and creates an account. |
| `batches` | Groups of students (e.g. "Class 11 — Section A"). Created by a teacher. |
| `students` | Student records with batch and teacher assignment. |
| `tests` | Test configurations — title, subject, duration, schedule, status (draft/published/active/closed). |
| `questions` | Questions belonging to a test. Supports MCQ, True/False, and Written types. |
| `question_options` | Answer options for MCQ and True/False questions. |
| `submissions` | One row per student-test pair. Tracks status: not_started → in_progress → submitted → graded. |
| `submission_answers` | One row per question per submission. Stores the student's answer and grading result. |
| `invoices` | Billing invoices per institution. |

### Automatic Triggers (Database-Level Logic)

Two things happen automatically inside the database when data changes — no application code needed:

1. **When a submission is saved or graded:** A trigger recalculates `tests.attempt_count` and `tests.avg_score`. This means the test card always shows up-to-date stats without a complex query each time.

2. **When a student is added or removed:** A trigger updates `batches.student_count`. Instant, accurate counts.

### `teachers_with_stats` View

A database view that joins `teachers` with live counts from `students` and `tests`. When the app loads teacher data, it reads from this view instead of the raw table to get `studentCount` and `testCount` in one query.

---

## 7. Row Level Security — How Data is Isolated

**The Problem:** All institutions share the same database tables. Without any protection, a teacher at School A could theoretically query `SELECT * FROM students` and see students from every school.

**The Solution: Row Level Security (RLS)**

RLS is a PostgreSQL feature where you write rules directly in the database:  
*"A user can only SELECT rows where [condition]."*

These rules are enforced by the **database itself**, not just the application. Even if someone bypasses the app code, the database rejects the query.

### The Three Helper Functions

To make RLS policies readable, the schema defines three helper functions:

```sql
auth_institution_id()  -- returns the logged-in user's institution ID
auth_role()            -- returns 'admin', 'teacher', or 'student'
auth_entity_id()       -- returns the user's specific row ID (teacher.id or student.id)
```

These functions query the `profiles` table to figure out who the currently logged-in user is.

### Example — Student Test Visibility

A student can only see tests that are:
- From their institution
- NOT a draft
- Assigned to their specific batch

```sql
create policy "tests_select" on tests for select to authenticated
  using (
    institution_id = auth_institution_id() AND  -- same school
    status != 'draft' AND                        -- not a draft
    batch_id = (
      select batch_id from students where id = auth_entity_id()  -- their batch
    )
  );
```

If a student tries to fetch tests from another batch or another school, the database silently returns zero rows.

---

## 8. Authentication Flow

### How an Admin Signs Up

1. Admin visits `/auth/signup` and fills in email + password.
2. Supabase sends a **confirmation email** with a verification link.
3. Admin clicks the link → browser goes to `/auth/callback?code=XXX`.
4. The callback route exchanges the code for a session, checks if a `profiles` row exists — none does yet — and redirects to `/onboard`.
5. Admin completes the 4-step onboarding wizard (institution name, plan, etc.).
6. On submit, `onboardInstitution()` creates the institution row and profile row in the database.
7. Admin is redirected to `/admin` dashboard.

### How a Teacher is Invited

1. Admin fills in teacher name, email, subject on the Teachers page.
2. Page calls `POST /api/invite` (a server-side API route).
3. The route uses the **service-role client** (see below) to call `supabase.auth.admin.generateLink({ type: 'invite', email })`.
4. Supabase creates a one-time magic link and returns it — **without** sending any email.
5. The route passes that magic link to `sendTeacherInviteEmail()` in `lib/email.ts`.
6. Resend sends a branded HTML email to the teacher with a "Access My Teacher Dashboard" button. The link points to `/invite/teacher/[teacherId]`.
7. Teacher clicks the button → browser lands on `/invite/teacher/[teacherId]`.
8. That page detects whether the URL has `?code=` (PKCE flow) or `#access_token=` (implicit/hash flow) and handles both:
   - **PKCE (`?code=`)**: navigates to `/auth/callback?code=XXX` so the server can exchange it.
   - **Hash (`#access_token=`)**: calls `supabase.auth.setSession()` in the browser, then POSTs to `/api/auth/finalize`.
9. `/api/auth/finalize` (server-side) finds the `teachers` row by email, creates the `profiles` row, links `teachers.user_id`, and returns `{ destination: "/teacher" }`.
10. Teacher is redirected to `/teacher` dashboard.

### How a Student is Invited

Same flow as a teacher, but:
- Triggered from the teacher's Students page (`/teacher/students`)
- Uses `POST /api/invite-student`
- Email says "Your teacher [Teacher Name] has added you..." and shows the batch name
- `/api/auth/finalize` links to the `students` table instead and returns `{ destination: "/student" }`

### The `/auth/callback` Route (PKCE flow)

Handles the server-side PKCE code exchange:

```
User arrives at /auth/callback?code=XXX
  → exchangeCodeForSession(code) — sets session cookie
  → Get user from Supabase
  → Does teachers table have a row with this email?
        YES → upsert profiles + link teacher row → redirect /teacher
        NO  → Does students table have a row with this email?
                  YES → upsert profiles + link student row → redirect /student
                  NO  → Does profiles row exist?
                            YES → redirect to their role's dashboard
                            NO  → New admin with no institution → redirect /onboard
```

Uses the **service-role client** for the teacher/student lookup so that newly invited users (who have no `profiles` row yet) can be found.

### The `/auth/confirm` Page (Hash/Implicit flow)

Some email clients (or Supabase configurations) send `#access_token=` in the URL fragment instead of `?code=`. The fragment never reaches the server, so a client-side page (`app/auth/confirm/page.tsx`) handles it:

1. Reads `window.location.hash` and extracts `access_token` + `refresh_token`.
2. Calls `supabase.auth.setSession()` to store the tokens in cookies.
3. POSTs to `/api/auth/finalize` which does the same profile-creation logic as the PKCE callback.
4. Redirects to the returned destination.

### The `/api/auth/finalize` Endpoint

A server-side `POST` route that consolidates all profile-creation logic:

```
POST /api/auth/finalize
  → Read session from cookies (set by the client before calling this)
  → Get user from Supabase
  → Does teachers table have a row with this email?
        YES → upsert profiles + link teacher → return { destination: "/teacher" }
        NO  → Does students table have a row with this email?
                  YES → upsert profiles + link student → return { destination: "/student" }
                  NO  → Does profiles row exist?
                            YES → return { destination: "/admin" | "/teacher" | "/student" }
                            NO  → return { destination: "/onboard" }
```

This is the same logic as `/auth/callback`, but exposed as an API so the client-side hash-flow pages can call it after setting the session client-side.

---

## 9. Session State — Zustand Store

### What is it?

The Zustand store (`store/app-store.ts`) holds the **currently logged-in user's full profile** in memory. It's available to every component without passing props.

### The Session Shape

```typescript
// Three possible states — one per role
type ActiveSession =
  | { role: 'admin';   user: Institution & { adminName: string } }
  | { role: 'teacher'; user: Teacher; institution: Institution }
  | { role: 'student'; user: Student; institution: Institution; teacher: Teacher }
```

A student session knows their student data, their institution, AND their teacher. A teacher session knows their teacher data and institution. An admin session knows their institution.

### How `initSession()` Works

Every dashboard layout calls `initSession()` when it mounts:

1. Call `supabase.auth.getUser()` — get the currently authenticated user.
2. Query `profiles` table with their user ID — get their role and entity ID.
3. Based on the role, fetch the full entity data:
   - Admin → fetch institution row
   - Teacher → fetch teacher row (from `teachers_with_stats` view) + institution row (parallel)
   - Student → fetch student row, then institution + teacher rows in parallel
4. Set `activeSession` in the store.

A **guard** (`_initInFlight` flag) prevents two simultaneous `initSession()` calls (all three layouts mount at the same time when the dashboard first loads, and without the guard they'd all fire concurrent database queries).

### Teacher Session Fallback

For teachers, `initSession()` first tries the `teachers_with_stats` database view (which includes `studentCount` and `testCount`). If the view isn't available or returns nothing, it falls back to the base `teachers` table and sets counts to 0. This keeps the app working even if the view hasn't been created in a new Supabase project yet.

---

## 10. The Service Layer

`lib/supabase-service.ts` is the **single place where all database operations live**. No page or component queries Supabase directly — they all call a function from this file.

### Why a Service Layer?

- **Single source of truth.** If the `teachers` table column changes, you fix it in one place.
- **Translation.** The database uses `snake_case` column names (`institution_id`, `joined_at`). The app uses `camelCase` (`institutionId`, `joinedAt`). Mapper functions handle this translation.
- **Testability.** You can swap the service layer for a mock (the old `mock-service.ts`) without changing any page.

### Mapper Functions

Every table has a private mapper:

```typescript
function toTeacher(row: any): Teacher {
  return {
    id:           row.id,
    institutionId: row.institution_id,   // snake_case → camelCase
    name:         row.name,
    email:        row.email,
    subject:      row.subject,
    isActive:     row.is_active,
    joinedAt:     row.joined_at,
    studentCount: row.student_count ?? 0,
    testCount:    row.test_count ?? 0,
  };
}
```

The rest of the app works with clean `Teacher` TypeScript objects. It never sees raw database rows.

### Why the Untyped Client?

The service uses `createBrowserClient()` without the `<Database>` TypeScript generic. This is intentional.

Supabase auto-generates TypeScript types for your database (`lib/database.types.ts`). Using them as a generic sounds great, but it requires a `Relationships` key on every table definition. When that key is missing, TypeScript collapses the type to `never`, and every function in the service breaks.

The mapper functions already provide type safety at the domain boundary. An untyped client + typed mappers is safer and less painful than fighting the generated types.

---

## 11. Email Invites — Resend

### Why Not Supabase's Built-in Email?

Supabase Auth can send invite emails automatically. The problem is the email it sends is a plain system template:

> *"You have been invited. Click here to accept."*

You cannot customize it from code. You can't add the teacher's name, the institution name, or a styled button.

The student invite needs to say **"[Teacher Name] has added you to Facultify"** — that's impossible with Supabase's default template.

### The Flow

Instead of using `inviteUserByEmail()` (which sends Supabase's default email), the app uses `generateLink()`:

1. `generateLink({ type: 'invite', email })` — creates the auth magic link and **returns it** without sending any email.
2. That link is passed to `lib/email.ts`.
3. Resend sends a fully custom HTML email with the link embedded in a button.

### The Two Email Templates (`lib/email.ts`)

**Teacher email:**
- Subject: "You've been invited to [Institution] on Facultify"
- Body: Welcome message, feature list, CTA button → "Access My Teacher Dashboard"

**Student email:**
- Subject: "[Teacher Name] added you to Facultify — set up your account"
- Body: Info card showing Teacher, Batch, Institution; CTA button → "Set Up My Student Account"

### Already Registered Users

If a teacher or student already has a Supabase account (maybe they signed up before being invited), `generateLink({ type: 'invite' })` fails.

The fallback: try `generateLink({ type: 'magiclink' })` instead, which sends a sign-in link for existing accounts.

---

## 12. Key Engineering Decisions

### The Onboarding RLS Bootstrap Problem

**Problem:** When a new admin signs up, their `profiles` row doesn't exist yet. But the database's security rule for reading `institutions` calls `auth_institution_id()`, which reads from `profiles`. Circular dependency — profiles doesn't exist, so the institution can't be read, so we can't complete onboarding.

**Solution in `onboardInstitution()`:**
1. Generate the institution UUID **client-side** using `crypto.randomUUID()` (don't let the database generate it).
2. Insert the institution row (the INSERT policy is unrestricted).
3. **Immediately** insert the `profiles` row.
4. Only **then** fetch the institution with a separate SELECT (now `auth_institution_id()` resolves correctly).

A chained `.insert().select()` would fail. The two-step approach works.

---

### Service-Role Client in the Auth Callback

The `/auth/callback` route uses a **service-role client** (which bypasses RLS) when looking up invited teachers and students.

**Why?** A newly invited user has no `profiles` row yet. The RLS policies call `auth_institution_id()` which reads from `profiles`. With no profile, it returns NULL, RLS blocks the query, and the callback can't find the teacher/student row — the user gets stuck.

The service-role client bypasses this. It can read any row, so it finds the teacher/student by email, creates the profile, and everything works.

---

### Two Separate Supabase Clients

There are three Supabase client files for a reason:

| File | Key | Who can use it | When |
|---|---|---|---|
| `supabase/client.ts` | Anon key | Any browser user | Client Components, browser-side queries |
| `supabase/server.ts` | Anon key | Server only | Route Handlers that need the user's session/cookies |
| `supabase/admin.ts` | Service-role key | Server only | Privileged operations (invite emails, callback profile creation) |

The service-role key **bypasses all RLS**. It must never be sent to the browser. That's why it's only used in server-side code and never imported in any Client Component.

---

### Auto-Grading on Submit

When a student submits a test, `submitTest()` in the service layer:

1. Fetches the test's questions and correct answers.
2. For each MCQ/True-False answer, compares the selected option to the correct one.
3. Awards marks automatically.
4. Leaves written answers with `null` marks — the teacher grades these manually.
5. Saves all answers and updates the submission's total score in one batch.

The teacher only needs to touch the grading interface for written answers.

---

### Dual Auth Flow — PKCE and Hash

Supabase invite links can arrive in two formats depending on the Supabase project configuration and the user's email client:

- **PKCE (`?code=XXX`)** — the modern, secure flow. The code is a one-time token. The browser must exchange it via a server-side request. `/auth/callback` handles this.
- **Implicit/Hash (`#access_token=XXX`)** — a legacy flow. Tokens arrive in the URL fragment, which browsers never send to servers. A client-side page must read `window.location.hash` and set the session using the tokens directly.

The invite landing page (`/invite/teacher/[teacherId]`) detects which format it received and routes accordingly:
- `?code=` → full-page navigation to `/auth/callback?code=XXX` so the server handles the exchange and sets the cookie.
- `#access_token=` → calls `supabase.auth.setSession()` in the browser, then POSTs to `/api/auth/finalize` for profile creation.
- `?error=` → shows a friendly "link expired" error message.

`/auth/confirm/page.tsx` provides the same hash-flow handling for the admin email confirmation case (when an admin signs up and Supabase sends an `#access_token` confirmation link).

**Why not use `onAuthStateChange`?** The `SIGNED_IN` event fired by `onAuthStateChange` is delayed by a `setTimeout(0)` inside the Supabase library. This creates a race condition: if you set up the subscription after the event already fired, you miss it. Calling `setSession()` directly and then hitting `/api/auth/finalize` is synchronous and deterministic.

---

### Database Triggers for Denormalization

Some counts (tests per teacher, students per batch) are accessed very frequently. Recalculating them with a `COUNT(*)` query every time a dashboard loads would be slow.

Instead, the database keeps denormalized (pre-calculated) columns:
- `tests.attempt_count` and `tests.avg_score` — updated by a trigger on every submission change.
- `batches.student_count` — updated by a trigger on every student insert/delete.

The app reads these cached numbers instantly without expensive joins.

---

## 13. Dashboards — What's Built

### Admin Dashboard (`/admin`)

Stats overview and quick actions. Pulls institution-level numbers from Supabase.

### Admin Teachers Page (`/admin/teachers`)

Full teacher management — invite, activate/deactivate, remove. Sends branded invite emails via Resend.

### Admin Analytics Page (`/admin/analytics`)

Institution-wide analytics powered by live Supabase queries and Recharts:

| Chart | What it shows |
|---|---|
| **Monthly Test Activity** (line chart) | Tests created and submissions per month for the last 6 months |
| **Teacher Activity** (bar chart) | Tests created per teacher |
| **Tests by Subject** (donut pie chart) | Subject distribution across all tests ever created |
| **Top Performing Students** (table) | Top 5 students by overall score with rank medals and visual score bars |

All charts show skeleton placeholders while data loads. Empty states are shown when there is no data yet.

### Teacher Layout (`/teacher/*`)

The teacher layout wraps every `/teacher/*` page with:
- **DashboardNav** — top bar with the Facultify logo and user menu
- **DashboardSidebar** — left sidebar with links to Dashboard, My Students, My Tests, Create Test, AI Generator, Grading Center

Role guard: if the session is not a teacher, redirects to `/dashboard`.

### Teacher Students Page (`/teacher/students`)

Full student and batch management:

**Two tabs:**
- **All Students** — searchable table by name, email, or roll number. Columns: avatar + name, email, roll no., batch badge, overall score (colour-coded), tests attempted, remove action.
- **By Batch** — expandable batch cards. Each card shows the batch name, subject, student count, and class average score. Expanding the card shows the students in a table.

**Dialogs:**
- **Add Student** — name, email, roll number (optional, auto-generated if blank), batch selector. On save: inserts to database + sends an invite email via `/api/invite-student`.
- **Create Batch** — name and subject. Creates a new batch in the database.
- **Remove Student** — AlertDialog confirmation before deletion.

**Score badge colours:** green ≥ 80%, yellow ≥ 60%, red < 60%, grey for no score.

### Student Layout (`/student/*`)

Same pattern as teacher layout. Sidebar links: Dashboard, My Tests, Performance, Profile. Role guard redirects to `/dashboard`.

### Teacher `[id]` Redirect (`/teacher/[id]`)

When a teacher's invite email points to `/teacher/[teacherId]` as a landing page, this route immediately redirects to `/teacher`. It exists only to handle the invite link URL format and does no meaningful work itself.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Multi-tenant** | Multiple separate organizations sharing one codebase and database |
| **RLS (Row Level Security)** | Database-level access rules — rows are filtered automatically per user |
| **Service-role key** | A Supabase key that bypasses all security rules. Server-only. Never expose to browser. |
| **Magic link** | A one-time URL that logs you in without a password. Click it → you're authenticated. |
| **Middleware** | Code that runs before every HTTP request, before any page is loaded |
| **Hydration** | React re-creating server-rendered HTML into interactive components on the browser |
| **Mapper function** | A function that converts a raw database row into a typed TypeScript object |
| **Denormalization** | Storing pre-calculated data (like counts) to avoid expensive queries at read time |
| **Discriminated union** | A TypeScript type like `{ role: 'admin', ... } \| { role: 'teacher', ... }` — TypeScript knows which shape you have based on a shared field |
| **Edge function** | A small serverless function that runs "at the edge" — close to the user, globally distributed |
| **PKCE flow** | A secure way to exchange a one-time code for a session token. Used in Supabase magic links. |
| **Trigger** | A piece of SQL that runs automatically when a row is inserted, updated, or deleted |
| **View** | A saved SQL query that looks like a table. `teachers_with_stats` is a view joining teachers with counts. |
