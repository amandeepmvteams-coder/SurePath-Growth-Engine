# SurePath Codebase Analysis

## 1. Executive Summary

SurePath is a two-application workspace:

```text
surepath-frontend  ->  Next.js 16 / React 19 / TypeScript
surepath-backend   ->  Express / TypeScript / PostgreSQL
```

The backend has a recognizable production-oriented structure and broad domain coverage: authentication, users, merchants, profiles, contacts, notes, activities, tasks, detections, scoring, research, discovery, industries, AI configuration, migrations, and transaction helpers. The frontend, however, is currently a visual prototype. It imports static data from `surepath-frontend/src/data`, keeps mutations in component-local React state, and does not call the backend at all.

The most important architectural conclusion is that the primary problem is not a missing backend feature set; it is the absent integration boundary. The frontend has no API client, query provider, request/response schemas, session handling, route protection, or shared contract layer. As a result, login, merchant CRUD, CRM activity, notes, tasks, pipeline execution, scoring, settings, and password changes are either mocked, inert, or discarded on refresh.

The backend also needs hardening before it becomes the frontend's source of truth. Verified concerns include absent login request validation, no visible centralized Express error handler, incomplete role coverage across domain routes, no tenant/organization boundary in the database model, and several unenforced database invariants.

The safest implementation strategy is incremental: establish authentication and API contracts first, then connect merchant read operations, then merchant mutations and child resources, then scoring/research/pipeline workflows, then dashboard/sales/settings, followed by mock removal, tests, and hardening.

## 2. Repository Architecture

### Repository shape

The repository root is `/home/mvt-dev-135/Documents/Projects/surepath-v1` and contains:

```text
surepath-v1/
├── README.md
├── surepath-frontend/
└── surepath-backend/
```

The permitted analysis artifact is located in the frontend root. Existing worktree changes were observed before this audit in `surepath-frontend/package.json` and `surepath-frontend/package-lock.json`; they were not modified.

### Frontend

`surepath-frontend/package.json` identifies a private Next.js application using:

- Next.js `16.3.4`
- React `19.2.8`
- TypeScript
- `@tanstack/react-query` and `zustand` declared but unused
- `axios` declared but unused
- `zod` declared but unused
- Tailwind CSS, Radix UI, Lucide, and Sonner

`surepath-frontend/tsconfig.json` enables strict TypeScript and maps `@/*` to `./src/*`. `next.config.ts` only enables the React compiler. The README remains the create-next-app starter documentation and does not describe the actual SurePath architecture.

### Backend

`surepath-backend` is an Express/TypeScript service. `src/server.ts` loads configuration, bootstraps an initial account, and starts the server. `src/app.ts` creates the Express app, enables default `cors()` and JSON parsing, and mounts the versioned API:

```text
/api/v1/health
/api/v1/users
/api/v1/auth
/api/v1/merchants
/api/v1/tasks
/api/v1/scoring
/api/v1/research
/api/v1/profiles
/api/v1/detections
/api/v1/discovery
/api/v1/industries
/api/v1/ai
```

The backend follows:

```text
routes -> middleware/validation -> controllers -> services -> repositories -> PostgreSQL
```

Database access is through a `pg.Pool` in `src/config/database.ts`, with a shared transaction helper used by several services. Migrations are under `surepath-backend/migrations` and are executed through `node-pg-migrate`.

## 3. Frontend Architecture

### App Router

The application root is `surepath-frontend/src/app`. It uses the App Router and has two organizational route groups:

```text
src/app/
├── (auth)/
└── (dashboard)/
```

The route groups do not affect URLs. `src/app/layout.tsx` is the server root layout, loads Geist fonts and global CSS, sets metadata, and renders the global Sonner `Toaster`.

`src/app/page.tsx` is a server route that redirects `/` to `/login`.

The dashboard group has `src/app/(dashboard)/layout.tsx`, which renders:

```text
Sidebar
Topbar
scrollable main content
```

There is no `(auth)/layout.tsx`, so login inherits only the root layout.

### Server/client boundaries

Server components include the root layout, dashboard layout, dashboard page, sales page, settings page, and merchant detail page. The merchant detail page is async, resolves `params`, looks up static data, and calls `notFound()` for an unknown ID.

Client components are used for login, the merchant list, pipeline, merchant tabs, tab forms, sidebar, topbar, and interactive UI primitives. The merchant list is a large client boundary containing filtering, pagination, navigation, dialogs, local mutations, and table rendering.

### Boundaries and resilience

No source-level `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, or `default.tsx` files were found under `src/app`. The detail route uses the framework `notFound()` helper, but custom loading, error, retry, and empty-state boundaries are absent.

### Organization

The project uses route-local feature components rather than a top-level `src/features` structure:

```text
src/
├── app/
│   ├── (auth)/login
│   └── (dashboard)/
│       ├── dashboard
│       ├── merchants
│       │   ├── _components
│       │   └── [id]/_components
│       ├── pipeline
│       ├── sales
│       └── settings
├── components/
│   ├── auth
│   ├── layout
│   └── ui
├── data
├── lib
└── types
```

This is reasonable for the current prototype. A wholesale move to a new folder structure is not required; data access and contracts should be extracted incrementally while route-local UI remains in place.

## 4. Backend Architecture

### Request path

Merchant update demonstrates the intended complete path:

```text
PATCH /api/v1/merchants/:id
  -> requireApiKey
  -> requireSession
  -> updateMerchantValidator
  -> validate
  -> merchantController.update
  -> merchantService.updateMerchant
  -> merchantRepository.update
  -> merchantStatusHistoryRepository.create (when status changes)
  -> PostgreSQL transaction
