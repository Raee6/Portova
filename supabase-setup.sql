-- Portova: run this once in Supabase  (SQL Editor > New query > paste > Run)
-- Safe to run again. If an OLDER "portfolios" table exists (without the "about" column),
-- it is renamed to portfolios_old so nothing is deleted, and a fresh table is created.

do $$
begin
    if to_regclass('public.portfolios') is not null
       and not exists (
           select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'portfolios' and column_name = 'about'
       ) then
        alter table public.portfolios rename to portfolios_old;
    end if;
end $$;

create table if not exists public.portfolios (
    id          uuid primary key default gen_random_uuid(),
    created_at  timestamptz not null default now(),
    full_name   text not null,
    email       text,
    phone       text,
    address     text,
    about       text,
    photo_url   text,                                  -- small resized image (data URL)
    skills      jsonb not null default '[]'::jsonb,    -- ["HTML", "CSS"]
    education   jsonb not null default '[]'::jsonb,    -- [{school, degree, years}]
    projects    jsonb not null default '[]'::jsonb,    -- [{title, description, link}]
    experience  jsonb not null default '[]'::jsonb,    -- [{role, company, years, description}]
    links       jsonb not null default '[]'::jsonb,    -- [{label, url}]
    template    text not null default 'simple' check (template in ('simple', 'modern', 'creative'))
);

alter table public.portfolios enable row level security;

-- The app has no login, so these policies let the public (anon) key use the table.
-- The website only shows Edit / Delete on portfolios created in the same browser.
drop policy if exists "portfolios are readable"   on public.portfolios;
drop policy if exists "portfolios can be added"   on public.portfolios;
drop policy if exists "portfolios can be updated" on public.portfolios;
drop policy if exists "portfolios can be deleted" on public.portfolios;

create policy "portfolios are readable"   on public.portfolios for select to anon using (true);
create policy "portfolios can be added"   on public.portfolios for insert to anon with check (true);
create policy "portfolios can be updated" on public.portfolios for update to anon using (true) with check (true);
create policy "portfolios can be deleted" on public.portfolios for delete to anon using (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.portfolios to anon;

-- Make the API notice the new columns right away (fixes "column not found in the schema cache").
notify pgrst, 'reload schema';
