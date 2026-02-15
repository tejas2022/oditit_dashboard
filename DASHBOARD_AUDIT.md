# Dashboard Audit – Page-by-Page

This document records the audit of each dashboard page: API usage, access control, styling, and usability. All pages that depend on an organisation now require one (friendly message when missing).

---

## 1. Login (`/login`)

| Item | Status |
|------|--------|
| **API** | `POST /auth/login` via `authApi.login(email, password)` |
| **Response** | Uses `user`, `currentOrganization`, `organizations`, `roles`, `tprmAssignments`, `accessToken`, `refreshToken` |
| **Access** | Public. On success: stores auth; if no organisations, sets `showCreateOrgModal` and navigates to `/` |
| **Styling** | Centred card, error message, link to Register and “Sign in with Google” |
| **Notes** | Correct and usable. Google link uses `VITE_API_BASE_URL` for backend OAuth entry. |

---

## 2. Register (`/register`)

| Item | Status |
|------|--------|
| **API** | `POST /auth/register` with `{ email, password, name }` (no organisation at signup) |
| **Access** | Public. On success: stores auth, sets create-org modal, navigates to `/` |
| **Styling** | Same pattern as Login; single “Full name” field |
| **Notes** | Aligned with backend (register creates user only). |

---

## 3. Auth Callback (`/auth/callback`)

| Item | Status |
|------|--------|
| **API** | Reads `accessToken` and `refreshToken` from URL (Google redirect), then `GET /auth/me` to load profile |
| **Access** | Public route; stores tokens and profile, shows create-org modal if no organisations |
| **Styling** | Loading and error states with link back to login |
| **Notes** | Correct for Google OAuth flow. |

---

## 4. Home (`/`)

| Item | Status |
|------|--------|
| **API** | `GET /dashboard/summary`, `GET /controls/stats` – both only when `organization` is set |
| **Data** | Handles backend shape: `overview`, `evidence` (or `evidenceStats`), `frameworks` (simple or full), `recentAudits` / `recentActivities` |
| **Access** | No org → “Create an organisation…” message. Org set → metrics, frameworks, control stats, recent activity, critical findings |
| **Styling** | Cards, progress, badges, links to Frameworks/Controls/Risk/Report |
| **Notes** | Framework cards support both minimal backend shape (`id`, `name`, `type`, `activatedAt`) and full `OrganizationFramework`. |

---

## 5. Frameworks (`/frameworks`)

| Item | Status |
|------|--------|
| **API** | `GET /frameworks` (list), `GET /frameworks/activated` (listActive), `POST /frameworks/activate`, PATCH/DELETE for activation |
| **Access** | No org → short message. Org set → list available, show activated, activate/deactivate |
| **Styling** | Grid of framework cards, search, activate modal |
| **Notes** | Queries enabled only when `organization` exists. |

---

## 6. Controls (`/controls`)

| Item | Status |
|------|--------|
| **API** | `GET /controls` (list with pagination), `PATCH /controls/:id/status` (update status) |
| **Access** | No org → message. Org set → list controls, open detail, update status |
| **Styling** | Table, filters, modals for detail and status update, pagination |
| **Notes** | List/update use JWT org. Pagination uses `meta.total` / `meta.limit`. |

---

## 7. Summary (`/summary`)

| Item | Status |
|------|--------|
| **API** | `GET /dashboard/summary` – only when `organization` is set |
| **Data** | Uses `overview` and `evidence` or `evidenceStats` for approved/pending counts |
| **Access** | No org → message. Org set → completion, implementation, evidence scores and journey links |
| **Styling** | Three metric cards + “Project Journey” links |
| **Notes** | Handles backend `evidence` and frontend `evidenceStats` naming. |

---

## 8. Policies (`/policies`)

