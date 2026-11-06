-- Run once in the Supabase SQL editor. No service-role key is needed by the app.
create table if not exists public.kitchens (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null default '{}'::jsonb,
 revision integer not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.kitchens enable row level security;
revoke all on public.kitchens from anon;
grant select, insert, update on public.kitchens to authenticated;
create policy "Read own kitchen" on public.kitchens for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own kitchen" on public.kitchens for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own kitchen" on public.kitchens for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
