# Tohfawala CRM — Quickstart & User Guide

Welcome to the **Tohfawala WhatsApp CRM**! This guide covers everything you need to set up the database, configure environment variables, start the development server, and use all features.

---

## 1. Prerequisites

- **Node.js**: v18.18+ or v20+
- **pnpm**: v9+ (or `npm`/`yarn`)
- **Supabase Account**: A free Supabase project at [supabase.com](https://supabase.com)

---

## 2. Environment Configuration

1. Navigate to the `crm` folder:
   ```bash
   cd crm
   ```

2. Copy the sample environment file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

3. Fill in your credentials in `.env.local`:
   ```env
   # Supabase Configuration (from Supabase Project Settings -> API)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # WhatsApp Cloud API (Optional for dev — uses built-in Mock Service if empty)
   WHATSAPP_ACCESS_TOKEN=
   WHATSAPP_PHONE_NUMBER_ID=
   WHATSAPP_BUSINESS_ACCOUNT_ID=
   WHATSAPP_VERIFY_TOKEN=tohfawala_crm_verify_token
   WHATSAPP_APP_SECRET=

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   APP_TIMEZONE=Asia/Kolkata
   ```

> **Note:** If WhatsApp API keys are not provided, the CRM operates in **Mock Mode**, simulating message sends and webhook events seamlessly.

---

## 3. Database Migration Setup

Run the SQL migration scripts in order in your **Supabase SQL Editor** (found in `crm/supabase/migrations/`):

1. `001_users_and_profiles.sql` — Profiles, roles (`admin`, `salesperson`), triggers, and RLS policies.
2. `002_customers.sql` — Customers, phones, tags, status history, and import jobs.
3. `003_conversations_and_messages.sql` — WhatsApp conversations, messages, and attachments.
4. `004_campaigns.sql` — WhatsApp templates, campaigns, recipients, and media.
5. `005_followups_notes_activities.sql` — Follow-ups, customer notes, and activity timeline.
6. `006_views_and_helpers.sql` — Database views (`dashboard_stats`, `pipeline_counts`, `campaign_analytics`).
7. `007_fix_rls_recursion.sql` — RLS recursion protection (`is_admin()` security definer function).

---

## 4. Initial User & Admin Account

1. In the Supabase Dashboard, go to **Authentication -> Users** and click **Add User -> Create User**.
2. Enter an email (e.g. `admin@tohfawala.com`) and a password.
3. In **Table Editor -> profiles**, set the `role` of your created user to `'admin'`.
4. (Optional) Create a second user with the role `'salesperson'` to test multi-role features.

---

## 5. Starting the Application

Install dependencies and start the Next.js development server:

```bash
cd crm
pnpm install
pnpm dev
```

Open your browser at [http://localhost:3000](http://localhost:3000). You will be redirected to `/auth/login`.

---

## 6. Feature Walkthrough & Usage Guide

### 🔐 1. Authentication & Role-Based Access
- **Login**: Visit `/auth/login` and sign in with your email and password.
- **Role Detection**: The system dynamically shows admin options (User Management, Template Approval, Campaign Review) to admins, while giving salespeople streamlined views.
- **Dark Mode**: Toggle light/dark mode using the theme switch in the top navigation bar.

### 📊 2. Dashboard (`/dashboard`)
- **Key Performance Indicators (KPIs)**: Total Customers, Active Chats, Active Campaigns, Unread Replies, Follow-ups Today, Overdue Follow-ups.
- **Sales Pipeline Funnel**: Quick counts of customers across `New Reply`, `Interested`, `Quotation`, `Negotiation`, `Won`, and `Lost`.
- **Today's Follow-ups**: Quick preview of pending tasks with 1-click status actions.
- **Recent Conversations**: Quick list of active WhatsApp discussions.

### 👥 3. Customers Module (`/customers`)
- **Customer List**: Filter by Status, Salesperson, Tags, Search by name/company/phone.
- **Add Customer (`/customers/add`)**: Create a customer with multiple phone numbers, company, city, tags, notes, and status.
- **Edit Customer (`/customers/[id]/edit`)**: Update customer details and manage secondary phone numbers.
- **Archive Customer**: Soft-delete customers preserving historical logs and conversation threads.
- **CSV Import Wizard (`/customers/import`)**:
  1. Upload CSV file.
  2. Auto-detect or map columns (`Name`, `Phone`, `Email`, `Company`, `City`, `Industry`, `Tags`).
  3. Real-time validation preview (valid rows, warning rows, errors, duplicates).
  4. Batch execution with error summary download.

### 🔍 4. Customer 360 View (`/customers/[id]`)
- **Header**: Status badge with direct status change dropdown, salesperson assignment, tags.
- **6 Dedicated Tabs**:
  1. **Overview**: Key customer info and metadata.
  2. **WhatsApp**: Inline conversation thread and direct shortcut to inbox.
  3. **Follow-ups**: Scheduled reminders and tasks for this customer.
  4. **Notes**: Internal team notes with author attribution and timestamps.
  5. **Activity**: Complete audit timeline of all customer events (creation, edits, status transitions).
  6. **Campaigns**: History of campaigns sent to this customer.

### 💬 5. WhatsApp Inbox (`/whatsapp/inbox`)
- **3-Panel Layout**:
  - **Left**: Conversation list with filters (`All`, `Unread`, `Assigned to Me`).
  - **Center**: Real-time chat view, inbound/outbound bubbles, delivery status indicators (`sent`, `delivered`, `read`), and file attachment capability.
  - **Right**: Customer context panel with quick status modification and link to Customer 360.
- **Real-time Sync**: Automatically listens to incoming messages via Supabase Realtime channels.

### 🚀 6. WhatsApp Campaigns (`/whatsapp/campaigns`)
- **Templates (`/whatsapp/campaigns/templates`)**:
  - Salespeople create draft templates with merge placeholders (e.g. `{{name}}`, `{{company}}`).
  - Admins approve or reject templates.
- **Campaign Wizard (`/whatsapp/campaigns/new`)**:
  1. **Details**: Campaign name & description.
  2. **Template**: Choose an approved WhatsApp template.
  3. **Audience**: Filter recipients by status, tags, city, or select all.
  4. **Media & Preview**: Attach promotional PDF/images and preview personalized messages.
  5. **Schedule & Submit**: Choose immediate send or future schedule date, then submit for admin approval.
- **Campaign Analytics (`/whatsapp/campaigns/[id]/analytics`)**: Real-time funnel displaying Sent, Delivered, Read, Replied, and Failed metrics.

### ⏰ 7. Follow-ups Management (`/follow-ups`)
- **Filter Tabs**: View `All`, `Today`, `Upcoming`, `Overdue`, or `Completed`.
- **Create Follow-up**: Pick customer, date, time, priority (`Low`, `Medium`, `High`), and reminder window.
- **Actions**: Mark complete, reopen, or reassign to another salesperson.

### 📈 8. Reports & Analytics (`/reports`)
- **Campaign Reports**: Delivery rates, read rates, and reply attribution.
- **Customer Status Report**: Sales funnel conversion rates and status distributions.
- **Follow-up Report**: Completion vs overdue rates by salesperson.
- **Salesperson Activity Report**: Breakdown of conversations, follow-ups, and won deals per team member.
- **CSV Export**: 1-click download of all report tables via PapaParse.

### ⚙️ 9. Settings (`/settings`)
- **User Management (`/settings/users`)**: Admins can view users, assign `admin` / `salesperson` roles, and toggle active status.
- **Tag Management (`/settings/tags`)**: Create and organize tags with customer usage counts.

---

## 7. WhatsApp Webhook Configuration (Production)

When ready to connect Meta WhatsApp Cloud API:

1. Deploy the application to a public HTTPS URL (e.g., Cloudflare Pages, Vercel).
2. Go to **Meta for Developers -> WhatsApp -> Configuration**.
3. Set **Callback URL** to `https://your-domain.com/api/webhooks/whatsapp`.
4. Set **Verify Token** to the value defined in `WHATSAPP_VERIFY_TOKEN`.
5. Subscribe to the `messages` and `message_template_status_update` webhook fields.
