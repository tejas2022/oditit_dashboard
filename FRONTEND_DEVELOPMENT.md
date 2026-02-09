# Frontend development – oditit Dashboard

This file describes **step-by-step what is implemented** in the React dashboard and how it connects to the oditit backend. **Keep this file updated** whenever you add or change features so it stays the single source of truth for frontend behaviour.

---

## How to keep this file updated

- When you **add a new page, API, or flow**: add a short entry under the right section below and note the API/route.
- When you **change behaviour** (e.g. new step, new API call): update the matching bullet so the doc still matches the app.
- When you **remove something**: remove or mark as deprecated in this file.

---

## 1. Authentication

| Step | What happens | API / Route |
|------|----------------|-------------|
| Login | User enters email/password; app sends credentials, receives user, organisation, accessToken, refreshToken; tokens stored (localStorage + auth store). | `POST /api/v1/auth/login` |
| Register | User enters org name, user name, email, password (optional: GSTIN, industry); app creates organisation + admin user and logs in. | `POST /api/v1/auth/register` |
| Logout | App calls logout and clears tokens and auth state. | `POST /api/v1/auth/logout` |
| Token refresh | On 401, axios interceptor sends refreshToken; new access (and optionally refresh) token stored and request retried. | `POST /api/v1/auth/refresh` |
| Protected routes | If no access token (and none in localStorage), user is redirected to `/login`. | – |

- **Files**: `src/pages/Login.tsx`, `src/pages/Register.tsx`, `src/store/authStore.ts`, `src/lib/api.ts` (interceptors), `src/components/ProtectedRoute.tsx`, `src/api/auth.ts`.

---

## 2. Choose a framework (organisation selects frameworks)

| Step | What happens | API / Route |
|------|----------------|-------------|
| List available frameworks | App fetches all frameworks the organisation can select from (paginated). | `GET /api/v1/frameworks?page=&limit=` |
| View one framework | User clicks “View details”; app fetches single framework (e.g. name, type, description, controls count, sample controls). | `GET /api/v1/frameworks/:id` |
| See frameworks already selected | App fetches frameworks already activated for the current organisation. | `GET /api/v1/frameworks/activated` |
| Select framework for organisation | User (ADMIN / SUPER_ADMIN / CISO) clicks “Select for organisation”, optionally sets target date; app activates framework and creates org-level controls. | `POST /api/v1/frameworks/activate` (body: `frameworkId`, optional `targetDate`) |
| Update activated framework | User updates activation (e.g. target date, isActive). | `PATCH /api/v1/frameworks/:frameworkId` |
| Deactivate framework | User deactivates framework for the organisation. | `DELETE /api/v1/frameworks/:frameworkId` |

- **No-framework flow**: If the organisation has **no activated frameworks**, a banner is shown on every authenticated page: “Your organisation has not selected a framework yet” with CTA **Choose a framework** → `/frameworks`. User must go to Frameworks, pick one, and activate it.
- **Files**: `src/pages/Frameworks.tsx`, `src/api/frameworks.ts`, `src/components/ChooseFrameworkBanner.tsx`, `src/lib/rbac.ts` (`canManageFrameworks`), `src/types/api.ts` (Framework, ActivatedFramework).

---

## 3. Dashboard / Summary

| Step | What happens | API / Route |
|------|----------------|-------------|
| Dashboard summary | App fetches overview (total/completed/in-progress controls, compliance score, audit readiness), evidence counts, active frameworks, recent audits. | `GET /api/v1/dashboard/summary` |
| Compliance checker | App fetches gap analysis (total, compliant, non-compliant, gaps list). | `GET /api/v1/dashboard/compliance-checker` |

- **Files**: `src/pages/Summary.tsx`, `src/pages/Report.tsx`, `src/api/dashboard.ts`.

---

## 4. Controls

| Step | What happens | API / Route |
|------|----------------|-------------|
| List controls | App fetches organisation controls with optional filters (status, frameworkId, search). | `GET /api/v1/controls?page=&limit=&status=&frameworkId=&search=` |
| Get one control | User selects a control; app fetches full detail (status, evidence, assignments, implementation context). | `GET /api/v1/controls/:id` |
| Control stats | App can fetch control statistics. | `GET /api/v1/controls/stats` |
| Update control status | User marks control e.g. COMPLETED (optional completion/next review date). | `PATCH /api/v1/controls/:id/status` |
| Assign user to control | User assigns a user and optional due date. | `POST /api/v1/controls/:id/assign` |

- **Files**: `src/pages/Controls.tsx`, `src/api/controls.ts`. Control detail shows Evidence / Notes / Audits sub-tabs; evidence list uses evidence-by-control API.

---

## 5. Evidence

| Step | What happens | API / Route |
|------|----------------|-------------|
| List evidence | App fetches evidence (paginated). | `GET /api/v1/evidence?page=&limit=` |
| Evidence by control | Shown in control detail; app fetches evidence for a control. | `GET /api/v1/evidence/control/:controlId` |
| Upload evidence | User uploads file (multipart) for an organisation control. | `POST /api/v1/evidence` (multipart) |
| Update evidence status | User sets status (e.g. APPROVED) and optional review notes. | `PATCH /api/v1/evidence/:id/status` |
| Delete evidence | User deletes evidence. | `DELETE /api/v1/evidence/:id` |

- **Files**: `src/pages/Evidence.tsx`, `src/pages/Controls.tsx` (detail), `src/api/evidence.ts`.

---

## 6. Policies

