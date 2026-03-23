# PWA Configuration Checklist

## ✅ Completed

### Configuration Files
- [x] `/manifest.json` - App metadata with icons and shortcuts
- [x] `/sw.js` - Service Worker with offline support
- [x] `index.html` - PWA meta tags and service worker registration
- [x] `vite.config.ts` - Cache headers configuration
- [x] `PWA_SETUP.md` - Complete PWA documentation
- [x] `generate-icons.sh` - Icon generation script

### Features
- [x] Offline functionality (network-first for API, cache-first for assets)
- [x] App installability (standalone mode)
- [x] App shortcuts (Mecze, Tabele, Drużyny)
- [x] Push notification ready
- [x] Background sync ready
- [x] Adaptive icons support (maskable)

### Meta Tags Added
- [x] manifest.json link
- [x] theme-color (#000000)
- [x] description
- [x] apple-mobile-web-app-capable
- [x] apple-mobile-web-app-status-bar-style
- [x] apple-mobile-web-app-title
- [x] apple-touch-icon

## ⏳ Required Actions Before Deployment

### 1. Generate Icons
```bash
# Prepare a square logo image and run:
./generate-icons.sh your-logo.png
```

**Required icon files in `/public`:**
- [ ] icon-96x96.png
- [ ] icon-192x192.png
- [ ] icon-192x192-maskable.png
- [ ] icon-512x512.png
- [ ] icon-512x512-maskable.png
- [ ] apple-touch-icon.png (180x180)

**Optional screenshots:**
- [ ] screenshot-mobile.png (540x720)
- [ ] screenshot-desktop.png (1280x720)

### 2. Test PWA Locally
```bash
npm run build
npm run preview
```

In Chrome DevTools:
- [ ] Check Application → Manifest (should load without errors)
- [ ] Check Application → Service Workers (should be registered)
- [ ] Check Application → Cache Storage (should have entries)
- [ ] Test offline mode (offline = true in Network tab)

### 3. Test Installation
- [ ] Android Chrome: Tap install prompt or menu → Install app
- [ ] iOS Safari: Share → Add to Home Screen
- [ ] Desktop Chrome: Click install icon or menu → Install app

### 4. Verify Offline Functionality
- [ ] Install app
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Navigate around - should work from cache
- [ ] Try API calls - should show cached responses

### 5. Before Production Deployment
- [ ] HTTPS enabled on hosting
- [ ] manifest.json accessible at `/manifest.json`
- [ ] sw.js accessible at `/sw.js`
- [ ] All icon files in `/public`
- [ ] Test on multiple devices/browsers

## Cache Busting

To invalidate cache and force users to get new version:
Edit `/public/sw.js` line 1:
```javascript
const CACHE_NAME = 'liga-elektryka-v2';  // Increment version
```

## Monitoring

### Check if PWA installed (in browser console):
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

### Check cached responses:
Chrome DevTools → Application → Cache Storage → liga-elektryka-v1

## Performance & Security

✅ No sensitive data cached
✅ Only HTTPS (+ localhost for dev)
✅ Service Worker in separate scope
✅ Secure auth via Supabase
✅ API caching respects authentication

## Future Enhancements

- [ ] Push notifications for match results
- [ ] Background sync for offline match entries
- [ ] Web Share API integration
- [ ] Periodic background sync for scores
- [ ] Installable PWA builder integration
