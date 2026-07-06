# Şantiye Günlüğü - Kurulum Rehberi (adım adım, kod bilgisi gerekmez)

Bu proje hazır, senin yapman gereken 2 şey: (1) ücretsiz bir Supabase hesabı açıp
veritabanını kurmak, (2) ücretsiz bir Vercel hesabı açıp projeyi yayına almak.
Toplam ~15 dakika sürer.

## ADIM 1: Supabase hesabı aç (veritabanı + fotoğraf depolama)

1. https://supabase.com adresine git, "Start your project" ile ücretsiz hesap aç
   (GitHub hesabınla giriş yapabilirsin, en hızlısı bu)
2. "New project" de, bir isim ver (örn: santiye-gunlugu), bölge olarak Frankfurt/EU seç
   (Türkiye'ye en yakın ve en hızlı), şifre oluştur (bir yere not al)
3. Proje oluşana kadar 1-2 dakika bekle
4. Sol menüden "SQL Editor" a tıkla, "New query" de
5. Bu klasördeki `supabase-schema.sql` dosyasının içeriğini kopyala, SQL Editor'e
   yapıştır, sağ alttaki "Run" butonuna bas
6. Sol menüden "Storage" a git, "New bucket" de, adını `photos` yap, "Public bucket"
   seçeneğini AÇIK bırak, oluştur
7. Sol menüden "Project Settings" > "API" ya git. Burada 2 bilgiye ihtiyacın olacak:
   - "Project URL" (https://xxxxx.supabase.co gibi bir şey)
   - "anon public" key (uzun bir kod, "Reveal" ile göster)
   Bu ikisini bir yere kopyala, Vercel adımında lazım olacak.

## ADIM 2: Vercel'e yükle (siteyi yayına alma)

1. https://vercel.com adresine git, GitHub hesabınla giriş yap
2. Bu proje klasörünü GitHub'a yüklemen lazım. En basit yol:
   - GitHub.com'da yeni bir repo oluştur (örn: santiye-gunlugu), "Private" seçebilirsin
   - Bana "GitHub'a nasıl yüklerim" dersen, bilgisayarında hangi işletim sistemi
     olduğuna göre terminal komutlarını adım adım sana yazarım
3. Vercel'de "Add New" > "Project" de, az önce oluşturduğun GitHub reposunu seç, "Import" de
4. "Environment Variables" bölümüne şu ikisini ekle (Adım 1'de kopyaladığın bilgiler):
   - NEXT_PUBLIC_SUPABASE_URL = (Supabase Project URL'in)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = (Supabase anon public key'in)
5. "Deploy" butonuna bas, 1-2 dakika bekle
6. Deploy bitince sana bir link verecek (örn: santiye-gunlugu.vercel.app) - bu senin
   canlı sitenin, artık telefonundan bu adrese girip test edebilirsin

## ADIM 3: Telefonuna "uygulama" olarak ekle

1. Telefonunda Safari (iPhone) veya Chrome (Android) ile Vercel linkine git
2. iPhone: paylaş butonu > "Ana Ekrana Ekle"
   Android: sağ üst üç nokta menüsü > "Ana ekrana ekle" veya "Uygulamayı yükle"
3. Artık telefonunda diğer uygulamalar gibi bir ikon olacak, tıklayınca tam ekran açılacak

## Sonraki adımlarda neler yapabiliriz

- Kendi domain adını bağlama (örn: santiyegunlugum.com) - Vercel'de ücretsiz/kolay
- Offline çalışma (internet olmadığında da kayıt alıp bağlanınca senkronize etme)
- Kullanıcı girişi ekleme (kimin girdiğini kaydetme, yetki seviyeleri)
- Punch list / görev takibi modülü

Herhangi bir adımda takılırsan ekran görüntüsü at, birlikte çözeriz.
