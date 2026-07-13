-- SQL Editor'de calistir (Run).

-- Yetkili: belirli bir projeye/santiyeye atanmis yonetici kodu
create table if not exists managers (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  project text not null,
  name text,
  created_at timestamptz default now()
);
alter table managers enable row level security;
drop policy if exists "public read" on managers;
drop policy if exists "public insert" on managers;
drop policy if exists "public delete" on managers;
create policy "public read" on managers for select using (true);
create policy "public insert" on managers for insert with check (true);
create policy "public delete" on managers for delete using (true);

-- Ozel kategoriler (Ekipman, Ekip vb.) ve bunlarin secenekleri
create table if not exists list_categories (
  id uuid default gen_random_uuid() primary key,
  label text not null unique,
  created_at timestamptz default now()
);
create table if not exists list_items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid not null references list_categories(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
alter table list_categories enable row level security;
alter table list_items enable row level security;
drop policy if exists "public read" on list_categories;
drop policy if exists "public insert" on list_categories;
drop policy if exists "public delete" on list_categories;
create policy "public read" on list_categories for select using (true);
create policy "public insert" on list_categories for insert with check (true);
create policy "public delete" on list_categories for delete using (true);
drop policy if exists "public read" on list_items;
drop policy if exists "public insert" on list_items;
drop policy if exists "public delete" on list_items;
create policy "public read" on list_items for select using (true);
create policy "public insert" on list_items for insert with check (true);
create policy "public delete" on list_items for delete using (true);

-- Kayitlara ozel kategori secimlerini tutmak icin esnek alan
alter table entries add column if not exists extra jsonb default '{}'::jsonb;
