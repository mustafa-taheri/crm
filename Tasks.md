# Tohfawala CRM — Implementation Task List

> Follow the **ECC Lifecycle**: Plan → Test (RED) → Implement (GREEN) → Review → Verify → Remember
> Each task below is a single logical unit of work. Tasks are ordered by dependency — do not skip ahead.

---

## Phase 0: Foundation

### 0.1 Supabase Client & Types
- [x] Create `src/lib/supabase/client.ts` (browser client)
- [x] Create `src/lib/supabase/server.ts` (server client for RSC)
- [x] Generate TypeScript types from DB schema (manually from migrations)
- [x] Save types to `src/types/supabase.ts`
- [x] Verify types compile (`tsc --noEmit` passes)

### 0.2 Authentication
- [x] `[no-test]` Create `/auth/login` page with email + password form
- [x] Implement `login action` using `supabase.auth.signInWithPassword`
- [x] Implement `signOut action`
- [x] Create `useUser` hook (wraps `supabase.auth.getUser()`)
- [x] Create `useRole` hook (returns `admin` | `salesperson` from profile)
- [x] Add `middleware.ts` for route protection (redirect to `/auth/login` if unauthenticated)

### 0.3 Shared UI Scaffold
- [x] Create `src/components/Layout/AppLayout.tsx` — sidebar + header shell
- [x] Create `src/components/Layout/Sidebar.tsx` — role-based navigation links
- [x] Create `src/components/Layout/Header.tsx` — user menu, dark mode toggle
- [x] Update `src/app/layout.tsx` — updated with system font stack, metadata, dark mode support
- [x] Create `src/lib/utils.ts` — `cn()` helper
- [x] Create `src/app/globals.css` — Tailwind base + custom properties
- [x] Add dark mode support (CSS variables in :root + .dark)
- [x] Add dark mode toggle component (in Header)
- [x] `[test]` Layout renders without crashing — PASSES (AppLayout.test.tsx)

### 0.4 Shared Utilities
- [x] Create `src/lib/validators/customer.ts` — Zod schemas for customer validation
- [x] Create `src/lib/validators/followup.ts` — Zod schemas for follow-up validation
- [x] Create `src/lib/validators/campaign.ts` — Zod schemas for campaign validation
- [x] Create `src/lib/validators/auth.ts` — Zod schemas for login/signup
- [x] Create `src/lib/helpers/format.ts` — phone formatting, date formatting, relative time
- [x] Create `src/lib/helpers/status.ts` — status label/color mapping
- [x] Create `src/lib/constants/ui.ts` — page sizes, default values
- [x] Create `src/types/papaparse.d.ts` — type definitions for PapaParse
- [x] Set up test infrastructure (Vitest + React Testing Library + happy-dom)

### 0.5 Test Infrastructure
- [x] Install Vitest + @testing-library/react + @testing-library/jest-dom + happy-dom
- [x] Configure `vitest.config.ts` with 80% coverage thresholds
- [x] Create `src/lib/test/setup.tsx` with next/navigation and next/image mocks
- [x] Add test scripts to package.json (`test`, `test:watch`, `test:coverage`)

---

## Phase 1: Customers Module

### 1.1 Customer Data Model
- [x] Verify migration `002_customers.sql` is created
- [x] Confirm `customer_status` enum, `customers`, `customer_phones`, `tags`, `customer_tags` tables

### 1.2 Customer List
- [x] Implement `src/lib/actions/customers.ts` — server action with search, filter, sort, pagination
- [x] Create `src/app/(crm)/customers/page.tsx` — list view with filters
- [x] Create `src/components/Customers/CustomerTable.tsx`
- [x] Create `src/components/Customers/CustomerFilters.tsx`
- [x] Create `src/components/Customers/CustomerSearch.tsx`

### 1.3 Add Customer
- [x] Implement `createCustomer` server action
- [x] Create `src/app/(crm)/customers/add/page.tsx` — add form
- [x] Create `src/components/Customers/AddCustomerForm.tsx`
- [x] Add form fields: name, mobile, email, company, city, industry, source, tags, status, notes

### 1.4 Edit Customer
- [x] Implement `updateCustomer` server action
- [x] Create `src/app/(crm)/customers/[id]/edit/page.tsx`
- [x] Create `src/components/Customers/EditCustomerForm.tsx`
- [x] Populate form with existing customer data

### 1.5 Archive Customer
- [x] Implement `archiveCustomer` server action (sets `archived_at`)
- [x] Add archive button to customer actions & detail
- [x] Add "Archived" filter to customer list

### 1.6 Customer Phones
- [x] Implement multiple phone support in customer forms
- [x] Add primary phone selector

### 1.7 Tags
- [x] Implement `fetchTags`, `createTag`, `deleteTag` server actions
- [x] Create tag management UI in Settings
- [x] Add tag selector to customer forms

