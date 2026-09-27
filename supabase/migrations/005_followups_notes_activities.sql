create type public.followup_status as enum ('pending', 'completed');
create type public.followup_priority as enum ('low', 'medium', 'high');

create table public.followups (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  assigned_user_id uuid references public.profiles(id) on delete set null,
  description text not null,
  due_date date not null,
  due_time time,
  reminder_minutes integer not null default 30,
  priority public.followup_priority not null default 'medium',
  status public.followup_status not null default 'pending',
  created_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.followups(customer_id);
create index on public.followups(assigned_user_id);
create index on public.followups(status);
create index on public.followups(due_date);

alter table public.followups enable row level security;

create policy "Authenticated users can manage followups" on public.followups
  for all using (auth.role() = 'authenticated');

create trigger followups_updated_at before update on public.followups
  for each row execute procedure public.set_updated_at();

create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.notes(customer_id);

alter table public.notes enable row level security;

create policy "Authenticated users can manage notes" on public.notes
  for all using (auth.role() = 'authenticated');

create trigger notes_updated_at before update on public.notes
  for each row execute procedure public.set_updated_at();

create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index on public.activities(customer_id);
create index on public.activities(created_at desc);
create index on public.activities(activity_type);

alter table public.activities enable row level security;

create policy "Authenticated users can view activities" on public.activities
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activities" on public.activities
  for insert with check (auth.role() = 'authenticated');
