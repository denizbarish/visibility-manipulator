# Seçilen Yön

**Seçim (2026-11-17, kullanıcı):** "Karışım olsun A ama C'deki efekt güzel olmuş." Temel A (Sekme Şeridi), imza öğesi C'den (açılıp kapanan göz).

**Reddedilenler:** B (Canlı Yayın: sözcük markası bandı, Açık / Kapalı düğme çiftleri) ve C'nin yerleşimi (mor zemin, tek dev düğme). Kullanıcı gerekçe belirtmedi.

## Sözleşme

- **Palet:** nötr gri şerit ve beyaz panel (koyu temada kömür); tarayıcı kromunun parçası gibi durur. Tek vurgu rengi logodaki mor (`--accent`), yalnız açık durumdaki anahtar çiziminde. Kapalı durum gri (`--off`). Değerler `popup.css` içindeki `:root` token'larıdır.
- **Yazı:** `system-ui`, 13 px, satır yüksekliği 1.35; ağırlık 500 (sekme, düğme), 600 (seçili sekme, bulunulan site, birincil düğme). Paketlenmiş font yok. Sayaçlar tabular rakam.
- **Boşluk:** 4 px birim; 8 ve 12 px adımlar. Satır 44 px, sekme 36 px, düğme 30 px.
- **Biçim:** sekme ve panel radius 10 px, düğme ve anahtar alanı 8 px, favicon 3 px. Satırlar 1 px kıl çizgisiyle ayrılır; gölge yok.
- **Yerleşim iskeleti:** üstte tarayıcı sekmesi biçimli iki ayar sekmesi (seçili sekme dışa kavisle panele akar, sağında açık site sayısı); altında tek panelde site satırları (favicon, alan adı, anahtar); en altta solda sessiz "Hepsini Kapat", sağda yalnız gerektiğinde dolu "Sayfaları Yenile".
- **İmza öğesi:** anahtarın kendisi bir çizimdir. Görünürlük'te göz: kapanınca göz kapağı çizgiye iner, iris kaybolur. Tam Ekran'da çerçeve: açıkken köşeler dışa açılır, kapalıyken içe toplanır.
- **Hareket:** yalnız kullanıcının tıklamasına yanıt; 200 ms, `cubic-bezier(0.3, 0.7, 0.3, 1)`. Sekme değişiminde animasyon yok. `prefers-reduced-motion` uygulanır.
- **Gerçek malzeme:** açık sitelerin gerçek favicon'ları; göz çizimi logodan gelir.
- **İlk ekranda görünen:** Görünürlük sekmesi seçili, bulunulan sekmenin sitesi en üstte ve kalın.
- **Metin:** etiketler Title Case; slogan, yardımcı metin, ikincil etiket yok.
