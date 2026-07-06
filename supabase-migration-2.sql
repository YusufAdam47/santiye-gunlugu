-- Mevcut supabase-schema.sql'i zaten çalıştırdıysan, SADECE bu dosyayı
-- SQL Editor'de çalıştırman yeterli (yeni sütunlar ekler, veri kaybı olmaz).
-- Hiç çalıştırmadıysan önce supabase-schema.sql'i, sonra bunu çalıştır.

alter table entries add column if not exists company text;
alter table entries add column if not exists media_urls text[] default '{}';

-- Eski tekil photo_url sütunu artık kullanılmıyor, dokunmuyoruz (veri kaybı olmasın diye siliyor değiliz).
