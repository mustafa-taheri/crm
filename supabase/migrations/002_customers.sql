create type public.customer_status as enum (
  'new_reply', 'interested', 'quotation', 'negotiation', 'won', 'lost'
);

create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text,
  email text,
  city text,
  industry text,
  source text,
  status public.customer_status not null default 'new_reply',
  primary_owner_id uuid references public.profiles(id) on delete set null,
  marketing_opt_out boolean not null default false,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index on public.customers(status);
create index on public.customers(primary_owner_id);
create index on public.customers(archived_at);
create index on public.customers(name);

alter table public.customers enable row level security;

create policy "Authenticated users can view all customers" on public.customers
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert customers" on public.customers
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update customers" on public.customers
  for update using (auth.role() = 'authenticated');

create trigger customers_updated_at before update on public.customers
  for each row execute procedure public.set_updated_at();

-- Customer phones (multiple per customer)
create table public.customer_phones (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  phone_number text not null,
  country_code text not null default '+91',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.customer_phones(customer_id);
create index on public.customer_phones(phone_number);

alter table public.customer_phones enable row level security;

create policy "Authenticated users can manage customer phones" on public.customer_phones
  for all using (auth.role() = 'authenticated');

create trigger customer_phones_updated_at before update on public.customer_phones
  for each row execute procedure public.set_updated_at();

-- WhatsApp identities
create table public.whatsapp_identities (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  customer_phone_id uuid references public.customer_phones(id) on delete set null,
  whatsapp_identifier text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.whatsapp_identities(customer_id);
create index on public.whatsapp_identities(whatsapp_identifier);

alter table public.whatsapp_identities enable row level security;

create policy "Authenticated users can manage whatsapp_identities" on public.whatsapp_identities
  for all using (auth.role() = 'authenticated');

create trigger whatsapp_identities_updated_at before update on public.whatsapp_identities
  for each row execute procedure public.set_updated_at();

-- Customer status history
create table public.customer_status_history (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  from_status public.customer_status,
  to_status public.customer_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index on public.customer_status_history(customer_id);
create index on public.customer_status_history(changed_at);

alter table public.customer_status_history enable row level security;

create policy "Authenticated users can view status history" on public.customer_status_history
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert status history" on public.customer_status_history
  for insert with check (auth.role() = 'authenticated');

-- Tags
create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "Authenticated users can manage tags" on public.tags
  for all using (auth.role() = 'authenticated');

create table public.customer_tags (
  customer_id uuid references public.customers(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (customer_id, tag_id)
);

alter table public.customer_tags enable row level security;

create policy "Authenticated users can manage customer_tags" on public.customer_tags
  for all using (auth.role() = 'authenticated');

-- Import jobs
create table public.import_jobs (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  warnings integer not null default 0,
  errors integer not null default 0,
  duplicates integer not null default 0,
  imported integer not null default 0,
  error_details jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.import_jobs enable row level security;

create policy "Users can view own import jobs" on public.import_jobs
  for select using (
    created_by = (select id from public.profiles where user_id = auth.uid())
    or exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert import jobs" on public.import_jobs
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update import jobs" on public.import_jobs
  for update using (auth.role() = 'authenticated');
