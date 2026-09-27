create type public.campaign_status as enum (
  'draft', 'pending_approval', 'approved', 'scheduled', 'running', 'paused', 'completed', 'cancelled', 'failed'
);

create type public.template_status as enum ('draft', 'pending', 'approved', 'rejected');

create table public.whatsapp_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  content text not null,
  status public.template_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  provider_template_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_templates enable row level security;

create policy "Authenticated users can view templates" on public.whatsapp_templates
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert templates" on public.whatsapp_templates
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update templates" on public.whatsapp_templates
  for update using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create trigger whatsapp_templates_updated_at before update on public.whatsapp_templates
  for each row execute procedure public.set_updated_at();

create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  template_id uuid references public.whatsapp_templates(id) on delete set null,
  status public.campaign_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.campaigns(status);
create index on public.campaigns(created_by);
create index on public.campaigns(scheduled_at);

alter table public.campaigns enable row level security;

create policy "Authenticated users can view campaigns" on public.campaigns
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert campaigns" on public.campaigns
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update campaigns" on public.campaigns
  for update using (auth.role() = 'authenticated');

create trigger campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.set_updated_at();

create table public.campaign_recipients (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  whatsapp_identity_id uuid references public.whatsapp_identities(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'delivered', 'read', 'replied', 'failed', 'opted_out', 'cancelled')),
  message_id uuid references public.messages(id) on delete set null,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  failed_at timestamptz,
  opted_out_at timestamptz,
  error_details text,
  constraint unique_campaign_customer unique (campaign_id, customer_id)
);

create index on public.campaign_recipients(campaign_id);
create index on public.campaign_recipients(customer_id);
create index on public.campaign_recipients(status);

alter table public.campaign_recipients enable row level security;

create policy "Authenticated users can manage campaign_recipients" on public.campaign_recipients
  for all using (auth.role() = 'authenticated');

create table public.campaign_media (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  media_type text not null check (media_type in ('pdf', 'image', 'video')),
  file_url text,
  file_name text,
  mime_type text,
  storage_path text,
  created_at timestamptz not null default now()
);

create index on public.campaign_media(campaign_id);

alter table public.campaign_media enable row level security;

create policy "Authenticated users can manage campaign_media" on public.campaign_media
  for all using (auth.role() = 'authenticated');

-- Add FK from messages.campaign_id now that campaigns table exists
alter table public.messages
  add constraint messages_campaign_id_fkey
  foreign key (campaign_id) references public.campaigns(id) on delete set null;

alter table public.messages
  add constraint messages_attributed_campaign_id_fkey
  foreign key (attributed_campaign_id) references public.campaigns(id) on delete set null;
