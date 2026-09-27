-- Dashboard stats view for admin
create or replace view public.dashboard_stats as
select
  (select count(*) from public.customers where archived_at is null) as total_customers,
  (select count(*) from public.conversations where state = 'open') as active_chats,
  (select count(*) from public.campaigns where status in ('running', 'scheduled', 'approved')) as active_campaigns,
  (select count(*) from public.messages where direction = 'inbound' and created_at > now() - interval '7 days'
    and conversation_id in (select id from public.conversations where unread_count > 0)) as unread_replies,
  (select count(*) from public.followups where status = 'pending' and due_date = current_date) as followups_today,
  (select count(*) from public.followups where status = 'pending' and due_date < current_date) as overdue_followups;

-- Pipeline counts view
create or replace view public.pipeline_counts as
select
  status,
  count(*) as count
from public.customers
where archived_at is null
group by status;

-- Campaign analytics summary
create or replace view public.campaign_analytics as
select
  c.id,
  c.name,
  c.status,
  c.created_at,
  count(cr.id) as audience,
  count(cr.id) filter (where cr.status != 'pending' and cr.status != 'cancelled') as sent,
  count(cr.id) filter (where cr.delivered_at is not null) as delivered,
  count(cr.id) filter (where cr.read_at is not null) as read,
  count(cr.id) filter (where cr.replied_at is not null) as replied,
  count(cr.id) filter (where cr.status = 'failed') as failed,
  count(cr.id) filter (where cr.opted_out_at is not null) as opted_out
from public.campaigns c
left join public.campaign_recipients cr on cr.campaign_id = c.id
group by c.id, c.name, c.status, c.created_at;
