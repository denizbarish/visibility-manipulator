# Brief: Eklenti Penceresi (Popup)

**Kip:** İşlet. Kullanıcı bir ayarı değiştirip çıkar; taranabilirlik ifadeden önce gelir, kimlik ince ayrıntıda yaşar.

**Kullanıcı ve an:** Toplantı, kurs ya da sınav sekmesi açıkken araç çubuğundaki simgeye tıklar. Amacı tek: "şu sitede şu davranış açık mı, değilse aç ya da kapat". Çoğu zaman başka bir sekmededir.

**Ekran:** tek pencere, iki ayrı ayar. Ayarlar birbirine karışmamalı (kullanıcı isteği).

| Ayar | Varsayılan | Birincil eylem | Veri |
| --- | --- | --- | --- |
| Görünürlük | Her sitede açık | Site anahtarı | Açık siteler, her birinin durumu, yenileme gerekip gerekmediği |
| Sekme İçi Tam Ekran | Her sitede kapalı | Site anahtarı | Açık siteler, her birinin durumu |

**Eylemler:** site anahtarı (birincil, tek), Hepsini Kapat / Hepsini Aç, Sayfaları Yenile (yalnız Görünürlük, yalnız gerektiğinde).

**Durumlar:** dolu (1 ile 30+ site, kaydırma), boş (açık site yok), yenileme bekliyor, uzun alan adı (kesilir), açık ve koyu tema.

**Kısıtlar:** Chrome eklenti penceresi (en çok 800x600; hedef genişlik 320 ile 360 px), derleme adımı yok (saf HTML, CSS, JS), uzak kaynak yüklenemez (font ve görsel pakete girer), tr ve en.

**Varsayımlar:** logo (mor zemin, göz) korunur; ayar site bazlıdır.
