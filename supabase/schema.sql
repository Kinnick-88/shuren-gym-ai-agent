create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  student_id text not null,
  major_class text not null,
  phone text not null,
  plan text not null check (plan in ('month', 'year')),
  amount numeric not null,
  payment_method text not null check (payment_method in ('wechat', 'alipay')),
  payment_screenshot_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  remark text,
  start_date date,
  end_date date,
  created_at timestamp default now()
);

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  type text not null,
  satisfaction integer not null check (satisfaction between 1 and 5),
  content text not null,
  created_at timestamp default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text default 'admin' check (role = 'admin'),
  created_at timestamp default now()
);

alter table public.members enable row level security;
alter table public.feedbacks enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "admin users can read own admin row" on public.admin_users;
create policy "admin users can read own admin row"
on public.admin_users
for select
to authenticated
using (email = (auth.jwt() ->> 'email') and role = 'admin');

drop policy if exists "public can create member applications" on public.members;
create policy "public can create member applications"
on public.members
for insert
to anon, authenticated
with check (
  status = 'pending'
  and start_date is null
  and end_date is null
  and payment_screenshot_url is not null
  and (
    (plan = 'month' and amount = 200)
    or (plan = 'year' and amount = 365)
  )
);

drop policy if exists "admins can read members" on public.members;
create policy "admins can read members"
on public.members
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where email = (auth.jwt() ->> 'email')
      and role = 'admin'
  )
);

drop policy if exists "admins can update members" on public.members;
create policy "admins can update members"
on public.members
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where email = (auth.jwt() ->> 'email')
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where email = (auth.jwt() ->> 'email')
      and role = 'admin'
  )
);

drop policy if exists "public can create feedbacks" on public.feedbacks;
create policy "public can create feedbacks"
on public.feedbacks
for insert
to anon, authenticated
with check (true);

drop policy if exists "admins can read feedbacks" on public.feedbacks;
create policy "admins can read feedbacks"
on public.feedbacks
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where email = (auth.jwt() ->> 'email')
      and role = 'admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

drop policy if exists "public can upload payment screenshots" on storage.objects;
create policy "public can upload payment screenshots"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'payment-screenshots');

drop policy if exists "admins can read payment screenshots" on storage.objects;
create policy "admins can read payment screenshots"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-screenshots'
  and exists (
    select 1
    from public.admin_users
    where email = (auth.jwt() ->> 'email')
      and role = 'admin'
  )
);

create index if not exists members_created_at_idx on public.members (created_at desc);
create index if not exists members_status_idx on public.members (status);
create index if not exists feedbacks_created_at_idx on public.feedbacks (created_at desc);

create or replace function public.lookup_my_membership(
  p_student_id text,
  p_phone text
)
returns table (
  name text,
  student_id text,
  major_class text,
  phone text,
  plan text,
  amount numeric,
  status text,
  start_date date,
  end_date date,
  created_at timestamp
)
language sql
security definer
set search_path = public
as $$
  select
    m.name,
    m.student_id,
    m.major_class,
    m.phone,
    m.plan,
    m.amount,
    m.status,
    m.start_date,
    m.end_date,
    m.created_at
  from public.members m
  where m.student_id = trim(p_student_id)
    and m.phone = trim(p_phone)
  order by m.created_at desc
  limit 5;
$$;

grant execute on function public.lookup_my_membership(text, text) to anon, authenticated;