### 1.8 Import Customers
- [x] Create `src/app/(crm)/customers/import/page.tsx`
- [x] Create `src/components/Customers/CustomerImportWizard.tsx` (upload, column mapping, validation preview)
- [x] Implement `validateImportRows` and `executeCustomerImport` actions in `src/lib/actions/import.ts`
- [x] Show import preview (total, valid, warnings, errors, duplicates)
- [x] Implement batch import execution with error reporting

---

## Phase 2: Dashboard

### 2.1 Dashboard Data
- [x] Create `006_views_and_helpers.sql` with `dashboard_stats` and `pipeline_counts` views
- [x] Implement `fetchDashboardData` server action with role-aware metrics

### 2.2 Role-Aware Dashboard
- [x] Create `src/app/(crm)/dashboard/page.tsx`
- [x] Create overview cards (customers, active chats, campaigns, unread replies, follow-ups, overdue)
- [x] Create sales pipeline cards (status → count)
- [x] Create recent conversations list
- [x] Create today's follow-ups list
- [x] Wire up click handlers and quick navigation links

---

## Phase 3: Customer 360

### 3.1 Customer Detail
- [x] Create `src/app/(crm)/customers/[id]/page.tsx` — main Customer 360 page
- [x] Create `src/components/Customer360/CustomerHeader.tsx` (name, company, mobile, status, tags, quick actions)
- [x] Implement `fetchCustomer360` action in `src/lib/actions/customer360.ts`

### 3.2 Customer 360 Tabs
- [x] Create `src/components/Customer360/Customer360Tabs.tsx` with 6 tabs:
  - [x] Overview tab (customer info edit)
  - [x] WhatsApp tab (conversation thread preview & link)
  - [x] Follow-ups tab (list + create modal)
  - [x] Notes tab (internal notes + note form)
  - [x] Activity tab (timeline of system actions)
  - [x] Campaigns tab (campaign history for customer)

### 3.3 Customer 360 Actions
- [x] Implement inline status change dropdown
- [x] Implement quick assign salesperson
- [x] Implement add note & add follow-up directly from 360 view

---

## Phase 4: WhatsApp Inbox

### 4.1 Conversations & Messages
- [x] Create `003_conversations_and_messages.sql` migration
- [x] Implement conversation actions in `src/lib/actions/conversations.ts`

### 4.2 Conversation List
- [x] Create `src/app/(crm)/whatsapp/inbox/page.tsx`
- [x] Create `src/components/WhatsApp/ConversationList.tsx`
- [x] Implement filters: All, Unread, Assigned to Me
- [x] Show customer name, last message, timestamp, unread badge

### 4.3 Conversation View
- [x] Create `src/components/WhatsApp/ConversationView.tsx`
- [x] Render message bubbles (inbound vs outbound)
- [x] Message input with send button & file attachment mock
- [x] Message status ticks (sent, delivered, read)

### 4.4 Customer Context Panel
- [x] Create `src/components/WhatsApp/CustomerContext.tsx`
- [x] Display customer details, status change, tag info, link to 360

### 4.5 WhatsApp Inbox Coordinator
- [x] Create `src/components/WhatsApp/WhatsAppInbox.tsx` (3-panel layout)
- [x] Integrate Supabase Realtime channel subscription for live updates

---

## Phase 5: Campaigns

### 5.1 WhatsApp Templates
- [x] Create `src/app/(crm)/whatsapp/campaigns/templates/page.tsx`
- [x] Create `src/components/Campaigns/TemplateList.tsx`
- [x] Create `src/components/Campaigns/TemplateForm.tsx`
- [x] Implement template CRUD & admin approval workflow in `src/lib/actions/campaigns.ts`

### 5.2 Campaign List
- [x] Create `src/app/(crm)/whatsapp/campaigns/page.tsx`
- [x] Create `src/components/Campaigns/CampaignTable.tsx`
- [x] Show status badges, audience count, sent count, creation date

### 5.3 Create Campaign
- [x] Create `src/app/(crm)/whatsapp/campaigns/new/page.tsx`
- [x] Create `src/components/Campaigns/CampaignWizard.tsx` (5-step wizard: Details, Template, Audience, Media/Preview, Schedule/Submit)

### 5.4 Campaign Review & Detail
- [x] Create `src/app/(crm)/whatsapp/campaigns/[id]/page.tsx`
- [x] Create `src/components/Campaigns/CampaignDetail.tsx` (Approval/Reject actions, campaign summary)

### 5.5 Campaign Analytics
- [x] Create `src/app/(crm)/whatsapp/campaigns/[id]/analytics/page.tsx`
- [x] Display delivery breakdown: Sent, Delivered, Read, Replied, Failed, Opted out
- [x] Recipient level table view

---

## Phase 6: Follow-ups

### 6.1 Follow-up CRUD
- [x] Create `005_followups_notes_activities.sql` migration
- [x] Implement `fetchFollowups`, `createFollowup`, `completeFollowup`, `reopenFollowup`, `reassignFollowup` in `src/lib/actions/followups.ts`