| Step | What happens | API / Route |
|------|----------------|-------------|
| List policies | App fetches policies (paginated). | `GET /api/v1/policies?page=&limit=` |
| Get one policy | User opens policy detail. | `GET /api/v1/policies/:id` |
| Create policy | User creates policy (title, content, version). | `POST /api/v1/policies` |
| Update policy | User updates policy fields. | `PATCH /api/v1/policies/:id` |
| Approve / Publish / Archive | User triggers approve, publish, or archive. | `POST /api/v1/policies/:id/approve`, `.../publish`, `.../archive` |
| Delete policy | User deletes policy. | `DELETE /api/v1/policies/:id` |

- **Files**: `src/pages/Policies.tsx`, `src/api/policies.ts`.

---

## 7. Vendors / Questionnaires

| Step | What happens | API / Route |
|------|----------------|-------------|
| List vendors | App fetches vendors (paginated). | `GET /api/v1/vendors?page=&limit=` |
| Get one vendor | User opens vendor detail. | `GET /api/v1/vendors/:id` |
| Create vendor | User creates vendor (name, email, risk level, etc.). | `POST /api/v1/vendors` |
| Update / Delete vendor | User updates or deletes vendor. | `PATCH /api/v1/vendors/:id`, `DELETE /api/v1/vendors/:id` |

- **Files**: `src/pages/Vendors.tsx`, `src/api/vendors.ts`. UI includes “Vendor questionnaire” section and critical control messaging.

---

## 8. Users

| Step | What happens | API / Route |
|------|----------------|-------------|
| List users | App fetches users for current org (paginated). | `GET /api/v1/users?page=&limit=` |
| Get one user | User opens user detail. | `GET /api/v1/users/:id` |
| Create user | Admin creates user (email, password, name, role). | `POST /api/v1/users` |
| Update / Delete user | Admin updates or deletes user. | `PATCH /api/v1/users/:id`, `DELETE /api/v1/users/:id` |

- **Files**: `src/pages/Users.tsx`, `src/api/users.ts`. Backend enforces role (e.g. ADMIN) for create/update/delete.

---

## 9. Organisation (me / settings)

| Step | What happens | API / Route |
|------|----------------|-------------|
| Get current organisation | App fetches current org (e.g. for header/settings). | `GET /api/v1/organizations/me` |
| Get org stats | App can fetch organisation statistics. | `GET /api/v1/organizations/stats` |
| Update organisation | User (role-gated) updates org name, industry, etc. | `PATCH /api/v1/organizations/me` |

- **Files**: `src/pages/Settings.tsx`, `src/api/organizations.ts`, `src/components/Layout.tsx` (org name in header).

---

## 10. AI Assessment

| Step | What happens | API / Route |
|------|----------------|-------------|
| Start assessment | User selects controls and provider (e.g. openai, gemini, anthropic); app starts assessment. | `POST /api/v1/ai-assessment/assess` (body: `controlIds`, `provider`) |
| Assessment history | App fetches list of past assessments. | `GET /api/v1/ai-assessment/history?page=&limit=` |
| Get report | User opens a report; app fetches full report by id. | `GET /api/v1/ai-assessment/report/:reportId` |

- **Files**: `src/pages/AIAssessment.tsx`, `src/api/aiAssessment.ts`. RBAC: only certain roles can run AI assessment (see `src/lib/rbac.ts`).

---

## 11. Layout and navigation

| Item | What happens |
|------|----------------|
| Global header | App name “oditit”, breadcrumb, Theme dropdown, Docs / About / Contact, user menu (profile/settings, logout). |
| Context bar tabs | Home, Choose framework, Controls, Summary, Policies, Questionnaires, Risk Register, Report, Settings. |
| Choose-framework banner | If org has no activated frameworks, a banner is shown above main content with CTA “Choose a framework” → `/frameworks`. |

- **Files**: `src/components/Layout.tsx`, `src/components/ChooseFrameworkBanner.tsx`, `src/App.tsx` (routes).

---

## 12. RBAC (role-based visibility)

- Helpers in `src/lib/rbac.ts`: `canManageFrameworks`, `canManageUsers`, `canApprovePolicies`, `canCreatePolicies`, `canUpdateControlStatus`, `canAssignControls`, `canReviewEvidence`, `canRunAIAssessment`.
- Used to show/hide or enable/disable buttons (e.g. Activate/Deactivate framework, Add user, Approve policy). Backend enforces all permissions; frontend only adjusts UI.

---

## 13. Routes summary

| Path | Page | Purpose |
|------|------|---------|
| `/login` | Login | Sign in |
| `/register` | Register | Create organisation + admin user |
| `/` | Home | Welcome, primary actions, Quick Access |
| `/frameworks` | Frameworks | **Choose a framework**: list available, list activated, view details, activate, deactivate |
| `/summary` | Summary | Dashboard metrics, Project Journey |
| `/controls` | Controls | List + detail (Evidence, Notes, Audits) |
| `/policies` | Policies | List, create, approve, publish, archive |
| `/vendors` | Vendors | Vendor questionnaire, list, create |
| `/users` | Users | Organisation users list, create |
| `/settings` | Settings | Profile, organisation (update) |
| `/risk` | Risk | Risk register (placeholder) |
| `/report` | Report | Compliance checker (gaps) |
| `/evidence` | Evidence | Evidence list |
| `/ai-assessment` | AI Assessment | Start assessment, history, view report |

---

## 14. Tech stack and config

- **Stack**: React 18, TypeScript, Vite, React Router v6, TanStack Query, Zustand (auth persisted), Axios, Tailwind CSS, Lucide React.
- **Env**: `VITE_API_BASE_URL` (default `http://localhost:3000/api/v1`). See `.env.example`.
- **API client**: `src/lib/api.ts` – base URL from env, Bearer token on every request, 401 → refresh token then retry.

---

*Last updated: when adding “Choose a framework” flow, no-framework banner, and this FRONTEND_DEVELOPMENT.md.*
