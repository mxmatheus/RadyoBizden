# Mimarisi (ARCHITECTURE.md)

## Katmanlar
1. **Görsel Katman (App & Components)**: React ve Tailwind CSS + Framer Motion.
2. **State Yönetimi (Store)**: Zustand kullanarak Player state (çalma, duraklatma, ses, tema) yönetimi.
3. **Servis Katmanı (Lib & API)**: RadioBrowser proxy endpoint'leri ve Howler audio engine.

## Veri Akışı
- Bileşenler Zustand store'dan güncel durumu dinler.
- Kullanıcı bir istasyona tıkladığında `playerStore.play(station)` çağrılır.
- GlobalPlayer howler.js üzerinden yayını başlatır, metadata değişikliklerini polling ile API katmanından alır.
