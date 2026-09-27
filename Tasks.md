# Tohfawala CRM — Implementation Task List

> Follow the **ECC Lifecycle**: Plan → Test (RED) → Implement (GREEN) → Review → Verify → Remember
> Each task below is a single logical unit of work. Tasks are ordered by dependency — do not skip ahead.
> Every task requires a TDD spec written first unless marked `[no-test]`.

---

## Phase 0: Foundation

### 0.1 Supabase Client & Types
- [x] Create `src/lib/supabase/client.ts` (browser client)
- [x] Create `src/lib/supabase/server.ts` (server client for RSC)
- [x] Generate TypeScript types from DB schema (manually from migrations since no Supabase project linked)
- [x] Save types to `src/types/supabase.ts`
- [x] Verify types compile (`tsc --noEmit` passes)

### 0.2 Authentication
- [x] `[no-test]` Create `/auth/login` page with email + password form
- [x] Implement `login action` using `supabase.auth.signInWithPassword`
- [ ] Create `/auth/callback` route for OAuth redirects (if used) — deferred
- [x] Implement `signOut action`
- [x] Create `useUser` hook (wraps `supabase.auth.getUser()`)
- [x] Create `useRole` hook (returns `admin` | `salesperson` from profile)
- [x] Add `middleware.ts` for route protection (redirect to `/auth/login` if unauthenticated)
- [ ] `[test]` Middleware redirects unauthenticated users — deferred (test infra)

### 0.3 Shared UI Scaffold
- [x] Create `src/components/Layout/AppLayout.tsx` — sidebar + header shell
- [x] Create `src/components/Layout/Sidebar.tsx` — role-based navigation links
- [x] Create `src/components/Layout/Header.tsx` — user menu, notifications
- [x] Update `src/app/layout.tsx` — updated with Inter font, metadata, dark mode support
- [x] Create `src/lib/utils.ts` — `cn()` helper
- [x] Create `src/app/globals.css` — Tailwind base + custom properties from Design.md
- [x] Add dark mode support (CSS variables in :root + .dark)
- [ ] Add dark mode toggle component (in Header)
- [ ] `[test]` Layout renders without crashing — deferred (test infra)

### 0.4 Shared Utilities
- [ ] Create `src/lib/validators/customer.ts` — Zod schemas for customer validation
- [ ] Create `src/lib/validators/followup.ts` — Zod schemas for follow-up validation
- [ ] Create `src/lib/validators/campaign.ts` — Zod schemas for campaign validation
- [x] Create `src/lib/validators/auth.ts` — Zod schemas for login/signup
- [ ] Create `src/lib/helpers/format.ts` — phone formatting, date formatting, etc.
- [ ] Create `src/lib/helpers/status.ts` — status label/color mapping
- [ ] Create `src/lib/constants/ui.ts` — page sizes, default values
- [ ] Set up test infrastructure (Vitest + React Testing Library)
- [ ] `[test]` All validators correctly parse/validate sample data — deferred (test infra)

---

## Phase 1: Customers Module

### 1.1 Customer Data Model
- [ ] Verify migration `002_customers.sql` is applied
- [ ] Confirm `customer_status` enum, `customers`, `customer_phones`, `tags`, `customer_tags` tables

### 1.2 Customer List
- [ ] `[test]` Write test for `GET /api/customers` returning paginated list
- [ ] Implement `GET /api/customers` — server action with search, filter, sort, pagination
- [ ] `[test]` Customer list shows correct data when given sample customers
- [ ] Create `src/app/(crm)/customers/page.tsx` — list view with filters
- [ ] Create `src/components/Customers/CustomerTable.tsx`
- [ ] Create `src/components/Customers/CustomerFilters.tsx`
- [ ] Create `src/components/Customers/CustomerSearch.tsx`
- [ ] `[test]` Table renders correctly with 50+ rows

### 1.3 Add Customer
- [ ] `[test]` Write test for `POST /api/customers` validation (missing required fields)
- [ ] Implement `create action` using server action pattern
- [ ] Create `src/app/(crm)/customers/add/page.tsx` — add form
- [ ] Create `src/components/Customers/AddCustomerForm.tsx`
- [ ] Add form field: name, mobile, email, company, city, industry, source, tags, status, notes
- [ ] `[test]` Form submission validates required fields and shows errors

### 1.4 Edit Customer
- [ ] `[test]` Write test for `PUT /api/customers/:id`
- [ ] Implement `update action`
- [ ] Create `src/app/(crm)/customers/[id]/edit/page.tsx`
- [ ] Populate form with existing customer data
- [ ] `[test]` Edit form preserves existing values