```

Evidence:

- Route composition: `surepath-backend/src/routes/merchant.routes.ts:26-29,203-216`
- Controller: `surepath-backend/src/controllers/merchant.controller.ts:82-111`
- Service and transaction: `surepath-backend/src/services/merchant.service.ts:67-121`
- Repositories: `surepath-backend/src/repositories/merchant.repository.ts:101-180` and `merchant-status-history.repository.ts`

### Feature coverage

`src/routes/merchant.routes.ts` wires merchant CRUD and related profiles, contacts, notes, activities, tasks, detections, scores, research runs, provenance, and export. Separate route modules cover users, auth, tasks, scoring, research, profiles, detections, discovery, industries, and AI.

### Transactions

`src/config/database.ts:14-34` provides a shared `BEGIN`/`COMMIT`/`ROLLBACK` helper. It is used by merchant and child-resource services. Some repositories independently manage clients/transactions, notably provenance, scoring configuration, and AI configuration repositories. This is workable but should be documented and standardized over time to avoid inconsistent transaction ownership.

### Backend gaps

- `POST /api/v1/auth/login` has no validator attached, unlike the password route.
- `src/app.ts` has no visible final centralized Express error middleware.
- Controllers mix local `try/catch`, direct responses, and rethrows.
- `role.middleware.ts` exists, but reviewed route registrations do not show role middleware being applied.
- API error shapes are inconsistent (`detail` versus `message`).
- Query parameters are repeatedly coerced with assertions in controllers.
- Backend response DTOs are manually constructed and not runtime-validated.

## 5. Route Map

| Route | Page | Layout | Components | State | API | Auth | Status |
|---|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Root | None | None | None | None | Redirects to `/login` |
| `/login` | `(auth)/login/page.tsx` | Root | Inputs, Sonner | Local form state | None | None | Mocked; accepts any non-empty credentials |
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | Dashboard | `PageHeader`, cards, tables | Derived from static merchants | None | None | Visual view with mocked counts |
| `/sales` | `(dashboard)/sales/page.tsx` | Dashboard | `PageHeader`, task sections | Derived from static tasks/merchants | None | None | Partially implemented; controls and sections are misleading/inert |
| `/merchants` | `(dashboard)/merchants/page.tsx` | Dashboard | Add/delete dialogs, table, filters, pagination | Local merchant copy, filters, page | None | None | Local CRUD prototype |
| `/merchants/[id]` | `(dashboard)/merchants/[id]/page.tsx` | Dashboard | Header, summary, `MerchantTabs` | Static route lookup; tab-local state | None | None | Partially complete; many controls inert |
| `/pipeline` | `(dashboard)/pipeline/page.tsx` | Dashboard | Pipeline stages, checkboxes, progress | Local stage/timer state | None | None | Animation simulation, no pipeline execution |
| `/settings` | `(dashboard)/settings/page.tsx` | Dashboard | Team, scoring, AI sections | Mostly uncontrolled/default values | None | None | Read-only mock UI |

Dynamic merchant IDs are resolved against `src/data/merchants.ts`. Unknown IDs invoke `notFound()`. Newly added list entries use `Date.now()` numeric IDs but are not added to the module-level data used by the detail route, so a newly created merchant cannot reliably be opened after list navigation.

No protected-route mechanism was found: no middleware, server session check, or dashboard layout redirect.

## 6. Feature Map

| Feature | Current implementation | Source evidence | State |
|---|---|---|---|
| Login | Local non-empty validation, writes fabricated user to localStorage | `src/app/(auth)/login/page.tsx:21-40` | Mocked |
| Dashboard | Calculates counts and prospect display from static merchants | `src/app/(dashboard)/dashboard/page.tsx:12-29` | Visual/mock |
| Merchant discovery | Client search/filter/sort-like display and pagination over fixture array | `src/app/(dashboard)/merchants/page.tsx:65-133` | Locally functional |
| Add merchant | Creates local object in page state | `src/app/(dashboard)/merchants/page.tsx:34-53` | Not persisted |
| Delete merchant | Filters local state | `src/app/(dashboard)/merchants/page.tsx:55-62` | Not persisted |
| Merchant detail | Static lookup and tabs | `src/app/(dashboard)/merchants/[id]/page.tsx:29-43` | Partially complete |
| Scoring | Seeded `fit` values in list/dashboard; overview says “Not scored yet” | `src/data/merchants.ts`, `overview-tab.tsx:25-30` | Contradictory/mock |
| Research/provider detection | Placeholder “not generated”/“no provider” states | `overview-tab.tsx:34-79` | Missing |
| Policies | Fixed fallback content | `policies-tab.tsx:17-46` | Mock |
| Pipeline | Five-stage timer with two-second delay per stage | `pipeline/page.tsx:50-64` | Simulation |
| Profile/user menu | Static `CURRENT_USER`; login identity ignored | `topbar.tsx:17-25`, `data/current-user.ts` | Mock |
| Password update | Logs values and resets form | `update-password-dialog.tsx:29-40` | Broken/no-op |
| Activities | Local tab state; discards channel/date/notes on creation | `activity-tab.tsx:38-76` | Session-local |
| Notes | Local array; no edit/delete/persistence | `notes-tab.tsx:13-26` | Session-local |
| Tasks | Local array; no completion/edit/delete/persistence | `tasks-tab.tsx:20-57` | Session-local |
| Sales | Static calculations plus hardcoded empty-state copy | `sales/page.tsx:19-31,76-143` | Incomplete |
| Settings | Static settings data and inert controls | `settings/page.tsx:16-19,29-95,114-244` | Mock |

## 7. Page → Component Relationships

### Shared shell

```text
RootLayout
├── global CSS, fonts, Toaster
├── Login page
└── DashboardLayout
    ├── Sidebar
    │   └── SidebarLink
    ├── Topbar
    │   └── mobile Sheet links
    └── route page
