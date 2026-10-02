# AgencyHub — Multi-Tenant Agency Project Management SaaS

A multi-tenant project management platform where many agencies run their teams, clients and projects in isolated workspaces. It has three experiences in one app:

- **Super Admin portal**: the SaaS owner inspects and controls every agency.
- **Agency workspace**: team, clients, projects, tasks, milestones, meetings, feedback and files.
- **Client portal**: a simple, read-mostly view for an agency's customers.

> **Live URL:** `<add deployed URL>`  
> **Repository:** `<add Git repository URL>`

---

## Table of contents

1. [Tech stack and a database deviation](#1-tech-stack-and-a-database-deviation)
2. [Features](#2-features)
3. [Getting started](#3-getting-started)
4. [Environment variables](#4-environment-variables)
5. [Demo accounts and demo data](#5-demo-accounts-and-demo-data)
6. [Architecture](#6-architecture)
7. [Roles and permissions](#7-roles-and-permissions)
8. [Multi-tenancy and security](#8-multi-tenancy-and-security)
9. [Product decisions](#9-product-decisions)
10. [AI feature: Project Health](#10-ai-feature-project-health)
11. [API reference](#11-api-reference)
12. [Security test scenarios](#12-security-test-scenarios)
13. [Submission note: limitations and next steps](#13-submission-note-limitations-and-next-steps)

---

## 1. Tech stack and a database deviation

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 4 (ES modules) |
| Database | **MongoDB** with Mongoose 8 |
| Auth | JWT (`jsonwebtoken`), passwords hashed with `bcryptjs` (cost 12) |
| File storage | Cloudinary, using `authenticated` (non-public) assets |
| AI | OpenAI Chat Completions API, default model `gpt-4o-mini` |

**Deviation from the brief.** The assignment specifies MySQL. This project uses MongoDB instead. The consequence is that there are no SQL foreign keys. Isolation is enforced in application code:

- Every operational document carries an `agencyId`.
- Every controller query filters by `agencyId` taken from the authenticated user, never from the request body or URL.
- Cross-references (client, manager, assignee, project) are checked to belong to the same agency before they are saved.

---

## 2. Features

**Super Admin**
- Platform dashboard: total agencies, active vs. suspended, total users, client companies and projects.
- Agency list with debounced search (agency name, owner name or owner email), status filter and pagination (20 per page). Each row shows owner, contact email, plan, status, creation date and user, client and project counts.
- Agency detail: owner, plan, users, clients, projects and the agency's recent activity.
- Suspend or activate an agency (confirmation prompt, event is logged).
- **Support mode:** open any agency's workspace with admin permissions (view, edit, delete), with a persistent banner and an exit button. The agency detail page has a **Support access** table (module × View/Create/Edit/Delete) with an Open button that jumps straight into that module. Each session start and every successful change made in support mode is written to the agency's activity log.
- Platform activity feed: the 50 most recent events across all agencies (agency created, user created, project events, status changes, support sessions).

**Agency workspace (admin and member)**
- Dashboard: total clients, active projects, projects due in the next 7 days, completed projects, pending feedback (open or in review), overdue tasks, and charts of projects and tasks by status.
- Team: admins create, edit and delete users (admin, member, or client login) and change roles.
- Clients: company, contact name, email, phone and internal notes. A client detail page shows the client's projects and a client-specific history timeline.
- Projects: linked to a client, with manager, status, priority, start and due dates.
- Tasks: title, description, assignee, status, priority, due date, comments and attached files. Overdue and due-soon badges, plus All / Open / Overdue / Due this week filters.
- **My work:** a personal view of the tasks assigned to you, grouped into overdue, due this week, later and done.
- Milestones with due dates and completion tracking.
- Meetings: title, date, notes, and a per-meeting "share with client" flag.
- Feedback: client requests with a status workflow (Open, In review, In progress, Resolved, Declined), an agency response, a comment thread and attached files.
- Files: upload at project, task or feedback level, share with client or keep internal, download and delete. Each file shows what it belongs to and who uploaded it.
- Activity timeline per project.
- AI Project Health analysis (see section 10).

**Client portal**
- Own company's projects only, with status and derived progress.
- Upcoming milestones, recent updates, and a pending-approval action when a project is in "Client Review".
- Submit feedback and change requests and reply in the comment thread.
- Meeting notes and files that the agency has explicitly shared.

---

## 3. Getting started

**Prerequisites:** Node.js 20.6 or newer (the server uses `node --env-file`), a MongoDB instance (local or Atlas), and optionally a Cloudinary account and an OpenAI API key.

```bash
# 1. Backend
cd server
cp .env.example .env        # then edit the values (see section 4)
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:3000
```

Production: `npm start` in `server/`, and `npm run build && npm start` in `client/`.

**Database setup.** There are no migrations. Mongoose creates collections and indexes on first use. On every start the server runs `seedSuperAdmin()`, which creates one Super Admin from the `SUPER_ADMIN_*` variables if no super admin exists yet.

**Demo data.** Run `npm run seed` in `server/` to create two demo agencies with users, clients, projects, tasks, milestones, meetings, feedback and activity (see section 5). If the demo agencies already exist the script stops. Run `npm run seed -- --force` to delete and recreate only those two agencies. It never touches other agencies.

---

## 4. Environment variables

Never commit real values. Both `.env` files are git-ignored. Only the `.example` files are tracked.

**`server/.env`**

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (e.g. `5000`) |
| `MONGO_URI` (or `MONGODB_URI`) | MongoDB connection string. Either name works. |
| `JWT_SECRET` | Secret used to sign tokens. Use a long random value in production. |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend origin allowed by CORS, e.g. `http://localhost:3000` |
| `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | Credentials for the seeded Super Admin. **Change them in production.** |
| `DEMO_PASSWORD` | Password for all demo users created by `npm run seed` (default `Password@123`) |
| `MAX_FILE_SIZE_MB` | Maximum upload size, e.g. `10` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File storage. If unset, file uploads return `503 File storage is not configured`. |
| `OPENAI_API_KEY` (or `ChatGpt_API_KEY`) | Enables the AI summary. If unset, the app falls back to a rule-based summary. |
| `OPENAI_MODEL` | OpenAI model id, default `gpt-4o-mini` |

**`client/.env.local`**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the API, e.g. `http://localhost:5000/api` |

---

## 5. Demo accounts and demo data

**Super Admin** is created automatically from `.env`. With the values in `.env.example`:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@platform.com` | `Admin@12345` |

**Demo agencies.** `npm run seed` creates two agencies so isolation can be tested. All demo users share the password `Password@123`.

| Agency | Role | Email |
| --- | --- | --- |
| Pixel Forge Studio | Admin | `admin@pixelforge.com` |
| Pixel Forge Studio | Team member | `member@pixelforge.com` |
| Pixel Forge Studio | Client (Brightside Bakery) | `client@pixelforge.com` |
| Pixel Forge Studio | Client (Orbit Fitness) | `client2@pixelforge.com` |
| Northwind Digital | Admin | `admin@northwind.com` |
| Northwind Digital | Team member | `member@northwind.com` |
| Northwind Digital | Client (Harbor Legal Group) | `client@northwind.com` |
| Northwind Digital | Client (Summit Outdoor Co.) | `client2@northwind.com` |

The seed includes overdue and due-soon tasks, a project waiting in "Client Review" (so the approval flow can be tried), shared and internal meetings, and open feedback. Files are not seeded because they need a Cloudinary upload. Upload one from a project's Files tab.

You can also create more agencies at `/register`. **Change or remove the demo accounts and the default Super Admin password before a public deployment.**

---

## 6. Architecture

```
.
├── server/                     # Node.js + Express API
│   ├── server.js               # app wiring, route mounting, start-up
│   ├── config/                 # db.js (MongoDB), cloudinary.js
│   ├── middleware/
│   │   ├── auth.js             # JWT sign, protect (auth + suspension check), allow(...roles)
│   │   └── errorHandler.js     # notFound + central error normalisation
│   ├── routes/                 # one router per resource, declares which roles may call what
│   ├── controllers/            # business logic, all queries scoped by agencyId
│   └── models/                 # Mongoose schemas (Agency, User, Client, Project, Task, Milestone,
│                               #   Meeting, Feedback, ProjectFile, Activity)
└── client/                     # Next.js frontend
    └── src/
        ├── app/                # landing, /login, /register, /dashboard/** (App Router)
        ├── components/         # UI, split into landing/, dashboard/ and project/ groups
        ├── context/            # UserContext (token decoding, logout)
        └── lib/                # api.js (fetch wrapper, Cloudinary upload), useList/useItem hooks
```

**Request flow:** `route → protect → allow(roles) → controller → Mongoose model`.

- `protect` verifies the JWT, loads the user from the database, and for non-super-admins loads the agency and rejects the request with `403 Agency is suspended` if it is suspended.
- `allow(...roles)` restricts a route to specific roles.
- Controllers read `req.user.agencyId` (and `req.user.clientId` for clients) and use it in every query.

**Data model**

| Collection | Key fields |
| --- | --- |
| `agencies` | `name`, `status` (`active` / `suspended`) |
| `users` | `email` (unique), `password` (hashed, `select: false`), `role` (`superadmin` / `admin` / `member` / `client`), `agencyId`, `clientId` |
| `clients` | `agencyId`, `company`, `contactName`, `email`, `notes` |
| `projects` | `agencyId`, `clientId`, `managerId`, `status`, `priority`, `startDate`, `dueDate` |
| `tasks` | `agencyId`, `projectId`, `assigneeId`, `status`, `priority`, `dueDate`, `comments[]` |
| `milestones` | `agencyId`, `projectId`, `status`, `dueDate`, `completedAt` |
| `meetings` | `agencyId`, `projectId`, `date`, `notes`, `sharedWithClient`, `createdBy` |
| `feedbacks` | `agencyId`, `projectId`, `clientId`, `submittedBy`, `status`, `agencyResponse`, `comments[]` |
| `projectfiles` | `agencyId`, `projectId`, `attachedToType` (`project` / `task` / `feedback`), `attachedToId`, `uploadedBy`, `publicId`, `sharedWithClient` |
| `activities` | `agencyId`, `projectId`, `actorId`, `actorName`, `eventType`, `entityType`, `entityId`, `message`, `visibility` (`internal` / `client`), `metadata` |

The Super Admin is a `users` document with `role: 'superadmin'` and **no** `agencyId`. It is not a member of any agency.

**Activity log.** `logActivity()` writes an event with agency, actor, event type, related entity, visibility, metadata and timestamp. Events recorded today: `agency_created`, `user_created`, `agency_status_changed`, `support_session_started`, `project_created`, `status_changed`, `milestone_completed`, `task_completed`, `feedback_submitted`, `feedback_status_changed`, `meeting_recorded`, `file_uploaded`, `approval_received`. The `visibility` flag controls what clients see. The collection is designed so notifications or automated client updates can later subscribe to it.

---

## 7. Roles and permissions

| Action | Super Admin | Agency Admin | Agency Member | Client |
| --- | :---: | :---: | :---: | :---: |
| List, search and inspect all agencies | ✓ | — | — | — |
| Suspend or activate an agency | ✓ | — | — | — |
| Platform stats and platform activity | ✓ | — | — | — |
| Manage team users and roles | — | ✓ | — | — |
| Create, edit and delete clients | — | ✓ | ✓ | — |
| Create, edit and delete projects | — | ✓ | ✓ | — |
| Create and update tasks (and comment on them) | — | ✓ | ✓ | — |
| Create and update milestones | — | ✓ | ✓ | — |
| Record meetings and share them with the client | — | ✓ | ✓ | — |
| Upload files, share, delete | — | ✓ | ✓ | upload to own projects only |
| Respond to feedback and change its status | — | ✓ | ✓ | — |
| Submit feedback and comment on it | — | — | — | own projects |
| Approve a project in "Client Review" | — | — | — | own projects |
| View projects | — | own agency | own agency | own company |
| View meetings and files | — | own agency | own agency | only items shared with them |
| Run AI project health | — | ✓ | ✓ | — |
| Open an agency in support mode (admin-level view, edit, delete; audited) | ✓ | — | — | — |

**Where each role is enforced**

| Role | Backend enforcement | Frontend |
| --- | --- | --- |
| Super Admin | `allow('superadmin')` in `server/routes/agencyRoutes.js`; `protect` in `server/middleware/auth.js` handles support mode | Agencies pages and `PlatformOverview` |
| Agency Admin | `allow('admin')` on user management (`userRoutes.js`); `allow('admin','member')` on staff routes | Sidebar link "Team" is admin-only (`Sidebar.jsx`) |
| Agency Team (member) | `allow('admin','member')` on clients, projects, tasks, milestones, meetings, feedback, files, AI | `AgencyOverview`, "My work" |
| Client | `allow('client')` on approve, `clientId` filter in `findAccessibleProject`, `sharedWithClient` / `visibility` filters | `ClientPortal` |

**Differences from the brief's matrix**

| Brief says | What is built | Why |
| --- | --- | --- |
| Super Admin "via support mode" can invite users, edit clients and projects, create tasks and milestones, record meetings, respond to feedback | Implemented. In support mode the Super Admin has agency-admin permissions in that one agency (view, create, edit, delete). Every successful write is audited as a `support_action`. | Matches the matrix. Client-only actions (approve a project) stay client-only. |
| Team member: create/edit clients and projects is "Optional" | Allowed | See choices below |
| Team member views projects "Own agency / assigned" | Own agency (all projects) | Simplicity. Per-project membership is a next step. |
| Everything else in the matrix (suspend/activate, manage users and roles, tasks, milestones, meetings, feedback, client portal visibility) | Implemented as written | — |

**Choices behind the matrix**
- The brief marks "create or edit clients and projects" as optional for team members. Here, members are allowed to do it, because in a small agency the person who runs a project usually needs to set it up. Only user management is admin-only.
- Team members see every project in their agency. They are not limited to assigned projects. This was a simplicity trade-off (see limitations).
- Clients have no access to tasks. They see projects, milestones, activity marked `client`, shared meetings, shared files and their own feedback.

---

## 8. Multi-tenancy and security

**Tenant isolation**
- Every operational model has a required, indexed `agencyId`.
- Every read, update and delete uses `{ _id, agencyId: req.user.agencyId }`. A resource from another agency returns `404 Not Found`, so the existence of IDs is not leaked.
- When a record references another record (client, project manager, task assignee, project, feedback target), the controller verifies the referenced record belongs to the same agency before saving.
- `findAccessibleProject(user, projectId)` is the shared helper used for project access. It adds `clientId` to the filter when the caller is a client.

**Client isolation.** Clients are filtered by both `agencyId` and their own `clientId` (projects, feedback) or by the IDs of their own projects (milestones, meetings, files, activity). Meetings and files are additionally filtered by `sharedWithClient: true`, and activity by `visibility: 'client'`. Changing an ID in the URL or API body returns 404 or 400.

**Authentication and authorisation**
- Passwords are hashed with bcrypt (cost 12) and are excluded from queries by default (`select: false`).
- JWTs are verified on every request, and the user is reloaded from the database, so deleted users stop working immediately.
- Authorisation is enforced on the server by `allow(...roles)` on every route. Hiding items in the sidebar is only a convenience.
- Super Admin routes (`/api/agencies/*`) are `allow('superadmin')` only. A Super Admin has no `agencyId`, so it can't call agency workspace routes either. The two privilege sets do not overlap.
- Passwords must be at least 8 characters, and emails are validated on sign-up.
- Role changes are limited to admin ↔ member. A client role can't be changed, and a user can't delete their own account.
- Agency names and user data entered by the user are never used as query operators. Search input is regex-escaped.

**Suspended agencies.** Login is blocked for every user of a suspended agency with the message "This agency account is suspended. Please contact the platform administrator." `protect` also checks the agency status on every request, so tokens issued before the suspension stop working immediately. A super admin can still open a suspended agency in support mode.

**File security**
- Files are uploaded straight from the browser to Cloudinary using a **server-signed upload** (`/files/upload-signature`). The upload type is `authenticated`, so the asset has **no public URL**.
- Assets are stored under `agencies/<agencyId>/projects/<projectId>/`. When the client registers an upload, the server verifies the `publicId` starts with that exact folder, so a user can't attach an asset from another agency or project. It also checks the asset exists, enforces `MAX_FILE_SIZE_MB` and deletes the asset on rejection.
- A download is `GET /files/:id/download`. The server checks agency scope and, for clients, project ownership and `sharedWithClient`, and only then returns a Cloudinary **signed URL that expires after 60 seconds**.
- Guessing or sharing a link doesn't work: the DB record is scoped, and the asset itself is private.

**Other measures:** central error handler that doesn't leak internals on 500s, CORS restricted to `CLIENT_URL`, `CastError` mapped to 400, and `.env` files git-ignored.

---

## 9. Product decisions

- **Derived progress.** A project's progress is `done tasks ÷ total tasks × 100`, rounded. It is computed in the API with an aggregation, never stored or typed. A project with no tasks shows 0%.
- **Project stages.** Project status is the delivery workflow: Planning → Design → Development → Testing → Client Review → Launch. A project with status `launched` counts as "completed" on the dashboard, and all others count as "active".
- **Client approval step.** When a project is in `client_review`, the client portal shows an **Approve** button. Approving records an `approval_received` event in the activity log, visible to the agency.
- **Feedback workflow.** Open → In Review → In Progress → Resolved, with a free-text agency response and a comment thread shared between client and agency. Status changes are logged to the activity timeline.
- **Explicit sharing.** Nothing is shown to a client by default. Meetings and files start private (`sharedWithClient: false`) and the agency opts in per item. Files uploaded by a client are always visible to that client.
- **Support mode is write-enabled and audited.** The Super Admin opens an agency's workspace from the agency list or detail page. The app shows a banner ("You are viewing Agency X as Super Admin") with an exit button, and the start of every session is recorded in the agency's activity log. Inside, the Super Admin has agency-admin permissions for that one agency: view, create, edit and delete team members, clients, projects, tasks, milestones, meetings, feedback and files, as the brief's matrix describes ("via support mode"). Every successful write is saved to the agency's activity log as a `support_action` (who, method, path, status), so agency admins can see what support changed. Client-only actions such as approving a project remain unavailable. How it works: the browser sends an `X-Support-Agency` header, and `protect` accepts it only from a super admin and maps them to an admin of that agency. A normal agency user sending that header gets `403 Access denied`.
- **Sign-up flow.** Anyone can create an agency at `/register`, which creates the tenant and its first admin. Admins then add team members and client logins themselves.
- **Extras beyond the brief:** client approval step, per-item sharing flags, activity visibility levels, graceful AI fallback, and empty/loading states.

---

## 10. AI feature: Project Health

**Problem it solves.** Project managers have to open tasks, milestones, feedback and the timeline to decide whether a project is in trouble. Project Health does that in one click and tells them what is at risk and why.

**Where.** The **AI Health** tab on a project page (agency admin or member only), backed by `GET /api/ai/project-health/:projectId`.

**Input.** Only data for the requested project, loaded with `agencyId` **and** `projectId` filters, after confirming the project belongs to the caller's agency:
- project name, status, priority, due date
- task counts and progress percentage
- overdue tasks (not done and past due)
- stalled milestones (not completed and past due)
- unresolved feedback
- the 10 most recent activity messages and days since the last activity

**Output.**
- `riskLevel`: `low`, `medium` or `high`, computed by deterministic rules (high if 3 or more overdue tasks, 2 or more stalled milestones, or the project is past its due date).
- `risks`: a list of plain-language risk statements (for example "2 task(s) are overdue", "No project activity in the last 14 days").
- Lists of overdue tasks and stalled milestones.
- `summary`: a short status summary of under 120 words written by an OpenAI model.
- `source`: `ai` or `rules`, shown in the UI so users know where the summary came from.

**Design.** Risk detection is done with rules in code, so the numbers are always correct and auditable. The model only writes the narrative from those structured facts, and the prompt tells it to use only the JSON provided.

**Model and API.** OpenAI Chat Completions API (`https://api.openai.com/v1/chat/completions`), model from `OPENAI_MODEL` (default `gpt-4o-mini`), `max_tokens: 400`, 20 second timeout.

**Failure handling.** If the API key is missing, the request fails or it times out, the endpoint doesn't error. It returns the rule-based summary with `source: 'rules'` and logs the failure on the server.

**Configuration.** Set `OPENAI_API_KEY` (the legacy name `ChatGpt_API_KEY` also works) and optionally `OPENAI_MODEL` in `server/.env`. Never commit the key.

**Tenant isolation for AI.** The AI route is staff-only, the project lookup is scoped by `agencyId`, and all data passed to the model is queried with the same `agencyId` + `projectId` scope. The model never receives data from another agency or project.

---

## 11. API reference

All routes are prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`.

| Resource | Endpoints | Allowed roles |
| --- | --- | --- |
| Auth | `POST /auth/register-agency`, `POST /auth/login` | public |
| Auth | `GET /auth/me` | any signed-in user |
| Agencies | `POST /agencies`, `GET /agencies` (`?search=&status=&page=`), `GET /agencies/stats`, `GET /agencies/activity`, `GET /agencies/:id`, `PATCH /agencies/:id/status`, `POST /agencies/:id/support-session` | superadmin |
| Support mode | any workspace `GET` route with header `X-Support-Agency: <agencyId>` | superadmin (writes allowed and audited) |
| Users | `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` | admin |
| Users | `GET /users/team` | admin, member |
| Clients | `GET/POST /clients`, `GET/PATCH/DELETE /clients/:id` (detail includes projects and history) | admin, member |
| Projects | `GET /projects` (`?status=&clientId=`), `GET /projects/:id` | admin, member, client |
| Projects | `POST /projects`, `PATCH/DELETE /projects/:id` | admin, member |
| Projects | `POST /projects/:id/approve` | client |
| Tasks | `GET/POST /tasks` (`?projectId=&status=&assigneeId=`), `PATCH/DELETE /tasks/:id`, `POST /tasks/:id/comments` | admin, member |
| Milestones | `GET /milestones` | admin, member, client |
| Milestones | `POST /milestones`, `PATCH/DELETE /milestones/:id` | admin, member |
| Meetings | `GET /meetings` | admin, member, client (shared only) |
| Meetings | `POST /meetings`, `PATCH/DELETE /meetings/:id` | admin, member |
| Feedback | `GET/POST /feedback`, `GET /feedback/:id`, `POST /feedback/:id/comments` | admin, member, client (own only) |
| Feedback | `PATCH/DELETE /feedback/:id` | admin, member |
| Files | `GET /files`, `POST /files/upload-signature`, `POST /files`, `GET /files/:id/download` | admin, member, client (shared only) |
| Files | `PATCH/DELETE /files/:id` | admin, member |
| Activity | `GET /activity` | admin, member, client (`visibility: client` only) |
| Dashboard | `GET /dashboard` | admin, member |
| AI | `GET /ai/project-health/:projectId` | admin, member |

---

## 12. Security test scenarios

These are the scenarios from the assignment, with the mechanism that handles each one. Run each one against your own deployment before submitting and record the result.

| Scenario | Expected result | Mechanism |
| --- | --- | --- |
| Agency A admin requests Agency B's project ID | `404`, no data | queries filter on `agencyId` from the token |
| Agency A user calls the API with Agency B's task or client ID | `404` or `400`, nothing modified | scoped `findOneAndUpdate/Delete`, same-agency reference checks |
| Client 1 requests Client 2's project ID | `404` | `findAccessibleProject` adds `clientId` |
| Client calls an internal route (e.g. `/api/clients`, `/api/tasks`, `/api/users`) | `403 Access denied` | `allow('admin','member')` |
| Open or download another agency's or client's file | `404` | file lookup scoped by `agencyId`, plus project and `sharedWithClient` for clients |
| User of a suspended agency logs in or uses the API | `403` with a suspension message | login check plus `protect` agency status check |
| Agency user sends `X-Support-Agency` | `403 Access denied` | header honoured only for super admins |
| Super admin in support mode edits or deletes in the agency | Succeeds, and a `support_action` entry appears in that agency's activity log | `protect` maps the super admin to an admin of that agency only |
| Super admin in support mode requests another agency's data without switching | Only the agency in `X-Support-Agency` is visible | `agencyId` comes from the header, one agency at a time |
| Agency user calls a Super Admin route (`/api/agencies`) | `403 Access denied` | `allow('superadmin')` |
| Request without token or with a bad token | `401` | `protect` |

Quick check with curl (replace `<tokenA>` with an Agency A token and `<projectB>` with a project ID from Agency B):

```bash
curl -i -H "Authorization: Bearer <tokenA>" http://localhost:5000/api/projects/<projectB>
# expected: 404 {"message":"Project not found"}
```

---

## 13. Submission note: limitations and next steps

**Known limitations and shortcuts**
- **MongoDB instead of MySQL** (see section 1). This is a requirement deviation.
- **Support mode uses a header, not an impersonation token.** The active support agency is kept per browser tab (`sessionStorage`) and sent as `X-Support-Agency`. Writes are audited, but there is no time limit or approval step for a support session.
- **Agency creation is open.** Anyone can register an agency. There is no email verification, approval step or billing. The `plan` field is informational only.
- **Team members are not limited to assigned projects.** All members see their whole agency. "My work" is the assigned-task view.
- **Project statuses are fixed** (Planning to Launch). Agencies can't define their own stages yet.
- **Meeting notes and task comments** are plain text, and individual comments can't be edited or deleted.
- **Auth token** is stored in `localStorage`, which is exposed to XSS. An `httpOnly` cookie would be safer. There is no refresh token, rate limiting, email verification or password reset.
- **No automated tests.** Isolation scenarios in section 12 are verified manually.
- **Files** are not part of the demo seed, because uploads go through Cloudinary. Deleting a task or feedback item doesn't delete its attached files. Deleting a project removes its tasks, milestones, meetings, feedback, files and activity. A client can only be deleted once it has no projects.
- **AI** covers one workflow (Project Health). There are no tests for the model output and no caching or rate limit on the AI endpoint.

**What I would build next**
1. Time-limited impersonation tokens for support mode, with agency-admin approval.
2. Per-project membership for team members.
3. AI Meeting Summary that converts notes into tasks, and AI Client Update drafts that the agency can edit before sharing.
4. Email notifications built on the activity log, and per-agency custom project stages.
5. Automated API tests for every isolation scenario, `httpOnly` cookie sessions, rate limiting and password reset.
6. Agency onboarding flow and billing or plan management.
