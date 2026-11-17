---
name: Visibility Manipulator
description: Tarayıcının kendi parçası gibi duran, sakin ve yoğun bir eklenti penceresi; kimliği anahtar çiziminde yaşar.
colors:
  strip: "light-dark(#dcdee6, #1d1e24)"
  panel: "light-dark(#ffffff, #2a2b33)"
  line: "light-dark(#eceef3, #363844)"
  edge: "light-dark(#c5c8d3, #474a5c)"
  text: "light-dark(#1b1c22, #eeeff4)"
  muted: "light-dark(#4d505c, #b0b3c0)"
  accent: "light-dark(#5a20dc, #a288ff)"
  off: "light-dark(#8f94a3, #7b7f91)"
  key: "light-dark(#f4f5f8, #33343e)"
  key-on: "light-dark(#ece8fd, #3a3560)"
  sponsor: "light-dark(#bf3989, #db61a2)"
  button: "light-dark(#1b1c22, #eeeff4)"
  on-button: "light-dark(#ffffff, #1b1c22)"
typography:
  body: { fontFamily: "system-ui", fontSize: "13px", lineHeight: 1.35 }
rounded: { sm: "3px", md: "8px", lg: "10px" }
spacing: { unit: "4px" }
---

Normatif değerler `popup.css` içindeki `:root` token'larıdır; bu dosya onların aynasıdır, çatışırsa kod kazanır.

## Overview

- Ürün ve kitle: sayfaların sekme değişimini ve tam ekrandan çıkışı fark etmesini engelleyen açık kaynak Chrome eklentisi; toplantı, kurs, video izleyen herkes.
- Tür ve yoğunluk: operasyonel araç, yoğun.
- Seçilen yön: Sekme Şeridi ile göz efekti karışımı (kayıt: `docs/design/yon.md`).
- İmza öğesi (tek): anahtarın kendisi bir çizimdir; göz kapanır, çerçeve köşeleri içe döner.
- Bileşen tabanı: yok; saf HTML, CSS ve JS, derleme adımı yok.

## Colors

Nötr gri şerit ve beyaz panel (koyu temada kömür). Tek vurgu rengi logodaki mor; yalnız açık durumdaki anahtarda kullanılır. Kapalı durum gridir. Birincil düğme metin renginde dolu, vurgu renginde değil.

## Typography

Tek aile: `system-ui`, 13 px, satır yüksekliği 1.35. Ağırlık 500 (sekme, sessiz düğme), 600 (seçili sekme, bulunulan site, birincil düğme), 700 (favicon yer tutucu harfi). Sayaçlar tabular rakam. Paketlenmiş font yok.

## Layout

Genişlik 340 px. 4 px birim; 8 ve 12 px adımlar. Üstte logo ve iki sekme, altında tek panel, en altta eylem satırı. Satır 44 px, sekme 36 px, düğme 30 px, anahtar 48x32 px. Liste 396 px'ten sonra kayar.

## Elevation & Depth

Gölge yok. Derinlik iki yüzeyle kurulur: gri şerit ve onun üstündeki panel. Satırlar 1 px kıl çizgisiyle ayrılır.

## Shapes

Sekme ve panel 10 px, düğme ve anahtar 8 px, favicon 3 px. Seçili sekme dışa kavisle panele akar (tarayıcı sekmesi biçimi).

## Components

- Sekme: etiket ve sağda açık site sayısı; ikon yok.
- Site satırı: favicon (yoksa baş harfli karo), alan adı (taşarsa kesilir), anahtar. Bulunulan sekmenin sitesi en üstte ve kalın.
- Anahtar (`role="switch"`): tuş yüzeyi içinde çizim. Açık: mor tonlu yüzey, mor çizim. Kapalı: gri yüzey, gri çizim.
- Sessiz düğme (Hepsini Kapat / Hepsini Aç): zeminsiz, 1 px kenarlıklı.
- Birincil düğme (Sayfaları Yenile): dolu, yalnız gerektiğinde görünür.
- Sponsor kalbi: alt satırın tam ortasında 30 px'lik bağlantı, GitHub Sponsors sayfasını yeni sekmede açar. Kendi rengi (`--sponsor`, pembe) yalnız burada kullanılır.

## Do's and Don'ts

- Vurgu rengini anahtar dışında kullanma. Pembe yalnız sponsor kalbinindir.
- Slogan, yardımcı metin, ikincil etiket ekleme.
- Sekmelere ikon koyma; göz tek görüş alanında yeterince tekrar ediyor.
- Kart, gölge, degrade ekleme.

## Responsive Behavior

Yok; pencere genişliği sabittir. Yükseklik içeriğe göre büyür.

## Composition

Tek sütun, sola hizalı metin, sağda tek anahtar sütunu. Birincil eylem satırdaki anahtardır; alt satırdaki düğmeler ikincildir.

## Imagery & Iconography

Gerçek logo sol üstte. Site favicon'ları gerçek. Çizimler 36x26 görüş kutusunda, 2.6 px yuvarlak uçlu çizgi; göz logodan türetilir.

## Motion

Yalnız kullanıcının tıklamasına yanıt: 200 ms, `cubic-bezier(0.3, 0.7, 0.3, 1)`. Üst göz kapağı alt kapağın üstüne katlanır, iris küçülerek kaybolur, kirpikler 120 ms gecikmeyle belirir. Çerçeve köşeleri yerinde 180 derece döner. Sekme değişiminde animasyon yok. `prefers-reduced-motion` uygulanır.

## Content & Microcopy

Etiketler Title Case, tr ve en (`_locales/`). Eylem adı sonucu söyler: "Hepsini Kapat", "Sayfaları Yenile". Boş durum: "Açık Site Yok".

## Reference Screens

| Dosya | Alınan |
| --- | --- |
| `docs/design/refs/NOTLAR.md` | Dark Reader, uBlock Origin Lite, Linear ve Raycast ölçümleri ve notları |

## Positive Examples

Kullanıcı onayı 2026-11-17 ("Evet yap."): `docs/popup.tr.png` (Görünürlük), `docs/popup-fullscreen.tr.png` (Tam Ekran).
