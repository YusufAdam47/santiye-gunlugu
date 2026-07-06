-- Bunu da SQL Editor'de çalıştır (Run).
-- Kayıtları düzenleme ve silme izni ekliyor.

create policy "public update" on entries
  for update using (true) with check (true);

create policy "public delete" on entries
  for delete using (true);

create policy "public photo delete"
  on storage.objects for delete
  using ( bucket_id = 'photos' );
