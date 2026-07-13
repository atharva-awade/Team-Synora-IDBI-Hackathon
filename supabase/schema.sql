-- UdyamPulse — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL → New query → Run).
-- It creates the audit tables the app writes to, a small MSME registry, and
-- permissive-but-scoped RLS policies suitable for the public anon key.

-- ─────────────────────────────────────────────────────────────────────────────
-- Assessments: one row per Financial Health Card generated (consent-backed).
create table if not exists public.assessments (
  id              uuid primary key default gen_random_uuid(),
  business_id     text        not null,
  business_name   text        not null,
  sector          text,
  city            text,
  score           integer     not null,
  grade           text        not null,
  eligible_limit  bigint      not null default 0,
  confidence      integer     not null default 0,
  created_at      timestamptz not null default now()
);

-- Decisions: one row per underwriting action from the RM console.
create table if not exists public.decisions (
  id             uuid primary key default gen_random_uuid(),
  business_id    text        not null,
  business_name  text        not null,
  action         text        not null check (action in ('approved', 'review')),
  amount         bigint      not null default 0,
  tenor_months   integer     not null default 0,
  rate           numeric(5,2) not null default 0,
  cgtmse         boolean     not null default false,
  created_at     timestamptz not null default now()
);

-- Registry: the MSMEs on the platform (browsable reference data).
create table if not exists public.msme_registry (
  id            text primary key,
  name          text not null,
  sector        text,
  city          text,
  state         text,
  constitution  text,
  score         integer,
  grade         text,
  tags          text[]
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
alter table public.assessments  enable row level security;
alter table public.decisions    enable row level security;
alter table public.msme_registry enable row level security;

-- Allow the public anon key to append audit rows and read them back.
drop policy if exists "anon insert assessments" on public.assessments;
create policy "anon insert assessments" on public.assessments
  for insert to anon with check (true);
drop policy if exists "anon read assessments" on public.assessments;
create policy "anon read assessments" on public.assessments
  for select to anon using (true);

drop policy if exists "anon insert decisions" on public.decisions;
create policy "anon insert decisions" on public.decisions
  for insert to anon with check (true);
drop policy if exists "anon read decisions" on public.decisions;
create policy "anon read decisions" on public.decisions
  for select to anon using (true);

drop policy if exists "anon read registry" on public.msme_registry;
create policy "anon read registry" on public.msme_registry
  for select to anon using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed the registry.
insert into public.msme_registry (id, name, sector, city, state, constitution, score, grade, tags) values
  ('meena-textiles',    'Meena Textiles',    'Textile made-ups manufacturing', 'Surat',      'Gujarat',     'Proprietorship',  88, 'A+', array['New-to-Credit','New-to-Bank','Woman-led']),
  ('kaveri-foods',      'Kaveri Foods',      'Food processing & packaging',    'Coimbatore', 'Tamil Nadu',  'Partnership',     83, 'A',  array['New-to-Bank','EPFO-registered']),
  ('sharma-provisions', 'Sharma Provisions', 'Retail trade — Kirana',          'Nagpur',     'Maharashtra', 'Proprietorship',  72, 'B+', array['New-to-Bank']),
  ('anand-mobile',      'Anand Mobile Care', 'Mobile & electronics repair',    'Kanpur',     'Uttar Pradesh','Proprietorship', 54, 'C',  array['New-to-Credit','Thin file']),
  ('zenith-traders',    'Zenith Traders',    'Wholesale trading',              'Delhi',      'Delhi',       'Private Limited', 77, 'A',  array['New-to-Bank','Under review'])
on conflict (id) do update set
  score = excluded.score, grade = excluded.grade, tags = excluded.tags;
