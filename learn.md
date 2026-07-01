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
13. [Glossary](#13-glossary)

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
│   ├── onboard/
│   │   └── page.tsx             ← 4-step institution setup wizard
│   ├── auth/
│   │   ├── login/page.tsx       ← Email + password login
│   │   ├── signup/page.tsx      ← New admin account creation
│   │   └── callback/route.ts    ← Magic link handler (post-login routing)
│   ├── admin/
│   │   ├── layout.tsx           ← Auth guard: must be logged in as admin
│   │   ├── page.tsx             ← Admin dashboard
│   │   ├── teachers/page.tsx    ← Manage and invite teachers
│   │   ├── analytics/page.tsx   ← Institution-wide charts
│   │   ├── billing/page.tsx     ← Subscription and invoices
│   │   └── settings/page.tsx    ← Institution settings
│   ├── teacher/
│   │   ├── layout.tsx           ← Auth guard: must be logged in as teacher
│   │   ├── page.tsx             ← Teacher dashboard
│   │   ├── create-test/         ← 3-step test builder
│   │   ├── tests/               ← View and manage tests
│   │   ├── ai-generator/        ← AI-powered test creation
│   │   ├── checking/            ← Grade submissions
│   │   └── students/            ← Manage batches and students
│   ├── student/
│   │   ├── layout.tsx           ← Auth guard: must be logged in as student
│   │   ├── page.tsx             ← Student dashboard
│   │   ├── tests/               ← Upcoming and past tests
│   │   ├── test/[id]/           ← Live exam interface
│   │   ├── analytics/           ← Personal performance
│   │   └── profile/             ← Student profile
│   └── api/
│       ├── invite/route.ts      ← POST: send teacher invite email
│       └── invite-student/      ← POST: send student invite email
│           └── route.ts
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
2. If you try to visit `/admin`, `/teacher`, `/student`, or `/onboard` without a session → redirect to `/auth/login`.
3. If you have a session → let the request through.

This is a fast first check. It doesn't check your *role* — just whether you're logged in at all.

### Layer 2 — Layout Auth Guards

Every protected section has a `layout.tsx` file. This layout:
1. Calls `initSession()` from the Zustand store (loads your user data from Supabase).
2. Checks your role. A teacher trying to visit `/admin` gets redirected to `/teacher`.
3. While loading, shows a spinner.

**Why two layers?** Middleware is very fast but only checks the cookie, not the role. The layout does the deeper role check with actual DB data.

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
6. Resend sends a branded HTML email to the teacher with a "Access My Teacher Dashboard" button.
7. Teacher clicks the button → browser goes to `/auth/callback?code=XXX`.
8. Callback finds no `profiles` row, but finds a `teachers` row matching the email.
9. Callback creates the `profiles` row and links `teachers.user_id` to the auth account.
10. Teacher is redirected to `/teacher` dashboard.

### How a Student is Invited

Same flow as a teacher, but:
- Triggered from the teacher's Students page
- Uses `POST /api/invite-student`
- Email says "Your teacher [Teacher Name] has added you..." and shows the batch name
- Callback links to the `students` table instead

### The `/auth/callback` Route

This single route handles *all* magic link flows. Its logic:

```
User arrives at /auth/callback?code=XXX
  → Exchange code for session
  → Get user from Supabase
  → Does profiles row exist for this user?
      YES → Route to their dashboard (/admin, /teacher, or /student)
      NO  → Does teachers table have a row with this email?
                YES → Create profile + link teacher row → /teacher
                NO  → Does students table have a row with this email?
                          YES → Create profile + link student row → /student
                          NO  → New admin with no institution → /onboard
```

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
   - Teacher → fetch teacher row (from `teachers_with_stats` view) + institution row
   - Student → fetch student row + institution row + teacher row (3 fetches, 2 in parallel)
4. Set `activeSession` in the store.

A **guard** prevents two simultaneous `initSession()` calls (all three layouts mount at the same time when the dashboard first loads, and without the guard they'd all fire three database queries).

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

### Database Triggers for Denormalization

Some counts (tests per teacher, students per batch) are accessed very frequently. Recalculating them with a `COUNT(*)` query every time a dashboard loads would be slow.

Instead, the database keeps denormalized (pre-calculated) columns:
- `tests.attempt_count` and `tests.avg_score` — updated by a trigger on every submission change.
- `batches.student_count` — updated by a trigger on every student insert/delete.

The app reads these cached numbers instantly without expensive joins.

---

## 13. Glossary

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