### 6.2 Follow-up List
- [x] Create `src/app/(crm)/follow-ups/page.tsx`
- [x] Create `src/app/(crm)/followups/page.tsx` (redirect alias)
- [x] Create `src/components/FollowUps/FollowUpTable.tsx` with filter tabs (All, Today, Upcoming, Overdue, Completed)

### 6.3 Create Follow-up Form
- [x] Create `src/components/FollowUps/CreateFollowUpForm.tsx`
- [x] Fields: customer selection, description, due date, due time, priority, reminder minutes

---

## Phase 7: Notes & Activity

### 7.1 Notes
- [x] Implement `addCustomerNote` action in `src/lib/actions/customer360.ts`
- [x] Notes listing and creation form inside Customer 360

### 7.2 Activity Timeline
- [x] Activity logging on customer creation, status transition, notes, followups
- [x] Timeline component in Customer 360

---

## Phase 8: Reports

### 8.1 Reports Pages
- [x] Create `src/app/(crm)/reports/page.tsx` (Reports Hub)
- [x] Create `src/app/(crm)/reports/campaigns/page.tsx` (Campaign Performance)
- [x] Create `src/app/(crm)/reports/customer-status/page.tsx` (Pipeline & Status Distribution)
- [x] Create `src/app/(crm)/reports/follow-ups/page.tsx` (Follow-up Completion & Overdue Metrics)
- [x] Create `src/app/(crm)/reports/salesperson/page.tsx` (Salesperson Performance)
- [x] Implement report data loaders in `src/lib/actions/reports.ts`

### 8.2 CSV Export
- [x] Create `src/components/Reports/ExportButton.tsx` (CSV download powered by `papaparse`)
- [x] Integrated export across all report tables

---

## Phase 9: Settings

### 9.1 User Management
- [x] Create `src/app/(crm)/settings/page.tsx` (Redirect to `/settings/users`)
- [x] Create `src/app/(crm)/settings/users/page.tsx`
- [x] Create `src/components/Settings/UserManagementTable.tsx` (Role updates, activate/deactivate)
- [x] Implement `fetchUsers`, `updateUserRole`, `toggleUserActive` in `src/lib/actions/users.ts`

### 9.2 Tag Management
- [x] Create `src/app/(crm)/settings/tags/page.tsx`
- [x] Create `src/components/Settings/TagManagement.tsx` (Create tags, delete tags, list customer counts)

---

## Phase 10: WhatsApp Integration Layer

### 10.1 Service Layer
- [x] Create `src/lib/whatsapp/service.ts`
- [x] Implement Meta Cloud API client with fallback to `MockWhatsAppService` for development

### 10.2 Webhook Handling
- [x] Create `src/app/api/webhooks/whatsapp/route.ts`
- [x] GET endpoint: Meta challenge verification
- [x] POST endpoint: Incoming message and status updates ingestion

---

## Phase 11: Deployment & Documentation

### 11.1 Configuration
- [x] Create `.env.local.example` with Supabase & WhatsApp Cloud API environment variables
- [x] Create SQL migrations in `supabase/migrations/` (001 through 006)
- [x] Create `SETUP_AND_RUN.md` step-by-step setup guide

---

## Phase 12: WhatsApp Policy Compliance & Quality Protection

### 12.1 Opt-Out & Opt-In Automation
- [x] Automated keyword detection (`STOP`, `UNSUBSCRIBE`, `CANCEL`, `QUIT`, `OPTOUT`) in webhook route
- [x] Instant customer `marketing_opt_out = true` flag update on opt-out
- [x] Immediate cancellation of pending campaign recipients upon opt-out
- [x] Opt-in keyword detection (`START`, `UNSTOP`, `SUBSCRIBE`) to restore customer messaging preference
- [x] Handling of Meta error code `131056` (User opted out / blocked) in status webhook to auto-opt out contacts and protect phone Quality Rating

### 12.2 24-Hour Customer Care Window Compliance
- [x] Strict backend enforcement in `sendMessage`: rejects free-form session messages when window has expired
- [x] Created `sendTemplateMessage` server action for compliant re-engagement using approved templates
- [x] Frontend `ConversationView`: disables free-form input with warning notice when outside the 24h window
- [x] Modal template selector with customer name placeholder rendering for 1-click re-engagement

### 12.3 Broadcast Pacing & Quality Rating Safeguards
- [x] Pre-dispatch verification: filters out all opted-out customers prior to campaign broadcast
- [x] Batch pacing: batches of 20 recipients with paced intervals to avoid Meta Cloud API rate limit spikes
- [x] Outbound broadcast messages synced to `messages` table for continuous conversation history
- [x] Meta template naming format validation (`[a-z0-9_]`) in `TemplateForm`
- [x] Media upload limits synchronized to WhatsApp Cloud API standards (5MB for images)
- [x] E.164 phone number normalization without `+` prefixes for Meta Cloud API endpoints

