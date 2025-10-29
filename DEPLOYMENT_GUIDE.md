# SkillBridge Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Netlify (Recommended - Free & Easy)

**Why Netlify?**
- Free hosting for static sites
- Automatic HTTPS
- Easy custom domain setup
- Continuous deployment from Git
- Perfect for React PWAs

**Steps:**

1. **Build the project**
   ```bash
   cd learner-pwa
   npm run build
   ```

2. **Deploy via Drag & Drop**
   - Go to [netlify.com](https://netlify.com)
   - Sign up for free account
   - Drag the `build` folder to the deployment area
   - Your site will be live instantly!

3. **Get your URL**
   - Netlify will give you a URL like: `https://amazing-name-123456.netlify.app`
   - You can customize this or add your own domain

**Alternative: Git Integration**
1. Push your code to GitHub
2. Connect Netlify to your GitHub repo
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Auto-deploy on every push!

---

### Option 2: Vercel (Great for React)

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd learner-pwa
   vercel --prod
   ```

3. **Follow prompts**
   - Link to existing project or create new
   - Vercel auto-detects React settings
   - Get instant URL

---

### Option 3: GitHub Pages (Free)

**Steps:**

1. **Install gh-pages**
   ```bash
   cd learner-pwa
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

---

### Option 4: Firebase Hosting

**Steps:**

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   cd learner-pwa
   firebase init hosting
   ```

3. **Configure**
   - Public directory: `build`
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## 🔧 Pre-Deployment Checklist

### 1. **Build Optimization**
```bash
cd learner-pwa
npm run build
```

### 2. **Test Production Build Locally**
```bash
npx serve -s build -l 3000
```
Visit `http://localhost:3000` to test

### 3. **PWA Verification**
- Open Chrome DevTools
- Go to Application tab
- Check Service Worker is registered
- Verify manifest.json loads correctly
- Test offline functionality

### 4. **Performance Check**
- Run Lighthouse audit in Chrome DevTools
- Target scores: Performance >90, PWA >90, Accessibility >95

---

## 🌐 Custom Domain Setup

### For Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records at your domain provider
4. Netlify provides free SSL certificate

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records
4. Automatic SSL certificate

---

## 📱 Mobile App Deployment (PWA)

### Android (Google Play Store):
1. Use **Bubblewrap** to create Android APK
   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest https://yoursite.com/manifest.json
   bubblewrap build
   ```

2. Upload APK to Google Play Console

### iOS (App Store):
1. Use **PWABuilder** from Microsoft
2. Generate iOS package
3. Submit to App Store Connect

---

## 🔒 Environment Configuration

### Production Environment Variables

Create `.env.production`:
```env
REACT_APP_API_URL=https://api.skillbridge.co.ke
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_GOOGLE_ANALYTICS=GA_MEASUREMENT_ID
```

### Security Headers

Add to your hosting platform:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 📊 Analytics & Monitoring

### Google Analytics 4
1. Create GA4 property
2. Add tracking code to `public/index.html`
3. Track user interactions and learning progress

### Error Monitoring
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Hotjar** for user behavior analysis

---

## 🚀 Recommended Deployment: Netlify

**For your SkillBridge platform, I recommend Netlify because:**

1. **Free tier is generous**
2. **Perfect for PWAs**
3. **Easy custom domain**
4. **Automatic HTTPS**
5. **Great for academic/research projects**

### Quick Netlify Deployment:

```bash
# 1. Build the project
cd learner-pwa
npm run build

# 2. Install Netlify CLI (optional)
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=build
```

Or simply drag the `build` folder to netlify.com!

---

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd learner-pwa
          npm install
      - name: Build
        run: |
          cd learner-pwa
          npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './learner-pwa/build'
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🌍 International Deployment

### CDN Configuration
- **Cloudflare**: Free CDN with global edge locations
- **AWS CloudFront**: Enterprise-grade CDN
- **Netlify Edge**: Built-in global CDN

### Multi-Region Deployment
For Kenya-specific optimization:
1. Use African CDN edge locations
2. Consider hosting in South Africa region
3. Optimize for mobile-first networks

---

## 📈 Post-Deployment Monitoring

### Key Metrics to Track:
1. **Page Load Speed** (target: <3 seconds)
2. **PWA Install Rate**
3. **Offline Usage Patterns**
4. **User Engagement** (time on site, course completion)
5. **Mobile vs Desktop Usage**

### Tools:
- Google PageSpeed Insights
- GTmetrix
- Pingdom
- Google Search Console

---

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **PWA Not Installing**
   - Check manifest.json is accessible
   - Verify service worker registration
   - Ensure HTTPS is enabled

3. **Routing Issues (404 on refresh)**
   - Configure redirects: `_redirects` file for Netlify
   - Add: `/*    /index.html   200`

4. **Large Bundle Size**
   ```bash
   # Analyze bundle
   npm install --save-dev webpack-bundle-analyzer
   npx webpack-bundle-analyzer build/static/js/*.js
   ```

---

## 🎯 Next Steps After Deployment

1. **Test on real devices** (Android/iOS)
2. **Set up monitoring** and analytics
3. **Configure custom domain**
4. **Submit to app stores** (optional)
5. **Set up backup** and version control
6. **Plan for scaling** as user base grows

---

## 💡 Pro Tips

1. **Use staging environment** for testing
2. **Enable gzip compression** on your hosting
3. **Set up proper caching headers**
4. **Monitor Core Web Vitals**
5. **Test offline functionality** thoroughly
6. **Optimize images** for faster loading
7. **Use lazy loading** for better performance

Your SkillBridge platform is now ready for the world! 🌍