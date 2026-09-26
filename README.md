# Mr Islam — Learning Platform

A homework and e-learning platform for a private teacher's students in Egypt, covering Egyptian national middle school (Middle 1–3) and IGCSE (grades 9–12).

Students sign up with their phone number and wait for the teacher to approve them. The teacher approves each student and places them in a class group. Approved students then see their groups and lessons, and later homework and quizzes. The platform is built for about 50–300 students.

> **Status:** in active development. Authentication, sign-up, teacher approval and groups work. Lessons, homework and quizzes are next (see [Roadmap](#roadmap)).

<!-- Add screenshots here once the UI is final, e.g.:
![Student home](docs/screenshots/student-home.png)
![Teacher dashboard](docs/screenshots/teacher-dashboard.png)
-->

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4 |
| Database | PostgreSQL on Neon |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Auth | Auth.js v5 (NextAuth), credentials provider, JWT sessions |
| Validation | Zod |
| Passwords | bcrypt (`bcryptjs`, cost factor 10) |

The frontend and backend live in a single Next.js codebase. There is no separate API server: data mutations are Server Actions, and pages read from the database directly in Server Components.

## Features

**Done**
- **Phone and password login.** Egyptian numbers are normalised to one format (`01…` and `+20…` both become `+20…`), so the same student can't create two accounts.
- **Self sign-up with approval.** New students sign up with name, phone, optional email, parent's phone and grade. They start as `PENDING` and can't log in until the teacher approves them.
- **Teacher dashboard.** Shows the queue of pending students. Approving a student sets them to `ACTIVE` and enrolls them in a group in a single database transaction.
- **Role-based access.** There are two roles, `STUDENT` and `TEACHER`. The server checks the session role again on every Server Action, not just in the UI.
- **Student home.** Shows only the groups the logged-in student is enrolled in, filtered on the server.

**Planned**: see [Roadmap](#roadmap).

## Data model

```
User ──< Enrollment >── Group
Lesson  (visible to every student in the lesson's grade)
```

- **User**: a student or the teacher. Has a `role` and a `status` (`PENDING`, `ACTIVE` or `SUSPENDED`). Suspended students keep their data so their marks aren't lost.
- **Group**: an actual class, e.g. "Year 11 — Sat 5pm", with a grade and a schedule.
- **Enrollment**: the join table for the many-to-many link between students and groups.
- **Lesson**: content targeted at a grade, with a published flag and an ordering position.

The database enforces the important rules itself, not only the application code:
- `phone` and `email` are unique, so two simultaneous sign-ups can't both succeed.
- `(studentId, groupId)` is unique, so double-clicking "Approve" can't enroll a student twice.
- There are indexes on `User.status` (the approval queue), on `Enrollment.groupId`, and on `Lesson (grade, published, position)`.

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

## Project structure

```
app/
  (auth)/login, (auth)/signup     login and sign-up pages + Server Actions
  (student)/home                  student home page
  (teacher)/dashboard             teacher dashboard + approval actions
  api/auth/[...nextauth]          Auth.js route handler
components/                       shared UI components
constants/                        grade labels, site config
lib/
  auth.ts                         Auth.js config (credentials, JWT callbacks)
  prisma.ts                       Prisma client with pg connection pool
  phone.ts                        Egyptian phone number normalisation
prisma/
  schema.prisma                   database schema
  migrations/                     migration history
  seed.ts                         creates the teacher account + a sample group
types/                            Auth.js session type extensions
```

## Getting started

### Prerequisites
- Node.js 20+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works)

### Setup

```bash
git clone https://github.com/Mostafa-Islam/mr-islam.git
cd mr-islam
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
AUTH_SECRET="generate-with: npx auth secret"
SEED_TEACHER_PASSWORD="choose-a-strong-password"
```

Apply the migrations, generate the Prisma client and seed the teacher account:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
npx prisma db seed --config prisma7.config.ts
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login). To test the approval flow, sign up as a student, log in as the teacher, and approve the student from `/dashboard`.

## Roadmap

- [x] Phone and password authentication with Auth.js
- [x] Student sign-up with teacher approval
- [x] Class groups and enrollment
- [x] Lesson model
- [ ] Lesson pages with video and PDF materials
- [ ] Homework submission and teacher grading
- [ ] Auto-graded quizzes
- [ ] Teacher tools to manage groups, lessons and students
- [ ] Deploy to production (Vercel + Neon)
- [ ] Tests (unit tests for validation and phone logic, E2E for the sign-up flow)

## Author

**Mostafa Islam**: [GitHub](https://github.com/Mostafa-Islam) · [LinkedIn](https://linkedin.com/in/mostafa-islam-527551309)
