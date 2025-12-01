# Vercel Deployment Guide

## ✅ Backend Compatibility

**Yes, your backend will work perfectly on Vercel!**

- ✅ **API Routes**: All your API routes (`/api/*`) will work as serverless functions
- ✅ **Next.js**: Fully supported (Vercel is made by Next.js creators)
- ✅ **MongoDB/Prisma**: Works with MongoDB Atlas (cloud database)
- ✅ **NextAuth**: Fully compatible
- ✅ **Serverless Functions**: All your API endpoints will be serverless

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

Your code is already on GitHub at: `https://github.com/fdigit/NaijaPrepAI`

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository: `fdigit/NaijaPrepAI`
4. Vercel will auto-detect it's a Next.js project

### Step 3: Configure Environment Variables

**CRITICAL**: Add these environment variables in Vercel dashboard:

#### Required Variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-here-minimum-32-characters
NEXTAUTH_URL=https://your-app-name.vercel.app

# Database (MongoDB Atlas)
DATABASE_URL=your-mongodb-atlas-connection-string

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

#### Optional (if using Google OAuth):

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important Notes:**
- `NEXTAUTH_URL` should be your Vercel domain (e.g., `https://naijaprep-ai.vercel.app`)
- You'll get the exact URL after first deployment
- Update `NEXTAUTH_URL` after first deployment if needed

### Step 4: Configure Build Settings

Vercel should auto-detect, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 5: Add Prisma Build Step (IMPORTANT)

Add a **Build Command** override in Vercel:

```bash
npm install && npx prisma generate && npm run build
```

Or add to `package.json` scripts:

```json
"vercel-build": "prisma generate && next build"
```

### Step 6: Deploy

Click **"Deploy"** and wait for the build to complete.

## 🔧 Post-Deployment Configuration

### Update NEXTAUTH_URL

After first deployment:

1. Get your Vercel URL (e.g., `https://naijaprep-ai.vercel.app`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (or it will auto-redeploy)

### Update Google OAuth (if using)

If you use Google OAuth, update your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
5. Save

## 📋 Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `NEXTAUTH_SECRET` (32+ character random string)
- [ ] `NEXTAUTH_URL` (your Vercel domain - update after first deploy)
- [ ] `DATABASE_URL` (MongoDB Atlas connection string)
- [ ] `GEMINI_API_KEY` (for AI features)
- [ ] `GOOGLE_CLIENT_ID` (optional - if using Google sign-in)
- [ ] `GOOGLE_CLIENT_SECRET` (optional - if using Google sign-in)

## 🗄️ Database Setup

### MongoDB Atlas Configuration

1. **Use MongoDB Atlas** (cloud) - not local MongoDB
2. **Whitelist Vercel IPs** (or use `0.0.0.0/0` for all IPs - less secure but easier)
3. **Connection String Format**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/naijaprep?retryWrites=true&w=majority
   ```

### After First Deploy - Run Prisma Migrations

After deployment, you may need to run:

```bash
npx prisma db push
```

Or set up a script to run it automatically.

## 🔍 Troubleshooting

### Issue: "Prisma Client not generated"

**Solution**: Add to `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && next build"
  }
}
```

### Issue: "Cannot connect to database"

**Solutions**:
- Verify MongoDB Atlas IP whitelist includes Vercel IPs
- Check DATABASE_URL is correct
- Ensure database user has proper permissions

### Issue: "NEXTAUTH_SECRET is missing"

**Solution**: Add `NEXTAUTH_SECRET` in Vercel environment variables

### Issue: "API routes return 500"

**Solutions**:
- Check Vercel function logs
- Verify all environment variables are set
- Check MongoDB connection
- Review serverless function timeout (default 10s, can increase to 60s)

## 📝 Recommended: Add vercel.json

Create `vercel.json` in project root (optional):

```json
{
  "buildCommand": "npm install && npx prisma generate && npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## 🎯 Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub
- [ ] Environment variables added in Vercel
- [ ] Build command includes `prisma generate`
- [ ] MongoDB Atlas configured and accessible
- [ ] NEXTAUTH_URL updated after first deploy
- [ ] Test deployment works

## 🚀 After Deployment

1. Visit your Vercel URL
2. Test authentication (sign up/sign in)
3. Test lesson generation
4. Test quiz functionality
5. Check API routes are working

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and analytics
- **Function Logs**: Check API route errors in Vercel dashboard
- **Database**: Monitor MongoDB Atlas dashboard for connections

---

**Your backend will work perfectly on Vercel!** All API routes become serverless functions automatically.

