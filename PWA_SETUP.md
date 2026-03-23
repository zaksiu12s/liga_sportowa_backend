# PWA Configuration Guide

## League App (LIGA ELEKTRYKA) - Progressive Web App Setup

This application is configured as a Progressive Web App (PWA) for offline functionality and installability on mobile and desktop devices.

## Features Enabled

✅ **Offline Support** - Service Worker caches essential files and API responses
✅ **Installable** - Can be installed like a native app on mobile and desktop
✅ **Push Notifications** - Ready for push notification support
✅ **App Shortcuts** - Quick navigation to key sections
✅ **Responsive Design** - Works seamlessly on all screen sizes
✅ **Caching Strategy** - Network-first for API calls, cache-first for assets

## Files Created

### 1. `/manifest.json`
Application manifest with metadata, icons, and shortcuts.

### 2. `/sw.js`
Service Worker for offline functionality with:
- Cache-first strategy for static assets
- Network-first strategy for API calls
- Automatic cache updates
- Push notification support
- Background sync ready

### 3. Updated `index.html`
Added PWA meta tags:
- `manifest.json` link
- Theme color
- Apple mobile web app support
- Touch icon

## Icon Requirements

### Required Icons (Place in `/public` folder)

```
icon-96x96.png             (96x96 - Shortcuts)
icon-192x192.png           (192x192 - Manifest, Home Screen)
icon-192x192-maskable.png  (192x192 - Adaptive Icon)
icon-512x512.png           (512x512 - Splash Screen)
icon-512x512-maskable.png  (512x512 - Adaptive Icon)
apple-touch-icon.png       (180x180 - iOS Home Screen)
```

### Optional Screenshots

```
screenshot-mobile.png      (540x720 - Install dialog on mobile)
screenshot-desktop.png     (1280x720 - Install dialog on desktop)
```

## Generating Icons

### Using ImageMagick:
```bash
# Convert a base image to all required sizes
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 512x512 icon-512x512.png
convert logo.png -resize 180x180 apple-touch-icon.png
```

### Using Online Tools:
- https://www.favicon-generator.org/
- https://www.pwabuilder.com/imageGenerator
- https://squoosh.app/

### Adaptive Icons (Maskable):
For adaptive icons that work on all devices:
1. Create icon with transparent padding (15% around edges)
2. Name as `icon-{size}-maskable.png`
3. SVG backgrounds work well for maskable icons

## Testing the PWA

### On Android:
1. Open the app in Chrome
2. Tap menu → "Install app"
3. Or look for install prompt at top of page

### On iOS:
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. App will use apple-touch-icon.png

### On Desktop (Chrome):
1. Click install icon in address bar
2. Or Menu → "Install app"

### Testing Offline:
1. Install the app
2. Go to DevTools → Network → Throttle to "Offline"
3. Navigate around - app should work offline
4. Cached API responses will be used

### Testing Service Worker:
```javascript
// In browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations);
  });
}
```

## Caching Strategy

### API Calls (`/rest/v1/`)
- **Strategy**: Network-first
- **Behavior**: Try network, fallback to cache
- **Use Case**: Dynamic data (matches, teams, scorers)

### Static Assets
- **Strategy**: Cache-first
- **Behavior**: Serve from cache, update in background
- **Use Case**: JS, CSS, Images, Fonts

## Cache Management

### Cache Name
`liga-elektryka-v1`

### Updating Cache
To bust the cache, update `CACHE_NAME` in `/public/sw.js`:
```javascript
const CACHE_NAME = 'liga-elektryka-v2';  // Increment version
```

## Security Notes

✅ Service Worker only works on HTTPS (or localhost)
✅ No sensitive auth tokens stored in cache
✅ API responses cached but marked as temporary
✅ User data not persisted in PWA

## Deployment

### Build for Production
```bash
npm run build
```

### Verify PWA
1. Run `npm run preview`
2. Test install prompt
3. Test offline functionality
4. Check DevTools → Application → Manifest

### Checklist Before Deploying
- [ ] Icons placed in `/public` folder
- [ ] Service Worker registers without errors
- [ ] Manifest loads correctly
- [ ] App installable on test device
- [ ] Offline functionality works
- [ ] Cache busting working (check version number)

## Troubleshooting

### Service Worker not registering?
- Check browser console for errors
- Verify app is on HTTPS (or localhost)
- Check that `/sw.js` is accessible

### App not installable?
- Verify all required icons exist
- Check manifest.json syntax
- Ensure standalone display mode in manifest

### Cache issues?
- Clear Application Cache in DevTools
- Update CACHE_NAME in sw.js
- Hard refresh (Ctrl+Shift+R)

### API calls offline?
- Check that API responses were cached before going offline
- Network-first strategy needs at least one successful request
- View cached responses in DevTools → Cache Storage

## Push Notifications (Future)

To enable push notifications:

```javascript
// In app code
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Test', {
        body: 'Notification test',
        icon: '/icon-192x192.png'
      });
    });
  }
});
```

## Resources

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Spec](https://www.w3.org/TR/appmanifest/)