| Item | Status |
|------|--------|
| **API** | `GET /policies`, `POST /policies` (create) – org from JWT |
| **Access** | No org → message. Org set → list, create, open detail |
| **Styling** | Table, search, create modal |
| **Notes** | List normalised for array or `{ data }`; create body matches backend. |

---

## 9. Vendors (`/vendors`)

| Item | Status |
|------|--------|
| **API** | `GET /vendors`, `POST /vendors` (create), etc. – org from JWT. TPRM: `getAssessmentsForMe`, `getVendorAsRespondent`, `getVendorQuestions`, `assignAssessor`, `inviteRespondent`, `getVendorUserLinks` in API layer |
| **Access** | No org → message. Org set → list vendors, create, detail |
| **Styling** | Table, filters, modals |
| **Notes** | Vendor list/create are org-scoped. TPRM respondent/assessor flows call correct endpoints when used from UI. |

---

## 10. Users (`/users`)

| Item | Status |
|------|--------|
| **API** | `GET /users`, `POST /users` with `{ email, password, name }` – org from JWT |
| **Access** | No org → message. Org set → list org users, add user (admin) |
| **Styling** | List and “Add User” modal with name/email/password |
| **Notes** | Create user shape matches backend; list normalised. |

---

## 11. Evidence (`/evidence`)

| Item | Status |
|------|--------|
| **API** | `GET /evidence`, `POST /evidence` (upload FormData), `DELETE /evidence/:id` – org from JWT |
| **Access** | No org → message. Org set → list, upload, delete |
| **Styling** | Table, search, upload modal, delete confirmation |
| **Notes** | Queries and mutations enabled only when organisation exists. |

---

## 12. Risk (`/risk`)

| Item | Status |
|------|--------|
| **API** | None – placeholder |
| **Access** | Any authenticated user |
| **Styling** | Centred message: “Risk register view. Connect to audit/risk API when available.” |
| **Notes** | No backend risk/findings API yet; page is intentional placeholder. |

---

## 13. Report (`/report`)

| Item | Status |
|------|--------|
| **API** | `GET /dashboard/compliance-checker` – only when `organization` is set |
| **Data** | Uses `total`, `compliant`, `nonCompliant`, `gaps[]` (controlName/controlCode, status, missingEvidence) |
| **Access** | No org → message. Org set → gap analysis and gaps list |
| **Styling** | Three summary cards + gaps table |
| **Notes** | Backend returns `controlName` and `controlCode`; UI shows either. |

---

## 14. AI Assessment (`/ai-assessment`)

| Item | Status |
|------|--------|
| **API** | `GET /controls` (for control list), `POST /ai-assessment/assess`, `GET /ai-assessment/history` – controls and assess require org |
| **Access** | No org → message. Org set → select controls, choose provider, run assessment, view history |
| **Styling** | Provider select, control checkboxes, history |
| **Notes** | Control list and assess calls are org-scoped; IDs passed correctly. |

---

## 15. Settings (`/settings`)

| Item | Status |
|------|--------|
| **API** | `PATCH /organizations/:id` for org name – only when `organization` exists |
| **Access** | Profile (name, email, roles) always; org name edit when org is set |
| **Styling** | Two cards: Profile and Organization |
| **Notes** | Uses `user`, `organization`, `roles` from auth store. No separate “me” fetch; org update uses correct ID. |

---

## 16. Auditor Home (`/auditor`)

| Item | Status |
|------|--------|
| **API** | `GET /auditor/my-assignments` – returns `{ assignments, auditorId }` |
| **Access** | Shown when user has auditor assignments (Layout switches nav) |
| **Styling** | Cards per org, each with framework links to assignment detail |
| **Notes** | Uses `assignments` array; empty state when no assignments. |

---

## 17. Auditor Assignment (`/auditor/assignments/:organizationFrameworkId`)

