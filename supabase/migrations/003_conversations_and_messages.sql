create type public.conversation_state as enum ('open', 'closed', 'archived');
create type public.message_direction as enum ('inbound', 'outbound');
create type public.message_type as enum ('text', 'image', 'document', 'video');
create type public.message_status as enum ('sending', 'sent', 'delivered', 'read', 'failed');

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  whatsapp_identity_id uuid references public.whatsapp_identities(id) on delete set null,
  assigned_user_id uuid references public.profiles(id) on delete set null,
  state public.conversation_state not null default 'open',
  last_message_at timestamptz,
  last_customer_message_at timestamptz,
  unread_count integer not null default 0,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.conversations(customer_id);
create index on public.conversations(assigned_user_id);
create index on public.conversations(state);
create index on public.conversations(last_message_at desc);

alter table public.conversations enable row level security;

create policy "Authenticated users can manage conversations" on public.conversations
  for all using (auth.role() = 'authenticated');

create trigger conversations_updated_at before update on public.conversations
  for each row execute procedure public.set_updated_at();

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  sender_user_id uuid references public.profiles(id) on delete set null,
  direction public.message_direction not null,
  message_type public.message_type not null default 'text',
  content text,
  whatsapp_message_id text unique,
  status public.message_status not null default 'sending',
  campaign_id uuid, -- FK added after campaigns table
  attributed_campaign_id uuid, -- for reply attribution
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.messages(conversation_id);
create index on public.messages(customer_id);
create index on public.messages(whatsapp_message_id);
create index on public.messages(created_at desc);

alter table public.messages enable row level security;

create policy "Authenticated users can manage messages" on public.messages
  for all using (auth.role() = 'authenticated');

create table public.message_media (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references public.messages(id) on delete cascade not null,
  media_type text not null check (media_type in ('image', 'video', 'document', 'pdf')),
  file_url text,
  mime_type text,
  file_name text,
  file_size bigint,
  whatsapp_media_id text,
  storage_path text,
  created_at timestamptz not null default now()
);

create index on public.message_media(message_id);

alter table public.message_media enable row level security;

create policy "Authenticated users can manage message_media" on public.message_media
  for all using (auth.role() = 'authenticated');
