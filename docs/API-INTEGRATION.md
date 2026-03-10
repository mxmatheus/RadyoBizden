# API Entegrasyonu (API-INTEGRATION.md)

## RadioBrowser API İletişimi
`lib/radioBrowser.ts` dosyası içerisinde merkezi bir API iletişim servisi bulunmaktadır.

### Önbelleğe Alma ve Proxy
CORS sorunlarını önlemek için, istemci ile asıl `de1.api.radio-browser.info` arasında Next.js Route Hander'lar proxy görevi görür. 
`/api/stations` endpoint'i üzerinden proxy edilir. Next.js server-side caching (revalidate: 300) kullanılır.

### Fallback Listesi
API erişiminde sorun olursa, popüler yerli kanallar `public/local-stations.json` üzerinden yüklenir.
