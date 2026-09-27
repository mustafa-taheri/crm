# Tohfawala CRM — Supabase Migrations

This directory contains all PostgreSQL migration files for the Tohfawala CRM.  
They must be applied **in order** (numerically) against your Supabase project.

---

## Migration Files

| File | Description |
|------|-------------|
| [`001_users_and_profiles.sql`](./migrations/001_users_and_profiles.sql) | `public.profiles` table, RLS policies, auto-create-profile trigger on auth signup, `set_updated_at()` helper trigger |
| [`002_customers.sql`](./migrations/002_customers.sql) | `customers`, `customer_phones`, `whatsapp_identities`, `customer_status_history`, `tags`, `customer_tags`, `import_jobs` |
| [`003_conversations_and_messages.sql`](./migrations/003_conversations_and_messages.sql) | `conversations`, `messages` (with deferred campaign FK columns), `message_media` |
| [`004_campaigns.sql`](./migrations/004_campaigns.sql) | `whatsapp_templates`, `campaigns`, `campaign_recipients`, `campaign_media`, then adds FK constraints back to `messages` |
| [`005_followups_notes_activities.sql`](./migrations/005_followups_notes_activities.sql) | `followups`, `notes`, `activities` |
| [`006_views_and_helpers.sql`](./migrations/006_views_and_helpers.sql) | Read-only views: `dashboard_stats`, `pipeline_counts`, `campaign_analytics` |

---

## How to Apply Migrations

### Option 1 — Supabase CLI (recommended)

```bash
# 1. Install the CLI (if not already)
brew install supabase/tap/supabase

# 2. Log in
supabase login

# 3. Link to your project (get <project-ref> from the Supabase dashboard URL)
supabase link --project-ref <project-ref>

# 4. Push all migrations
supabase db push
```

> **Note:** `supabase db push` applies every file in `supabase/migrations/` that hasn't been applied yet, in filename order.

---

### Option 2 — Supabase Dashboard SQL Editor

1. Open your project in [app.supabase.com](https://app.supabase.com).
2. Go to **SQL Editor → New query**.
3. Paste and run each file **in order**: `001` → `002` → … → `006`.

---

### Option 3 — `psql` directly

```bash
DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"

for f in supabase/migrations/*.sql; do
  echo "Applying $f ..."
  psql "$DATABASE_URL" -f "$f"
done
```

---

## Re-running / Resetting (local dev only)

```bash
# Reset local Supabase instance and re-apply all migrations from scratch
supabase db reset
```

> ⚠️ **Never run `db reset` against a production project** — it drops all data.

---

## Key Design Decisions

- **RLS enabled on every table.** All policies require `auth.role() = 'authenticated'` at minimum.  
- **Admin-only mutations** (e.g., template approval, profile management) check `profiles.role = 'admin'` inside the policy.  
- **Deferred FKs:** `messages.campaign_id` and `messages.attributed_campaign_id` are plain `uuid` columns in migration `003` and their `FOREIGN KEY` constraints are added in migration `004` (after `campaigns` is created).  
- **`set_updated_at()` trigger** is defined once in `001` and reused by every table that has an `updated_at` column.  
- **Views are not RLS-protected** — ensure they are queried only via authenticated server-side clients or wrap them in security-definer functions if needed.
