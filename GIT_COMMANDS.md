# 🚀 Git Commands to Push SkillBridge to GitHub

## Quick Commands (Copy & Paste)

```bash
# Navigate to the project directory
cd learner-pwa

# Initialize Git repository (if not already done)
git init

# Add all files
git add .

# Commit with descriptive message
git commit -m "Initial commit: SkillBridge AI-powered digital skills platform

Features:
- AI-driven skills assessment and personalized learning paths
- Progressive Web App (PWA) with offline capabilities
- Business automation tools (inventory, CRM, payments)
- Mobile-first responsive design with Manrope font
- Real YouTube course integration
- Multi-language support (English interface)
- Designed for economic empowerment in Kiharu Constituency, Kenya

Tech Stack: React 19, Bootstrap 5, TensorFlow.js, Service Workers
Research: MIT/2025/42733 - Mount Kenya University"

# Add remote repository
git remote add origin https://github.com/masad-stock/learner.git

# Create and switch to main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Use the Scripts

**Windows:**
```cmd
push-to-github.bat
```

**Mac/Linux:**
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

## If Repository Already Has Content

If the GitHub repository already has files, you might need to force push:

```bash
git push -u origin main --force
```

⚠️ **Warning:** Force push will overwrite any existing content in the repository.

## Troubleshooting

### Authentication Issues
```bash
# Set your Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# For HTTPS authentication, you might need a Personal Access Token
# Go to GitHub Settings > Developer settings > Personal access tokens
```

### Repository Doesn't Exist
1. Make sure the repository exists at: https://github.com/masad-stock/learner.git
2. Ensure you have write access to the repository
3. Check if the repository is private and you have permissions

### Large Files Warning
If you get warnings about large files, add them to `.gitignore`:
```bash
echo "node_modules/" >> .gitignore
echo "build/" >> .gitignore
git add .gitignore
git commit -m "Add .gitignore for large files"
```

## After Successful Push

1. **Verify Upload:** Visit https://github.com/masad-stock/learner
2. **Set up Deployment:** Connect to Netlify/Vercel for automatic deployment
3. **Update README:** Add your live demo URL
4. **Configure Settings:** Set up branch protection, collaborators, etc.

## Next Steps for Deployment

Once pushed to GitHub, you can:

1. **Auto-deploy with Netlify:**
   - Go to netlify.com
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `build`

2. **Auto-deploy with Vercel:**
   - Go to vercel.com
   - Import your GitHub repository
   - Vercel auto-detects React settings

3. **GitHub Pages:**
   - Go to repository Settings > Pages
   - Select source branch
   - Your site will be available at: `https://masad-stock.github.io/learner`

Your SkillBridge platform will be live and accessible worldwide! 🌍