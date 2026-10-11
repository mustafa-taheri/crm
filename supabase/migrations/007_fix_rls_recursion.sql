-- Fix infinite recursion in RLS policies (PostgreSQL Error 42P17)

-- 1. Create a security definer helper function to check admin status
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Fix profiles policy (drop recursive policy and replace with is_admin())
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Admins can manage profiles" on public.profiles
  for all using (public.is_admin());

-- 3. Fix whatsapp_templates policy
drop policy if exists "Admins can update templates" on public.whatsapp_templates;

create policy "Admins can update templates" on public.whatsapp_templates
  for update using (public.is_admin());
