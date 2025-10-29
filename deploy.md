# Deployment Guide - Jukumu Digital Platform

## Deployment Options

### 1. Local Development Server
```bash
npm start
# Runs on http://localhost:3000
# Hot reload enabled for development
```

### 2. Production Build
```bash
npm run build
# Creates optimized production build in 'build' folder
# Includes service worker for offline functionality
```

### 3. Local Production Testing
```bash
npm run build
npx serve -s build -l 3000
# Serves production build locally
# Test PWA functionality
```

### 4. Cloud Deployment Options

#### Netlify (Recommended for MVP)
1. Build the project: `npm run build`
2. Drag and drop the `build` folder to Netlify
3. Configure custom domain if needed
4. Enable HTTPS (automatic with Netlify)

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts for deployment

#### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Build: `npm run build`
4. Deploy: `firebase deploy`

#### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
3. Run: `npm run deploy`

## Environment Configuration

### Development Environment
Create `.env.development` file:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

### Production Environment
Create `.env.production` file:
```
REACT_APP_API_URL=https://api.jukumudigital.co.ke
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## PWA Configuration

### Service Worker
- Automatically enabled in production build
- Caches static assets and API responses
- Enables offline functionality
- Updates automatically when new version deployed

### Manifest Configuration
Located in `public/manifest.json`:
- App name and description
- Icons for different screen sizes
- Theme colors and display mode
- Shortcuts for quick access

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### Lighthouse Audit
1. Build production version
2. Serve locally or deploy
3. Run Lighthouse audit in Chrome DevTools
4. Target scores: Performance >90, Accessibility >95, PWA >90

## Mobile Testing

### Device Testing
- Test on actual mobile devices
- Use Chrome DevTools device emulation
- Test offline functionality
- Verify touch interactions

### Network Conditions
- Test on slow 3G connections
- Verify offline-first functionality
- Check data usage optimization
- Test intermittent connectivity

## Security Considerations

### HTTPS Requirement
- PWA requires HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure security headers

### Content Security Policy
Add to `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

## Monitoring & Analytics

### Error Tracking
Consider integrating:
- Sentry for error monitoring
- LogRocket for session replay
- Google Analytics for usage tracking

### Performance Monitoring
- Web Vitals tracking
- Service Worker performance
- Offline usage patterns

## Backup & Recovery

### Data Backup
- User data stored in localStorage
- Export functionality for user data
- Regular backup procedures

### Version Control
- Tag releases with semantic versioning
- Maintain deployment logs
- Rollback procedures documented

## Maintenance

### Regular Updates
- Update dependencies monthly
- Security patches immediately
- Feature updates quarterly

### User Support
- Error reporting mechanism
- User feedback collection
- Support documentation

## Scaling Considerations

### Performance Scaling
- CDN for static assets
- Image optimization
- Code splitting for large features

### User Scaling
- Database optimization
- Caching strategies
- Load balancing if needed

## Compliance

### Data Protection
- GDPR compliance for EU users
- Kenya Data Protection Act compliance
- User consent management

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation support

## Troubleshooting

### Common Issues
1. **Service Worker not updating**
   - Clear browser cache
   - Check service worker registration
   - Verify build process

2. **Offline functionality not working**
   - Check service worker installation
   - Verify cache configuration
   - Test network conditions

3. **PWA not installable**
   - Verify manifest.json
   - Check HTTPS requirement
   - Validate service worker

### Debug Tools
- Chrome DevTools Application tab
- Service Worker debugging
- Network throttling
- Lighthouse audits

## Support Contacts

For deployment issues:
- Technical Lead: [contact information]
- Research Team: MIT/2025/42733
- Institution: Mount Kenya University