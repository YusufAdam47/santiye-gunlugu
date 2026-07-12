-- SQL Editor'de calistir (Run).

create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

alter table companies enable row level security;
alter table projects enable row level security;

drop policy if exists "public read" on companies;
drop policy if exists "public insert" on companies;
drop policy if exists "public delete" on companies;
create policy "public read" on companies for select using (true);
create policy "public insert" on companies for insert with check (true);
create policy "public delete" on companies for delete using (true);

drop policy if exists "public read" on projects;
drop policy if exists "public insert" on projects;
drop policy if exists "public delete" on projects;
create policy "public read" on projects for select using (true);
create policy "public insert" on projects for insert with check (true);
create policy "public delete" on projects for delete using (true);

-- Mevcut sabit listeyi veritabanına aktar (ilk kurulum)
insert into companies (name) values
  ('Hitit İnşaat'), ('Ant İnşaat'), ('Yüksel Müşavirlik')
on conflict (name) do nothing;

insert into projects (name) values
  ('B-Blok'), ('A-Blok'), ('TBM Girişi'), ('NATM Kesimi'), ('Portal')
on conflict (name) do nothing;