| Item | Status |
|------|--------|
| **API** | `GET /auditor/assignments/:ofId`, `GET /auditor/assignments/:ofId/controls`, `GET /auditor/subcontrol-instances/:id`, `POST /auditor/subcontrol-instances/:id/review` |
| **Access** | Only for valid assignment for current user |
| **Styling** | Back link, assignment header, expandable controls with subcontrol review (status + notes + Save) |
| **Notes** | Pagination and review submit wired; controls/subcontrols match backend. |

---

## Global behaviour

- **Org required**  
  Home, Frameworks, Controls, Summary, Policies, Vendors, Users, Evidence, Report, AI Assessment all require an organisation. If none is set, they show a short message instead of calling APIs.

- **Create organisation**  
  Modal appears when user has no organisations (after login/register or callback). On create, `POST /organizations` then `POST /auth/switch-organization` so the new org is in the JWT.

- **Org switcher**  
  Header shows when user has multiple organisations; switching calls `POST /auth/switch-organization` and reloads so all org-scoped requests use the new context.

- **Auditor vs org user**  
  If `GET /auditor/my-assignments` returns assignments, Layout shows auditor nav (My assignments, Settings) and auditor routes; otherwise full org nav.

- **Styling**  
  Shared UI (Card, Button, Input, Table, Modal, Badge, etc.), dark theme, consistent spacing and hierarchy.

---

## API summary (dashboard → backend)

| Dashboard API | Backend endpoint | Auth / scope |
|---------------|------------------|--------------|
| auth.login | POST /auth/login | Public |
| auth.register | POST /auth/register | Public |
| auth.me | GET /auth/me | Bearer |
| auth.switchOrganization | POST /auth/switch-organization | Bearer |
| organizationsApi.myOrganizations | GET /organizations/my-organizations | Bearer |
| organizationsApi.create | POST /organizations | Bearer |
| dashboardApi.summary | GET /dashboard/summary | Bearer, org from JWT |
| dashboardApi.complianceChecker | GET /dashboard/compliance-checker | Bearer, org from JWT |
| dashboardApi.controlStats | GET /controls/stats | Bearer, org from JWT |
| frameworksApi.list | GET /frameworks | Bearer, org from JWT |
| frameworksApi.activated / listActive | GET /frameworks/activated | Bearer, org from JWT |
| frameworksApi.activate | POST /frameworks/activate | Bearer, org from JWT |
| controlsApi.list | GET /controls | Bearer, org from JWT |
| controlsApi.updateStatus | PATCH /controls/:id/status | Bearer, org from JWT |
| policiesApi.list | GET /policies | Bearer, org from JWT |
| policiesApi.create | POST /policies | Bearer, org from JWT |
| vendorsApi.list | GET /vendors | Bearer, org from JWT |
| vendorsApi.create | POST /vendors | Bearer, org from JWT |
| usersApi.list | GET /users | Bearer, org from JWT |
| usersApi.create | POST /users | Bearer, org from JWT (admin) |
| evidenceApi.list | GET /evidence | Bearer, org from JWT |
| evidenceApi.upload | POST /evidence | Bearer, org from JWT |
| evidenceApi.delete | DELETE /evidence/:id | Bearer, org from JWT |
| auditorApi.myAssignments | GET /auditor/my-assignments | Bearer |
| auditorApi.getAssignmentDetail | GET /auditor/assignments/:ofId | Bearer |
| auditorApi.getControlsForAssignment | GET /auditor/assignments/:ofId/controls | Bearer |
| auditorApi.submitSubcontrolReview | POST /auditor/subcontrol-instances/:id/review | Bearer |
| aiAssessmentApi.assess | POST /ai-assessment/assess | Bearer, org from JWT |
| aiAssessmentApi.history | GET /ai-assessment/history | Bearer, org from JWT |

---

**Conclusion:** Each dashboard page has been checked for correct API usage, org-scoping, and access. Styling is consistent and appropriate. Organisation is required where the backend expects it; create-org and org-switcher flows are in place. The dashboard is ready for end-to-end testing with the backend running.
