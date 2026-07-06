-- Bu dosyayı Supabase panelinde "SQL Editor" bölümüne yapıştırıp "Run" a bas.

create table if not exists entries (
  id uuid default gen_random_uuid() primary key,
  project text not null,
  work text not null,
  note text,
  photo_url text,
  gps_lat double precision,
  gps_lng double precision,
  created_at timestamptz default now()
);

-- Herkesin okuyup yazabilmesi icin basit bir MVP politikasi (ileride kullanici girisi eklenince siki­lastirilacak)
alter table entries enable row level security;

create policy "public read" on entries
  for select using (true);

create policy "public insert" on entries
  for insert with check (true);

-- Fotograflar icin storage bucket'i olustur (Storage > New bucket > adi: photos, public: evet)
-- Bucket'i arayuzden olusturduktan sonra asagidaki policy'leri de SQL Editor'de calistir:

create policy "public photo read"
  on storage.objects for select
  using ( bucket_id = 'photos' );

create policy "public photo upload"
  on storage.objects for insert
  with check ( bucket_id = 'photos' );
