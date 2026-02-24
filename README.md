# Universitet Hesablayıcı

🎓 Universitet tələbələri üçün kompleks hesablayıcı sistemi

## Xüsusiyyətlər

### 1. 📊 Semestr Bal Hesablama
- Seminar ballarının hesablanması (dinamik say daxil etmə)
- Kollekvium ballarının hesablanması (dinamik say daxil etmə)
- Sərbəst iş qiyməti (0-10 arası)
- Davamiyyət hesablama (30-105 saat arası, qayıb sayına görə)
- Final hesablama düsturu: `(semestr orta*0.4 + kollekvium orta*0.6)*3 + davamiyyət + sərbəst iş`
- Maksimum bal: 50

### 2. 💰 25% İmtahan Ödənişi (Kəsr Pulu)
- İllik ödəniş daxil etmə
- Kredit sayı daxil etmə
- Hesablama düsturu: `[((illik ödəniş/60)*kredit sayı)/4] + 1`

### 3. 🎂 Yaş Hesablayıcı
- Doğum tarixi daxil etmə (GG.AA.IIII formatında)
- Cari yaş hesablama
- Yaşadığınız gün sayı
- Növbəti ad gününüzə qalan gün sayı
- Texniki problemsiz, dəqiq hesablama

## PWA Xüsusiyyətləri

✅ Offline işləmə dəstəyi
✅ Tətbiq kimi quraşdırma
✅ Responsive dizayn (mobil, planşet, desktop)
✅ Service Worker cache sistemi
✅ Standalone rejim

## WhatsApp İnteqrasiyası

Saytın yuxarısında sabit qalan banner vasitəsilə:
- **Ən ucuz sərbəst iş hazırlanması** xidməti
- WhatsApp düyməsi (+994559406018)
- Direkt mesaj göndərmə

## Texnologiyalar

- Vanilla JavaScript (xarici kitabxana yoxdur)
- Modern CSS (Grid, Flexbox, Animations)
- Progressive Web App (PWA)
- Service Worker (offline dəstəyi)
- Responsive Design

## Deploy

### Render.com üçün
1. Bu reponu GitHub-a push edin
2. Render.com-da yeni Static Site yaradın
3. Repository seçin
4. Build Command: boş qoyun
5. Publish Directory: `/` (root)
6. Deploy düyməsini basın

### Lokal Test
1. HTTP server başladın:
   ```bash
   python3 -m http.server 8000
   ```
2. Brauzerdə açın: `http://localhost:8000`

## Qovluq Strukturu

```
webapp/
├── index.html          # Əsas HTML faylı
├── styles.css          # CSS stilləri
├── app.js             # JavaScript məntiq
├── manifest.json      # PWA konfiqurasiyası
├── sw.js              # Service Worker
├── icon-192.png       # 192x192 ikon
├── icon-512.png       # 512x512 ikon
└── README.md          # Bu fayl
```

## Xüsusiyyətlər

- ✅ Tam responsive dizayn
- ✅ Modern gradient rənglər
- ✅ Animasiyalar və transition effektləri
- ✅ Form validasiyası
- ✅ Xəta idarəetməsi
- ✅ Istifadəçi dostu interfeys
- ✅ PWA quraşdırma düyməsi
- ✅ Offline işləmə
- ✅ WhatsApp inteqrasiyası

## Lisenziya

MIT License

## Əlaqə

WhatsApp: +994559406018

---

💡 **Qeyd:** Bu layihə 100% vanilla JavaScript ilə yazılıb və heç bir xarici kitabxana istifadə edilməyib.
