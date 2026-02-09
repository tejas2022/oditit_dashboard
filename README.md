# oditit Dashboard

React + TypeScript dashboard for the **CompliShield AI (oditit)** backend. Gapps-inspired dark theme with sections for Projects, Controls, Summary, Policies, Vendors/Questionnaires, Risk Register, Report, and Settings.

## Prerequisites

- Node.js 18+
- The **oditit** backend running (e.g. on port 3000). See the [ouditit](../ouditit) repository for setup.

## Install

```bash
npm install
```

## Configure API URL

Copy the example env and set the API base URL:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

If the backend runs on a different host/port, update `VITE_API_BASE_URL` accordingly.

## Run development server

```bash
npm run dev
```

The app will start (e.g. at `http://localhost:5173`). It expects the oditit backend to be running at the URL set in `VITE_API_BASE_URL` (default `http://localhost:3000/api/v1`).

## Build

```bash
npm run build
```

## Features

- **Auth**: Login, Register (org + user), Logout, optional refresh token handling. JWT stored and sent as Bearer on every request.
- **Dashboard**: Summary metrics (Completion, Implementation, Evidence), Project Journey, compliance checker report.
- **Controls**: List with filters (status, search), select control for detail (Evidence, Notes, Audits), update status.
- **Policies**: List, create, approve, publish, archive.
- **Evidence**: List; evidence by control in control detail.
- **Vendors**: List, create; vendor questionnaire section.
- **Users**: List (paginated), create (role-gated by backend).
- **Frameworks**: List, view; link to controls by framework.
- **AI Assessment**: Start assessment (select controls + provider), view history, view report.
- **RBAC**: UI can show/hide or enable/disable actions by role (see `src/lib/rbac.ts`). Backend enforces all permissions.

## Tech stack

- React 18 + TypeScript
- Vite
- React Router v6
- TanStack Query (server state)
- Zustand (auth state, persisted)
- Axios (HTTP client with base URL and Authorization header)
- Tailwind CSS (dark theme)
- Lucide React (icons)

## Project structure

- `src/api/` — API modules (auth, dashboard, organizations, users, frameworks, controls, policies, evidence, vendors, aiAssessment)
- `src/components/` — Layout, ProtectedRoute
- `src/lib/` — api client, rbac helpers
- `src/pages/` — Route pages (Login, Register, Home, Summary, Controls, Policies, etc.)
- `src/store/` — Auth store (Zustand)
- `src/types/` — Shared TypeScript types