### 1.5 Archive Customer
- [ ] `[test]` Write test for `archive action` (sets `archived_at`, doesn't delete)
- [ ] Implement `archive action` (server action)
- [ ] Add archive button to customer detail page
- [ ] Add "Archived" filter to customer list

### 1.6 Customer Phones
- [ ] `[test]` Write test for phone CRUD operations
- [ ] Implement phone management in the edit form (add/remove phone numbers)
- [ ] Add primary phone selector
- [ ] `[test]` At least one phone remains after edits

### 1.7 Tags
- [ ] `[test]` Write test for tag CRUD (admin only for creation)
- [ ] Implement `GET /api/tags`, `POST /api/tags`, `DELETE /api/tags/:id`
- [ ] Create tag management UI in Settings (admin)
- [ ] Add tag selector to customer form
- [ ] `[test]` Tags display correctly on customer card

### 1.8 Import Customers
- [ ] `[test]` Write test for CSV parser (field mapping, validation)
- [ ] Create `src/app/(crm)/customers/import/page.tsx`
- [ ] Implement file upload, column reading, column mapping UI
- [ ] Implement validation (duplicate detection: name + mobile, phone validation)
- [ ] Show import preview (total, valid, warnings, errors, duplicates)
- [ ] Implement import execution (batch insert with error handling)
- [ ] Show import summary with error CSV download option
- [ ] `[test]` Import flow handles 2,500 rows with 27 errors and 18 duplicates

---

## Phase 2: Dashboard

### 2.1 Dashboard Data
- [ ] `[test]` Verify `dashboard_stats` view returns correct metrics
- [ ] Verify `pipeline_counts` view returns correct status counts
- [ ] `[test]` Dashboard stats update after customer creation

### 2.2 Admin Dashboard
- [ ] Create `src/app/(crm)/dashboard/admin/page.tsx`
- [ ] Create overview cards (customers, active chats, campaigns, unread, follow-ups, overdue)
- [ ] Create sales pipeline card (status → count)
- [ ] Create recent conversations list
- [ ] Create today's follow-ups list
- [ ] Wire up click handlers (Unread → Inbox, Follow-ups → Follow-ups page, etc.)

### 2.3 Salesperson Dashboard
- [ ] Create `src/app/(crm)/dashboard/salesperson/page.tsx`
- [ ] Show own customers, own conversations, own follow-ups
- [ ] Filter pipeline by assigned salesperson
- [ ] `[test]` Salesperson dashboard only shows their data

### 2.4 Dashboard Routing
- [ ] Implement role-based redirect: admin → `/dashboard/admin`, salesperson → `/dashboard/salesperson`
- [ ] `[test]` Role-based routing is correct

---

## Phase 3: Customer 360

### 3.1 Customer Detail
- [ ] Create `src/app/(crm)/customers/[id]/page.tsx` — main Customer 360 page
- [ ] Create customer header (name, company, mobile, status, assigned to, tags)
- [ ] Create `src/components/Customer360/CustomerHeader.tsx`
- [ ] Create action buttons: [Message], [Follow-up], [Edit], [Status]

### 3.2 Customer 360 Tabs
- [ ] Create `src/components/Customer360/Customer360Tabs.tsx` using Radix Tabs
- [ ] Implement Overview tab (customer info edit form)
- [ ] Implement WhatsApp tab (conversation history)
- [ ] Implement Activity tab (timeline of system actions)
- [ ] Implement Notes tab (internal notes with add form)
- [ ] Implement Follow-ups tab (list + create form)
- [ ] `[test]` All 5 tabs display correct content

### 3.3 Customer 360 Actions
- [ ] Implement status change (inline dropdown on header)
- [ ] Implement quick assign (assign to salesperson)
- [ ] Implement add tag (inline tag selector)
- [ ] `[test]` Customer 360 updates reflect in customer list

---

## Phase 4: WhatsApp Inbox

### 4.1 Conversations
- [ ] `[test]` Verify `conversations` and `messages` tables exist with correct schema
- [ ] `[test]` Verify `messages.campaign_id` and `messages.attributed_campaign_id` FK after migration 004

### 4.2 Conversation List
- [ ] Create `src/app/(crm)/whatsapp/inbox/page.tsx`
- [ ] Create `src/components/WhatsApp/ConversationList.tsx` — 3-panel layout
- [ ] Implement filters: All, Unread, Assigned to Me
- [ ] Show: customer name, last message, last activity, unread indicator, status badge
- [ ] `[test]` Conversation list shows unread indicator correctly

### 4.3 Conversation View
- [ ] Create `src/components/WhatsApp/ConversationView.tsx`
- [ ] Render message history (customer vs salesperson bubbles)
- [ ] Implement message input with send button
- [ ] Add media actions: [Attach] → Image, PDF, Video
- [ ] `[test]` Messages render correctly for both directions

### 4.4 Customer Context Panel
- [ ] Create `src/components/WhatsApp/CustomerContext.tsx` — right-side panel
- [ ] Show: customer name, company, status, assigned to, tags, next follow-up
- [ ] Add [View Customer 360] link

### 4.5 Inbox Actions
- [ ] Implement quick status change from conversation
- [ ] Implement create follow-up from conversation (customer pre-selected)
- [ ] Implement add note from conversation
- [ ] Implement assign conversation dropdown
- [ ] `[test]` Creating a follow-up from inbox associates it with the customer

### 4.6 Real-time Updates
- [ ] Set up Supabase Realtime on `conversations` and `messages` tables
- [ ] Inbox updates without refresh when new message arrives
- [ ] Unread count updates on Dashboard
- [ ] `[test]` Realtime subscription receives new message events

---

## Phase 5: Campaigns

### 5.1 WhatsApp Templates
- [ ] `[test]` Write test for template CRUD (admin approval)
- [ ] Create `src/app/(crm)/campaigns/templates/page.tsx`
- [ ] Create `src/components/Campaigns/TemplateList.tsx`
- [ ] Create `src/components/Campaigns/TemplateForm.tsx`
- [ ] Implement admin-only approval workflow (status: draft → pending → approved/rejected)
- [ ] `[test]` Salesperson can create template but not approve

### 5.2 Campaign List
- [ ] Create `src/app/(crm)/campaigns/page.tsx`
- [ ] Create `src/components/Campaigns/CampaignTable.tsx`
- [ ] Show: name, audience, sent, replies, status
- [ ] Add filter/sort
- [ ] `[test]` Table matches PRD screen layout

### 5.3 Create Campaign
- [ ] Create `src/app/(crm)/campaigns/new/page.tsx` (campaign creation wizard)
- [ ] Step 1: Campaign details (name, description)
- [ ] Step 2: Audience selection (all / selected / filtered by tags/city/status)
- [ ] Step 3: Template selection (approved templates only)
- [ ] Step 4: Campaign media (upload PDF/image/video)
- [ ] Step 5: Preview (message preview with merge tags, media, audience count)
- [ ] Step 6: Schedule (send now or schedule for later)
- [ ] Step 7: Submit for approval
- [ ] `[test]` Campaign wizard validates all steps before submission

### 5.4 Campaign Review & Approval
- [ ] Create `src/app/(crm)/campaigns/[id]/page.tsx` (campaign detail)
- [ ] Create `src/components/Campaigns/CampaignDetail.tsx`
- [ ] Implement approval action (`campaigns.status` → `approved`)
- [ ] Implement rejection action (`campaigns.status` → `draft`)
- [ ] `[test]` Only admin can approve campaign

### 5.5 Send Campaign
- [ ] Implement `schedule campaign` action (status → `scheduled`)
- [ ] Implement background job to process scheduled campaigns:
  - Create `campaign_recipients` records with `UNIQUE(campaign_id, customer_id)`
  - Queue messages for sending (database-backed queue initially)
  - Respect `marketing_opt_out` flag
- [ ] `[test]` Campaign sending respects opt-out and uniqueness constraint

### 5.6 Campaign Analytics
- [ ] Create `src/app/(crm)/campaigns/[id]/analytics/page.tsx`
- [ ] Display: audience, sent, delivered, read, replies, failed, opted-out
- [ ] Show recipient breakdown by status (table with customer names)
- [ ] `[test]` Analytics match data from `campaign_analytics` view

---

## Phase 6: Follow-ups

### 6.1 Follow-up CRUD
- [ ] `[test]` Write test for follow-up create/update/delete
- [ ] Implement `create action` (server action)
- [ ] Implement `update action` (status, assignment, dates)
- [ ] Implement `complete action`

### 6.2 Follow-up List
- [ ] Create `src/app/(crm)/followups/page.tsx`
- [ ] Create `src/components/FollowUps/FollowUpTable.tsx`
- [ ] Filters: Today, Upcoming, Overdue, Completed
- [ ] Show: date/time, customer, task, assigned to, priority, status
- [ ] `[test]` Overdue status auto-derived from due date

### 6.3 Create Follow-up Form
- [ ] Create `src/components/FollowUps/CreateFollowUpForm.tsx`
- [ ] Fields: customer (select), task, date, time, assigned to, priority, reminder
- [ ] Default reminder: 30 minutes before
- [ ] Pre-select customer when created from Customer 360 or Inbox
- [ ] `[test]` Form validates required fields

### 6.4 Dashboard Integration
- [ ] Dashboard shows "Today's Follow-ups" section
- [ ] Clicking a follow-up opens related customer/context
- [ ] `[test]` Dashboard follow-ups count matches Follow-ups page

### 6.5 Reassignment
- [ ] Implement follow-up reassignment (any salesperson → any salesperson)
- [ ] Record assignment history in activity table
- [ ] `[test]` Reassignment creates activity log entry

---

## Phase 7: Notes

### 7.1 Note CRUD
- [ ] `[test]` Write test for note creation and editing
- [ ] Implement note actions tied to customer (and optionally conversation)
- [ ] Create `src/components/Notes/NoteList.tsx`
- [ ] Create `src/components/Notes/NoteForm.tsx`
- [ ] `[test]` Notes show author and timestamp

---

## Phase 8: Activity History

### 8.1 Activity Feed
- [ ] Create `src/components/Activity/ActivityTimeline.tsx`
- [ ] Show: timestamp, user, action type, description
- [ ] Implement key activity generation:
  - Customer created/updated/assigned
  - Status changed (from → to)
  - Conversation assigned
  - Message sent/received
  - Follow-up created/completed/reassigned
  - Campaign created/approved/sent
- [ ] `[test]` Activity records are created for system actions

### 8.2 Activity Triggers
- [ ] Implement triggers in server actions (not client-side):
  - Status change → activity record
  - Follow-up complete → activity record
  - Customer assignment → activity record

---

## Phase 9: Reports

### 9.1 Campaign Reports
- [ ] Create `src/app/(crm)/reports/campaigns/page.tsx`
- [ ] Show campaign performance (chart + table) per campaign
- [ ] Link to recipient list (view customers behind each metric)
- [ ] `[test]` Report data matches campaign analytics view

### 9.2 Customer Status Report
- [ ] Create `src/app/(crm)/reports/customer-status/page.tsx`
- [ ] Pipeline visualization (status → count)
- [ ] Filter by salesperson, date range
- [ ] Uses `customer_status_history` for date-range filtering
- [ ] `[test]` Status history report shows correct historical data

### 9.3 Follow-up Report
- [ ] Create `src/app/(crm)/reports/follow-ups/page.tsx`
- [ ] Show: pending, completed, overdue totals
- [ ] Per-salesperson breakdown
- [ ] `[test]` Report matches current follow-up statuses

### 9.4 Salesperson Activity Report
- [ ] Create `src/app/(crm)/reports/salesperson/page.tsx`
- [ ] Show replies, follow-ups, customers per salesperson
- [ ] Only admin can view all salespeople; salesperson sees own
- [ ] `[test]` Salesperson report restricted to own data

### 9.5 CSV Export
- [ ] Implement CSV export for all reports (use `papaparse`)
- [ ] `[test]` Exported CSV matches table data

---

## Phase 10: Settings

### 10.1 User Management (Admin only)
- [ ] Create `src/app/(crm)/settings/users/page.tsx`
- [ ] List users, roles, activation status
- [ ] Create/edit users, change roles
- [ ] `[test]` Non-admin users cannot access settings

### 10.2 Role Management
- [ ] Display initial roles: Admin, Salesperson
- [ ] `[no-test]` No custom roles in Phase 1

---

## Phase 11: WhatsApp API Integration

### 11.1 WhatsApp Service Layer
- [ ] Create `src/lib/whatsapp/service.ts` — WhatsAppService abstraction
- [ ] Implement `sendTemplate()` method
- [ ] Implement `sendText()` method
- [ ] Implement `sendMedia()` method
- [ ] Implement `getMessageStatus()` method
- [ ] Implement `handleWebhook()` method
- [ ] Implement `validateWebhook()` method (signature verification)
- [ ] `[test]` Service interface defined (types only until credentials available)

### 11.2 Webhook Endpoint
- [ ] Create `src/app/api/webhooks/whatsapp/route.ts` (POST endpoint)
- [ ] Implement webhook verification (GET challenge)
- [ ] Validate request signature
- [ ] Queue event for async processing
- [ ] `[test]` Invalid webhook requests are rejected

### 11.3 Message Queue Processing
- [ ] Create background worker for campaign sending
- [ ] Process campaign recipients in batches (20 at a time)
- [ ] Update recipient status (pending → sending → sent → delivered → read → failed)
- [ ] Handle retries (max 3 attempts, exponential backoff)
- [ ] `[test]` Queue worker processes pending recipients and updates status

### 11.4 24-Hour Conversation Window
- [ ] Implement `last_customer_message_at` tracking on conversations
- [ ] Backend rule: block free-form replies outside 24h window
- [ ] UI: show template selector when outside window
- [ ] `[test]` Backend rejects free-form message outside 24h window

---

## Phase 12: Testing & Quality

### 12.1 Test Infrastructure
- [ ] Set up test runner (Vitest or Jest)
- [ ] Configure test database (Supabase project for testing)
- [ ] Create test helpers (`test-utils.ts`, `mock-supabase.ts`)
- [ ] Set up test data factories
- [ ] Configure coverage threshold (80%)

### 12.2 Test Coverage by Module
- [ ] Customers: CRUD, import, search/filter, tags
- [ ] Conversations: message rendering, unread state
- [ ] Campaigns: creation, approval, scheduling, analytics
- [ ] Follow-ups: create, complete, overdue, reassignment
- [ ] Notes: create, edit
- [ ] Activities: generation triggers
- [ ] Reports: all 5 report types
- [ ] Auth: login, role-based access
- [ ] WhatsApp service: mock API calls

### 12.3 E2E Tests
- [ ] Set up Playwright or Cypress
- [ ] Test full import flow (upload → map → validate → confirm)
- [ ] Test campaign creation and approval flow
- [ ] Test follow-up creation and completion
- [ ] Test role-based dashboard routing

### 12.4 Linting & Type Safety
- [ ] Run `eslint` and fix all errors
- [ ] Run `tsc --noEmit` and fix all type errors
- [ ] Ensure no `console.log` in committed code
- [ ] No unused variables/imports

---

## Phase 13: Deployment

### 13.1 Environment Configuration
- [ ] Create `.env.local.example` with all required variables
- [ ] Document: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Document: `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- [ ] Document: WhatsApp credentials (`WHATSAPP_ACCESS_TOKEN`, etc.)
- [ ] Create `.env.local` (gitignored)

### 13.2 Supabase Setup
- [ ] Apply all migrations to production Supabase project
- [ ] Configure RLS policies (verify they match development)
- [ ] Set up email templates for auth (if using email login)
- [ ] Configure database backups

### 13.3 Hosting (Cloudflare Pages)
- [ ] Create `cloudflare-pages.json` or configure via dashboard
- [ ] Set up custom domain (if provided)
- [ ] Configure SSR/ISR settings
- [ ] Set up environment variables in Cloudflare
- [ ] Configure redirects (e.g., `/` → `/dashboard`)

### 13.4 WhatsApp Webhook Configuration
- [ ] Deploy webhook endpoint to public HTTPS URL
- [ ] Register webhook URL in Meta Business Manager
- [ ] Configure webhook fields: messages, message_template_status, etc.
- [ ] Verify webhook signature secret is configured

### 13.5 Monitoring
- [ ] Set up error logging (Sentry or similar free tier)
- [ ] Configure uptime monitoring
- [ ] Set up Supabase log alerts
- [ ] Document rollback procedure

---

## Task Tracking Legend

- ✅ = Completed
- `[test]` = TDD test must be written first (RED → GREEN)
- `[no-test]` = Integration or infrastructure task that doesn't need unit tests
- **Bold** = High priority / blocking other tasks
- ⚠️ = Known complexity or risk

### Priority Order
1. **Foundation tasks** (0.1–0.4) — everything depends on these
2. **Customers module** (1.1–1.8) — the core entity
3. **Dashboard** (2.1–2.4) — the entry point
4. **WhatsApp Inbox** (4.1–4.6) — the core communication flow
5. **Campaigns** (5.1–5.6) — outbound communication
6. **Follow-ups** (6.1–6.5) — task management
7. **Reports & Settings** (8–10) — peripheral but required
8. **WhatsApp API integration** (11.1–11.4) — external dependency
9. **Testing & Deployment** (12–13) — quality and delivery

### Daily Workflow
1. Pick 2–3 tasks from the current phase
2. Write tests first (RED)
3. Implement (GREEN)
4. Run tests until green
5. Commit with clear message
6. Update task checkboxes