```

`PageHeader` is reused by dashboard, sales, merchants, pipeline, settings, and merchant detail pages. Navigation definitions are centralized in `src/lib/navigation.ts`, but the desktop `SidebarLink` and mobile Topbar link markup are duplicated. Branding is also duplicated between those two components.

### Merchant list

```text
MerchantsPage
├── PageHeader
├── filter/search controls
├── AddMerchantDialog
├── merchant table
│   └── row actions
└── DeleteMerchantDialog
```

`MerchantsPage` owns the merchant array, filters, pagination, dialog state, navigation, local add/delete behavior, and toast notifications. It is too broad a business/UI boundary for the eventual API-backed feature.

### Merchant detail

```text
MerchantPage
├── PageHeader and merchant actions
├── summary/sidebar cards
└── MerchantTabs
    ├── OverviewTab
    ├── PoliciesTab
    ├── TasksTab
    ├── NotesTab
    └── ActivityTab
```

`MerchantTabs` owns activity state and passes the mutable collection/setter into `ActivityTab`. `NotesTab` receives `merchantId` but does not use it to scope persistence. `TasksTab` defines a private `Task` interface instead of reusing `src/types/task-types.ts`.

### Coupling and reuse findings

- Shared UI primitives are reused effectively.
- Navigation rendering and branding are duplicated across shell components.
- Domain behavior is embedded in route pages and tab components.
- The merchant feature has no shared data-access layer.
- Activity/task/note forms contain mutation construction rather than delegating to feature APIs.
- `AddMerchantDialog` owns validation and notifications while the page owns the collection update.

## 8. Data Flow

### Current frontend flow

```text
src/data/*.ts
  -> page/component import
  -> local derivation or useState copy
  -> rendered UI
```

There is no current path through Axios/fetch, TanStack Query, API hooks, or a backend response.

### Intended backend flow

```text
PostgreSQL
  -> repository
  -> service
  -> controller
  -> Express route/middleware
  -> HTTP API
```

The backend side is present for most domains. The frontend side of the chain is missing:

```text
HTTP API
  -X-> API client
  -X-> query/mutation cache
  -X-> feature hook
  -X-> page/component
```

### Representative gaps

- Merchant list and dashboard read different local sources: the list copies `merchants`, while dashboard and detail read the original module array.
- Add/delete changes update only the list page.
- A pipeline run changes only a local progress index and never creates research, detection, scoring, or merchant updates.
- CRM mutations are stored only in mounted tab state.
- The backend supports child resources, but no frontend request maps to them.

## 9. State Management Audit

| State | Current owner | Classification | Problem | Recommended ownership |
|---|---|---|---|---|
| Merchants | `src/data/merchants.ts` plus list-page `useState` copy | Mock server state + local state | Multiple sources of truth; changes do not propagate | TanStack Query keyed by list filters and merchant ID |
| Dashboard metrics | Derived from static array | Mock server state | Cannot reflect list mutations or backend truth | Query endpoint or composed queries |
| Search/filter/page | Merchants page local state | URL/UI state | Not shareable, bookmarkable, or backend-driven | URL search params serialized into query key |
| Merchant tab | Tabs `defaultValue` | UI/URL state | Lost on reload/navigation | Local UI state unless deep-linking is required; use URL if tabs are shareable |
| Notes/tasks/activities | Tab-local state | Server state incorrectly treated as client state | Lost on refresh and not scoped to persistence | Feature mutations and queries by merchant ID |
| Pipeline progress | Page-local state and `setTimeout` | UI state pretending to be server state | No durable job/status or failure handling | Backend job resource plus polling/streaming query |
| Login identity | `localStorage.user`; topbar uses `CURRENT_USER` | Session/client state | Two identities; no server session integration | HttpOnly server session plus `/auth/me` query |
| Sidebar/menu/dialogs | Component-local state | Client UI state | Appropriate in principle | Keep local, or small UI store only if cross-route coordination appears |
| Settings inputs | DOM defaults/local fields | Form state | No submit or persistence | Form library plus mutation |

Zustand, React Context, and TanStack Query are not currently used. Introducing Zustand for server data would be counterproductive; use TanStack Query for remote state and reserve local state/store usage for UI concerns.

## 10. Zod & TypeScript Audit

### Validation status

React Hook Form is not a frontend dependency and no `useForm`, `Controller`, or `zodResolver` usage exists. Zod is declared but unused. Frontend validation consists of ad hoc checks:

- Login checks non-empty fields.
- Add merchant checks required fields in `AddMerchantDialog.tsx:49-76`.
- Notes/tasks/activity silently return for missing values.
- Settings and password forms have no complete submit validation.

The backend uses `express-validator`, with feature-specific validator files. Validation is not shared with the frontend and does not cover all routes consistently.

### Contract divergence

Frontend `src/types/merchant-types.ts` uses:

```text
id: number
store: string
country: Country
industry: Industry
owner: MerchantOwner | null
lastActivity: string
```

Backend `src/types/merchant.types.ts` uses:

```text
id: string
store_name: string | null
platform: string | null
assigned_rep_id: string | null
last_activity_at: Date | null
outcome_at: Date | null
updated_at: Date
```

The backend list query additionally returns an `assigned_rep` object although the repository method is typed as `Promise<Merchant[]>` and the `Merchant` interface does not include that property (`merchant.repository.ts:101-130`).

### Unsafe or divergent typing

- `AddMerchantDialog` casts user values to `Country` and `Industry`.
- Merchant filter values are cast to `StatusFilter`.
- The frontend industry options use lowercase/hyphenated values while the union is title-cased.
- New frontend IDs use `Date.now()` numbers, incompatible with backend UUID strings.
- Backend request query fields use repeated `as string | undefined` assertions.
- Backend validation mapping uses `error: any`.
- `ai-provider.service.ts` parses untrusted content into `any`.
- `research-run.service.ts` uses `any[]`.
- `TasksTab` duplicates the task domain type.

### Recommended contract direction

Define transport DTOs separately from UI view models. Prefer one versioned contract source, ideally generated or shared between applications, with runtime parsing at the HTTP boundary. Map backend snake_case/UUID values to explicit frontend view models rather than pretending the existing fixture model is the API model.

## 11. API Contract Audit

| Feature | Frontend file | Method | Endpoint | Request | Response | Query/mutation | Backend exists | Issues |
|---|---|---|---|---|---|---|---|---|
| Login | `app/(auth)/login/page.tsx` | POST expected | `/api/v1/auth/login` | `{username,password}` | `{user}` plus cookie | Mutation absent | Yes | No request, API key, cookie handling, or server validation |
| Logout | `components/layout/topbar.tsx` | POST expected | `/api/v1/auth/logout` | Cookie | Session removal | Mutation absent | Yes | Only clears localStorage |
| Current user | `components/layout/topbar.tsx` | GET expected | Auth/user endpoint | Session | User/role | Query absent | Backend auth/user surface exists | Static `CURRENT_USER` is displayed |
| Merchant list | `app/(dashboard)/merchants/page.tsx` | GET expected | `/api/v1/merchants` | `limit`, `offset`, `q`, filters, sort | `{data,pagination}` | Query absent | Yes | Local filtering/pagination; no mapping |
| Merchant detail | `[id]/page.tsx` | GET expected | `/api/v1/merchants/:id` | UUID | `{data: merchant}` | Query absent | Yes | Numeric fixture IDs and static lookup |
| Add merchant | `AddMerchantDialog.tsx` | POST expected | `/api/v1/merchants` | Backend expects `domain`, optional `store_name`, `platform`, etc. | `{data: merchant}` | Mutation absent | Yes | Frontend sends `store`, does not persist |
| Update/delete | Merchant page/detail | PATCH/DELETE | `/api/v1/merchants/:id` | Backend DTO | Merchant/status response | Mutation absent | Yes | Controls inert or local-only |
| Contacts | Detail tabs | GET/POST/PATCH/DELETE | Merchant contact routes | Contact DTO | Contact DTO | Absent | Yes | No UI integration |
| Notes | `notes-tab.tsx` | GET/POST | Merchant note routes | Body/merchant ID | Notes | Absent | Yes | `merchantId` unused; local-only |
| Activities | `activity-tab.tsx` | GET/POST | Merchant activity routes | Type, time, detail | Activities | Absent | Yes | Form fields discarded |
| Tasks | `tasks-tab.tsx`, sales | GET/POST/PATCH | Merchant/task routes | Task DTO | Tasks | Absent | Yes | Local task type/state |
| Profile | `overview-tab.tsx` | GET/PATCH | Merchant profile routes | Profile DTO | Profile | Absent | Yes | Placeholder UI |
| Detection/research/scoring | Overview/pipeline | POST/GET | Detection, research, scoring routes | Domain-specific | Runs/results | Absent | Yes | Pipeline does not invoke them |
| Export | Merchants page | GET | `/api/v1/merchants/export` | Filters/export options | CSV stream | Absent | Yes | “Export CSV” has no handler |
| Settings/configuration | `settings/page.tsx` | CRUD expected | User/scoring/AI/config routes | Config DTOs | Config DTOs | Absent | Yes/partial | Controls are inert |

Backend merchant list supports server-side `limit`, `offset`, `q`, `status`, `platform`, `country`, `industry`, `assigned_rep`, `sort`, and `direction` (`merchant.controller.ts:8-40`; validator `merchant.validator.ts:63-106`). The frontend has no query serialization and its owner/status/domain fields do not map directly to the backend.

Backend error responses are inconsistent: API-key middleware returns `detail`, while auth and merchant controllers commonly return `message`. The future API client should normalize this at one boundary.

## 12. Authentication & Authorization Audit

### Backend authentication

The backend has two layers:

1. `requireApiKey` checks `X-API-Key` against `process.env.API_KEY`.
2. `requireSession` reads the `surepath_session` cookie, verifies its HMAC signature, hashes the token, checks the database session and expiry, and verifies that the user is active.

Login creates a random token, persists its hash in `sessions`, and sets an HttpOnly cookie in `auth.controller.ts:26-44`. Password changes are session-protected and bcrypt-backed.

### Frontend authentication

The frontend does not use the backend authentication system:

- Login accepts any non-empty username/password.
- It stores a fabricated user in `localStorage`.
- It redirects to `/dashboard`.
- It does not send `X-API-Key`.
- It does not establish or validate the backend session cookie.
- Topbar renders static `CURRENT_USER`.
- Logout clears all localStorage and redirects without calling backend logout.

No middleware or dashboard-layout guard protects routes. Any visitor can navigate directly to dashboard URLs.

### Integration risks

For a separate frontend/backend origin, the client will need credentials included for cookies. The backend currently uses default `cors()` rather than an explicit frontend origin with `credentials: true`. The session cookie is `SameSite=Lax` and has a one-day lifetime, while the UI says “Keep me signed in for 30 days”; this is an unresolved contract mismatch.

### Authorization and security findings

- `role.middleware.ts` is used on auth/user administration routes, but role coverage for merchant, enrichment, scoring, pipeline, and configuration operations needs to be verified and made explicit.
- There is no tenant/organization boundary in the schema or repository predicates.
- Backend login lacks request validation.
- The validation formatter includes submitted `error.value`, which could expose sensitive input if applied to password fields.
- `app.ts:18-21` enables permissive default `cors()` with no origin allowlist.
- Session cookies in `auth.controller.ts:33-40,107-110` omit the `Secure` flag.
- `api-key.middleware.ts:3-14` compares one static `X-API-Key` value with no visible scoping or rotation mechanism.
- `database.ts` configures PostgreSQL SSL with `rejectUnauthorized: false`; this weakens certificate verification and requires an explicit deployment decision.
- No frontend server/client boundary currently exposes backend secrets because no API client exists, but the eventual API key must remain server-side or be handled by a deliberate trusted proxy design. A browser-shipped API key would not be a secret.

## 13. Database Relationship Analysis

### Conceptual entity relationship map

```text
users
 ├──< sessions
 ├──< merchants.assigned_rep_id
 ├──< merchant_status_history.changed_by
 ├──< merchant_contacts.owner_id / created_by
 ├──< merchant_notes.author_id
 ├──< merchant_activities.logged_by
 ├──< merchant_tasks.assigned_to_id / created_by
 └──< merchant_detections.overridden_by

merchants
 ├── 1:1 merchant_profiles
 ├──< merchant_status_history
 ├──< merchant_contacts
 ├──< merchant_notes
 ├──< merchant_activities
 ├──< merchant_tasks
 ├──< merchant_detections
 ├──< merchant_scores >── scoring_configs
 ├──< research_runs
 │     └──< research_pages
 └──< merchant_provenance

industries
 └── standalone catalog; no FK from merchants.industry

ai_configs
 └── standalone versioned configuration
```

### Tables

Migrations define users, sessions, merchants, status history, profiles, contacts, notes, activities, tasks, detections, scoring configurations and scores, research runs/pages, provenance, industries, and AI configurations. Merchant-owned children generally cascade on merchant deletion. User references generally retain PostgreSQL default `NO ACTION`.

### Integrity gaps

- No tenant, organization, workspace, or account key exists.
- `merchants.industry` is free text despite a separate `industries` catalog.
- Multiple `merchant_contacts.is_primary = true` rows are allowed.
- `research_pages` independently references a run and merchant without enforcing that both belong to the same merchant.
- Merchant status and status history accept arbitrary strings.
- Confidence, score, factor counts, order counts, and monetary estimates lack range/logical checks.
- Research status and timestamps have no consistency constraints.
- Merchant scores have no explicit current/latest invariant; latest selection by timestamp can be nondeterministic for equal timestamps.
- AI config versions are not uniquely constrained per key.
- `updated_at` is application-maintained in several tables with no trigger.

These should be resolved before multi-user production use, particularly tenant isolation and authorization scope.

## 14. Mock & Hardcoded Data Audit

| Location | Mock/hardcoded behavior | Classification |
|---|---|---|
| `src/data/merchants.ts` | Fifteen fixed merchant records, scores, owners, statuses | REPLACE WITH API |
| `src/data/tasks.ts` | Fixed task records used by sales | REPLACE WITH API |
| `src/data/activities.ts` | Initial activity fixture | REPLACE WITH API |
| `src/data/settings.ts` | Team/scoring settings fixture | REPLACE WITH API or KEEP as seed/config fixture |
| `src/data/current-user.ts` | Static displayed user fallback | REPLACE WITH API |
| `merchants/page.tsx` | `Date.now()` IDs, local add/delete, success toasts | REPLACE WITH API |
| `merchants/[id]/page.tsx` | Static provider, contact count, opportunity, controls | REPLACE WITH API; product decisions may be needed |
| `overview-tab.tsx` | “Not scored yet”, no provider, no research | COMBINE WITH API |
| `policies-tab.tsx` | Fixed shipping/returns fallback | REPLACE WITH API or product-approved fallback |
| `pipeline/page.tsx` | Five hardcoded stages and timer | REPLACE WITH API job/status |
| `sales/page.tsx` | Unconditional empty-state copy and inert filters | REPLACE WITH API |
| `settings/page.tsx` | Inert team/configuration controls | REPLACE WITH API |
| `sidebar.tsx` | External API documentation link | KEEP if intentional |

The fixture files are useful for visual development but should be isolated behind a repository/query adapter so they cannot remain an accidental production source.

## 15. Problems Found

### Critical

1. **No effective authentication or route protection.** `login/page.tsx` accepts arbitrary credentials and dashboard routes have no middleware or layout session check. This allows unauthenticated access to all frontend routes.
2. **No tenant boundary in the database or repository queries.** Migrations contain no tenant/organization ownership, and merchant, score, provenance, and export queries are globally scoped. This is a data-isolation risk for any multi-tenant deployment.
3. **Frontend/backend are completely disconnected.** The UI presents successful login and mutations without contacting the authenticated backend, so the product cannot provide durable or authorized business behavior.

### High

1. **Backend authentication cannot be reached by the frontend.** The frontend sends neither `/api/v1/auth/login` nor the required `X-API-Key`, and it does not include credentials for the session cookie.
2. **Merchant data has multiple sources of truth.** List-page changes do not affect dashboard counts or detail lookup; newly added numeric IDs do not match backend UUIDs.
3. **All core business mutations are non-persistent.** Merchant CRUD, notes, tasks, activities, stage/owner/follow-up controls, settings, and pipeline actions are local-only or inert.
4. **Frontend and backend merchant contracts are incompatible.** Field names, ID types, response wrappers, owner representation, status values, and date representations differ.
5. **No frontend request/response validation exists.** Axios and Zod are declared but unused; no runtime parser protects the UI from malformed or changed API responses.
6. **Scoring and detail states contradict each other.** Dashboard/list display seeded fit values while overview says “Not scored yet.”
7. **Password update is unsafe and non-functional.** The UI logs password values to the browser console, lacks confirmation validation, and never calls the protected backend endpoint.
8. **Role enforcement is incomplete at the domain boundary.** Role middleware is used for reviewed user administration routes, but merchant, enrichment, scoring, pipeline, and configuration authorization coverage is not consistently evident.
9. **Login request validation is absent on the backend.** `POST /api/v1/auth/login` passes body fields directly to the service.
10. **Backend transport security is permissive.** Default CORS accepts any origin, session cookies omit `Secure`, and the API key is a single static shared secret.

### Medium

1. **No centralized Express error handler or consistent API error envelope.**
2. **Merchant list filtering/pagination is entirely client-side and page state is not clamped when filters/deletions change.**
3. **Search/filter/pagination/tabs are not represented in URL state.**
4. **Large route components combine rendering, domain logic, state ownership, and notifications.**
5. **Activity form discards submitted channel, date/time, and notes.**
6. **Task list header claims all tasks are done even when newly added tasks are open.**
7. **Database invariants for status values, primary contacts, research ownership, score ranges, and timestamps are not enforced.**
8. **Validation error formatting can echo submitted values.**
9. **Frontend has no loading, mutation pending, error, retry, or empty states for real server operations.**
10. **Backend types are wider/narrower than actual SQL row shapes and contain untyped JSON/`any` paths.**

### Low

1. Sidebar and mobile navigation duplicate link markup and branding.
2. No dynamic imports or image usage currently exist; these are future optimization considerations rather than current defects.
3. `useMemo` could reduce repeated local filter calculations, although server-side filtering is the better production solution.
4. `sales/page.tsx` computes dates during render without a defined timezone policy.
5. Starter README documentation does not describe the actual application.

## 16. Decisions Required

### NEEDS PRODUCT DECISION — Tenant model

**Current situation:** No tenant/organization/workspace relationship exists in the schema.

**Option A:** Add an organization/workspace entity and `tenant_id` to all tenant-owned tables, enforce repository predicates, and consider PostgreSQL row-level security.

**Option B:** Declare the deployment single-tenant and explicitly remove tenant assumptions from product requirements.

**Tradeoffs:** Option A requires migration and authorization work but supports safe multi-tenant growth. Option B is simpler but creates a hard product limitation and does not protect against future accidental multi-tenant use.

**Recommended direction:** Option A unless the product is explicitly and permanently single-tenant.

### NEEDS PRODUCT DECISION — Session lifetime and “keep me signed in”

**Current situation:** UI promises 30 days; backend cookie is one day; checkbox is unused.

**Option A:** Implement persistent session duration selected at login and server-side session rotation/revocation.

**Option B:** Remove the checkbox and document a fixed one-day session.

**Recommended direction:** Option A only if the product needs persistent operator sessions; otherwise make the UI match the one-day backend behavior.

### NEEDS PRODUCT DECISION — Pipeline execution model

**Current situation:** UI simulates five sequential stages with a two-second timer.

**Option A:** Backend job resource with durable status, progress, retries, and polling/streaming.

**Option B:** One synchronous orchestration request that completes within the request timeout.

**Tradeoffs:** A job is resilient for research/AI work but adds persistence and status UI. Synchronous execution is simpler but fragile for slow providers.

**Recommended direction:** Backend job orchestration with persisted run status.

### NEEDS PRODUCT DECISION — Scoring semantics

**Current situation:** Seed data has `fit` values, overview says “Not scored yet,” and scoring tables/configurations exist in the backend.

**Option A:** Treat score as a versioned backend result with current/latest semantics.

**Option B:** Treat fit as a manually maintained merchant attribute.

**Recommended direction:** Option A, aligned with `merchant_scores` and `scoring_configs`, with an explicit display rule for unscored merchants.

### API key placement

**Current situation:** Backend requires `X-API-Key` on routes. A browser cannot safely hide a long-lived API key.

**Option A:** Next.js server-side proxy/BFF adds the API key and forwards the HttpOnly session.

**Option B:** Expose a browser-safe public gateway credential and move trust to a separately secured edge layer.

**Recommended direction:** Option A for the current architecture; never embed the backend API key in client JavaScript.

## 17. Recommended Target Architecture

### Frontend

Retain the current App Router and route groups. Add feature data-access modules without requiring an immediate folder migration:

```text
src/
├── app/
├── components/
├── data/                 # temporary fixtures only
├── features/
│   ├── auth/
│   ├── merchants/
│   ├── pipeline/
│   ├── sales/
│   └── settings/
├── lib/
│   ├── api/
│   ├── auth/
│   └── query/
├── schemas/
└── types/
```

Route-local UI can move only when it is reused or becomes difficult to maintain.

### API layer

Use one server-safe API client with:

- base URL configuration
- API key injection outside browser bundles
- cookie credentials
- normalized error envelope
- explicit timeout/retry policy
- response parsing at the boundary

Use a Next.js server-side proxy if the browser must not receive the backend API key.

### State

- TanStack Query for merchants, users, scores, research, activities, notes, tasks, settings, and pipeline job state.
- Local React state for dialog visibility, transient form fields, and small UI preferences.
- URL search params for merchant search, filters, sorting, pagination, and optionally selected tabs.
- Do not use Zustand as a second server cache.

### Validation and types

Use runtime schemas for request and response DTOs. Maintain transport types separately from UI view models. Prefer shared/generated contracts for backend/frontend agreement, and map snake_case backend fields deliberately.

### Backend

Keep routes/controllers/services/repositories. Add:

- centralized error middleware
- consistent error envelope
- explicit authorization middleware
- tenant scope in service/repository APIs
- request parameter validation, including IDs
- service-level transaction policy
- runtime response serialization/validation where external providers are involved

### Database

Add tenant ownership and constraints based on the product decision. Enforce status vocabulary, primary-contact uniqueness, research run/page consistency, score ranges, and relevant timestamp invariants in migrations.

### Authentication

Use the existing server-side session approach, with:

- backend login/logout/me calls
- HttpOnly, Secure, SameSite policy appropriate to deployment
- explicit CORS origin and credentials configuration
- route protection at the Next.js boundary
- backend session and role enforcement on every protected route
- no API key in client code

## 18. Frontend → Backend Integration Plan

### Phase 1 — Authentication foundation

**Goal:** Replace mock login with a real session and protect dashboard routes.

**Dependencies:** Decide session lifetime, deployment origins, and API-key placement.

**Frontend:** Add server-safe API/proxy boundary, login mutation, session bootstrap, logout mutation, unauthorized handling, and dashboard guard.

**Backend:** Add login validation, verify CORS/cookie settings, add/verify `/me`, apply role middleware where required, and standardize auth errors.

**Database:** Confirm session expiry/revocation indexes and user bootstrap behavior.

**Definition of done:** Invalid credentials fail; valid login creates a server session; direct dashboard access without a session redirects; logout invalidates the server session.

### Phase 2 — Contract and API client foundation

**Goal:** Establish DTOs, schemas, error handling, and query conventions.

**Dependencies:** Phase 1 auth and API-key decisions.

**Frontend:** Add typed client, runtime parsers, query client/provider, query-key factory, and transport-to-view-model mappers.

**Backend:** Normalize response/error envelopes and validate route IDs/queries.

**Database:** None beyond agreed tenant identifiers if Phase 1 exposes them.

**Definition of done:** A single authenticated health/current-user request works through the same client used by features.

### Phase 3 — Merchant read path

**Goal:** Make dashboard, merchant list, and detail use backend data.

**Dependencies:** Phases 1–2; UUID/view-model mapping.

**Frontend:** Implement list/detail queries; serialize URL search/filter/sort/page state; add loading/error/empty states; use server/client boundaries intentionally.

**Backend:** Verify list/detail DTOs and tenant/authorization scope.

**Database:** Add or verify indexes for common list filters and tenant scope.

**Definition of done:** Refreshing and navigating between list/detail reflects PostgreSQL data and preserves query state.

### Phase 4 — Merchant mutations and CRM resources

**Goal:** Persist add/update/delete, contacts, notes, activities, and tasks.

**Dependencies:** Merchant read path and mutation/error conventions.

**Frontend:** Replace local updates with mutations; invalidate/update merchant/list/detail/child queries; add pending/error states; preserve all form fields.

**Backend:** Verify request DTOs, authorization, duplicate handling, and transaction boundaries.

**Database:** Enforce child ownership and primary-contact constraints.

**Definition of done:** Mutations survive reload, update all affected views, and display server failures without optimistic false success.

### Phase 5 — Research, detection, profiles, and scoring

**Goal:** Replace placeholder merchant enrichment and score displays.

**Dependencies:** Merchant detail and backend provider services.

**Frontend:** Add queries/mutations for profile, research, detection, policies, and score; define explicit loading/unscored/failed states.

**Backend:** Standardize run/result DTOs, provider failure handling, and score-current semantics.

**Database:** Add needed constraints/indexes for current/latest results and research consistency.

**Definition of done:** A merchant's enrichment and score status is derived from backend records and consistent across list, dashboard, and detail.

### Phase 6 — Pipeline orchestration

**Goal:** Replace timer simulation with a durable workflow.

**Dependencies:** Phases 4–5 and pipeline job decision.

**Frontend:** Submit selected scope/options, display persisted progress, poll or subscribe, handle retries/failures/cancellation.

**Backend:** Add orchestration/job endpoint and durable stage status; ensure idempotency and authorization.

**Database:** Add pipeline/run tables or extend research-run modeling as decided.

**Definition of done:** Refreshing during a run does not lose progress and completed stages produce visible domain results.

### Phase 7 — Sales and dashboard

**Goal:** Replace static task/count summaries with queries.

**Dependencies:** Merchant/task/activity persistence.

**Frontend:** Implement actual “My work/All work”, overdue/today/open sections, dashboard metrics, links, and empty/loading/error states.

**Backend:** Add aggregate endpoints or efficient query composition.

**Database:** Verify indexes for due dates, assignment, status, and tenant scope.

**Definition of done:** Sales and dashboard reflect the same backend state as merchant detail.

### Phase 8 — Settings and configuration

**Goal:** Connect team, scoring, AI configuration, and password flows.

**Dependencies:** Auth roles, scoring semantics, and authorization matrix.

**Frontend:** Use validated forms and mutations; expose publish/version states; implement password change without logging secrets.

**Backend:** Enforce role permissions and configuration version/active invariants.

**Database:** Add AI key/version uniqueness and audit requirements.

**Definition of done:** Every enabled control has a real request, authorization, pending/error feedback, and durable result.

### Phase 9 — Mock removal and test coverage

**Goal:** Remove accidental fixture dependencies and verify contracts.

**Dependencies:** Feature integration phases.

**Frontend/backend:** Delete or isolate production fixture imports; add unit, integration, API contract, and end-to-end tests.

**Definition of done:** CI catches auth, contract, persistence, tenant-scope, and critical user-flow regressions.

### Phase 10 — Performance and security hardening

**Goal:** Make the integrated system production-ready.

**Work:** Server-side pagination/filtering, query cache policy, request deduplication, job polling efficiency, explicit CORS, secure cookie settings, secret handling, rate limits, audit logging, database constraints, and observability.

## 19. Feature-by-Feature Roadmap

| Feature | UI | API | DB | Types | Zod | Query/mutation | Auth | Integration | Next action |
|---|---|---|---|---|---|---|---|---|---|
| Auth | Present mock UI | Present backend | Users/sessions present | Divergent user models | Absent | Absent | Backend exists, frontend absent | Disconnected | Implement real login/me/logout and guard |
| Merchants | Present list/detail/forms | CRUD/list/export present | Merchants present | Incompatible ID/field shapes | Absent | Absent | API key/session backend | Disconnected | Define DTO mapper and list query |
| Contacts | Not meaningfully surfaced | Present | Present | Backend only | Absent | Absent | Session routes | Disconnected | Integrate after merchant detail |
| Notes | Local tab | Present | Present | Local UI only | Absent | Local state only | Session routes | Disconnected | Add merchant-scoped query/mutation |
| Activities | Local tab | Present | Present | Incomplete local activity | Absent | Local state only | Session routes | Disconnected | Preserve full activity payload |
| Tasks | Local tab and sales | Present | Present | Duplicate local/backend types | Absent | Local state only | Session routes | Disconnected | Share task DTO and persist |
| Profile/policies | Placeholder | Present | Profile table present | Backend only | Absent | Absent | Session routes | Disconnected | Define response states |
| Detection/research | Placeholder | Present | Present | Backend only | Absent | Absent | Session routes | Disconnected | Integrate run/result status |
| Scoring | Contradictory fixture display | Present | Scores/configs present | Fit vs score mismatch | Absent | Absent | Role likely needed for config | Disconnected | Decide score semantics |
| Pipeline | Timer simulation | Domain routes exist; orchestration incomplete | Run tables partial | Absent | Absent | Local timer | None effective | Disconnected | Design durable job contract |
| Sales/dashboard | Static summaries | Aggregate support needs verification | Tasks/merchants present | Fixture-derived | Absent | Absent | None effective | Disconnected | Build aggregate queries |
| Settings | Inert controls | User/scoring/AI routes exist | Config tables present | Backend types only | Absent | Absent | Role enforcement needed | Disconnected | Define permission matrix |

## 20. File-Level Implementation Plan

The following are future modification targets only; no implementation changes were made during this audit.

### Frontend

```text
src/app/(auth)/login/page.tsx
src/app/(dashboard)/layout.tsx
src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/merchants/page.tsx
src/app/(dashboard)/merchants/[id]/page.tsx
src/app/(dashboard)/merchants/_components/AddMerchantDialog.tsx
src/app/(dashboard)/merchants/_components/DeleteMerchantDialog.tsx
src/app/(dashboard)/merchants/[id]/_components/merchants-tabs.tsx
src/app/(dashboard)/merchants/[id]/_components/overview-tab.tsx
src/app/(dashboard)/merchants/[id]/_components/policies-tab.tsx
src/app/(dashboard)/merchants/[id]/_components/notes-tab.tsx
src/app/(dashboard)/merchants/[id]/_components/tasks-tab.tsx
src/app/(dashboard)/merchants/[id]/_components/activity-tab.tsx
src/app/(dashboard)/pipeline/page.tsx
src/app/(dashboard)/sales/page.tsx
src/app/(dashboard)/settings/page.tsx
src/components/layout/topbar.tsx
src/components/layout/sidebar.tsx
src/components/auth/update-password-dialog.tsx
src/lib/navigation.ts
src/types/merchant-types.ts
src/types/task-types.ts
src/data/*                         # isolate/remove after migration
src/lib/api/client.ts              # future
src/lib/api/errors.ts              # future
src/lib/query/query-client.ts      # future
src/features/auth/*                # future
src/features/merchants/*           # future
src/features/pipeline/*            # future
src/features/sales/*               # future
src/features/settings/*            # future
src/schemas/*                      # future
```

### Backend

```text
src/app.ts
src/server.ts
src/routes/auth.routes.ts
src/routes/merchant.routes.ts
src/routes/users.routes.ts
src/routes/tasks.routes.ts
src/routes/scoring.routes.ts
src/routes/research.routes.ts
src/routes/profiles.routes.ts
src/routes/detections.routes.ts
src/routes/discovery.routes.ts
src/routes/industries.routes.ts
src/routes/ai.routes.ts
src/controllers/auth.controller.ts
src/controllers/merchant.controller.ts
src/services/auth.service.ts
src/services/merchant.service.ts
src/middleware/api-key.middleware.ts
src/middleware/auth.middleware.ts
src/middleware/role.middleware.ts
src/middleware/validation.middleware.ts
src/validators/auth.validator.ts
src/validators/merchant.validator.ts
src/config/database.ts
src/types/merchant.types.ts
src/repositories/merchant.repository.ts
src/repositories/auth.repository.ts
src/repositories/merchant-export.repository.ts
migrations/*                         # tenant/invariant updates as decided
```

## 21. Risks & Dependencies

| Risk/dependency | Why it matters | Mitigation |
|---|---|---|
| Tenant decision delayed | Authorization and every repository query depend on ownership | Decide before broad frontend integration |
| API key exposed to browser | Long-lived key would be extractable | Use Next.js server proxy/BFF |
| CORS/cookie mismatch | Login may appear successful but session requests fail cross-origin | Configure explicit origin and credentials; test browser flow |
| UUID versus numeric fixture IDs | Detail navigation and mutations cannot map records | Replace fixture ID assumptions with backend DTO mapping |
| Inconsistent error envelopes | UI cannot reliably show auth/validation/server errors | Normalize in client and backend |
| Pipeline duration/provider failures | Timer simulation hides retries and durable state needs | Use job resource with idempotency and persisted stages |
| Missing role enforcement | Authenticated users may access configuration/admin actions | Define permission matrix and apply middleware |
| No tenant database constraints | Application omissions can leak records | Add tenant columns, predicates, indexes, and tests |
| Static mock imports remain | Pages can silently show stale fixture data after partial migration | Track and remove imports feature by feature |
| Backend response shape drift | UI may break at runtime despite TypeScript compiling | Runtime parse DTOs and contract tests |

## 22. Recommended Implementation Order

1. Decide tenant model, session lifetime, deployment origins, API-key placement, and scoring/pipeline semantics.
2. Harden backend authentication entry points: login validation, explicit CORS/cookie configuration, `/me`, role enforcement, and centralized errors.
3. Add the frontend API boundary and TanStack Query provider without introducing a second global server-state store.
4. Integrate authentication and dashboard route protection.
5. Define transport DTOs/runtime schemas and map backend UUID/snake_case data to frontend view models.
6. Integrate merchant list/detail reads with URL-driven filters and server-side pagination.
7. Integrate merchant CRUD and child CRM resources with mutation feedback and invalidation.
8. Integrate profile, research, detection, policies, and scoring using explicit loading/unscored/failed states.
9. Replace pipeline animation with a durable backend job and persisted progress.
10. Connect sales/dashboard aggregates and settings/configuration flows.
11. Isolate/remove fixtures and add contract, integration, and end-to-end tests.
12. Apply database constraints, tenant isolation, performance policy, observability, and security hardening.

## 23. Immediate Next Step

Before implementing feature APIs, make the cross-cutting decision set explicit: tenant/workspace scope, session lifetime, API-key placement, CORS/deployment topology, role permissions, score semantics, and pipeline execution model. Then implement the authentication/API-client foundation as the first vertical slice. This removes the largest security and integration risks and establishes the contract needed by every subsequent feature.
