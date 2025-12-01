# 🚀 Vercel Deployment - Quick Start

## ✅ Will Your Backend Work on Vercel?

**YES! Your backend will work perfectly on Vercel.**

- ✅ All API routes (`/api/*`) become serverless functions automatically
- ✅ Next.js is fully supported (Vercel is made by Next.js creators)
- ✅ MongoDB/Prisma works with MongoDB Atlas
- ✅ NextAuth authentication works
- ✅ All your features will work: lessons, quizzes, exam prep, gamification

## 📋 Pre-Deployment Checklist

### 1. ✅ Code is on GitHub
Your code is already at: `https://github.com/fdigit/NaijaPrepAI`

### 2. ✅ Configuration Files Ready
- ✅ `vercel.json` created
- ✅ `package.json` has `vercel-build` script
- ✅ Build tested locally (`npm run build` works)

### 3. ⚠️ Environment Variables Needed

You'll need to add these in Vercel dashboard:

#### Required:
```bash
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://your-app.vercel.app  # Update after first deploy
DATABASE_URL=your-mongodb-atlas-connection-string
GEMINI_API_KEY=your-gemini-api-key
```

#### Optional (if using Google OAuth):
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🚀 Deployment Steps

### Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**

### Step 2: Import Repository
1. Find `fdigit/NaijaPrepAI`
2. Click **"Import"**

### Step 3: Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run vercel-build` (auto-set from vercel.json)
- **Output Directory**: `.next` (default)

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add:

1. **NEXTAUTH_SECRET**
   - Generate: `openssl rand -base64 32` or use [this tool](https://generate-secret.vercel.app/32)
   - Value: Your generated secret

2. **NEXTAUTH_URL**
   - Value: `https://your-app-name.vercel.app` (you'll get this after first deploy)
   - ⚠️ Update this after first deployment with your actual URL

3. **DATABASE_URL**
   - Value: Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/naijaprep?retryWrites=true&w=majority`

4. **GEMINI_API_KEY**
   - Value: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

5. **GOOGLE_CLIENT_ID** (if using Google OAuth)
   - Value: From Google Cloud Console

6. **GOOGLE_CLIENT_SECRET** (if using Google OAuth)
   - Value: From Google Cloud Console

### Step 5: Deploy
Click **"Deploy"** and wait 2-3 minutes.

### Step 6: Update NEXTAUTH_URL
After deployment:
1. Copy your Vercel URL (e.g., `https://naijaprep-ai.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual URL
4. Redeploy (or wait for auto-redeploy)

## 🔧 MongoDB Atlas Setup

### Important: Use MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas Account**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster** (Free tier is fine)
3. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
4. **Whitelist IP Addresses**:
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs - for Vercel)
   - Or add specific Vercel IP ranges

## ✅ What's Already Configured

- ✅ `vercel.json` - Build configuration
- ✅ `package.json` - Has `vercel-build` script with Prisma generate
- ✅ All API routes are serverless-ready
- ✅ Next.js optimized for Vercel

## 🎯 After Deployment

1. **Test Authentication**: Sign up/Sign in
2. **Test Lesson Generation**: Create a lesson
3. **Test Quiz**: Complete a quiz
4. **Test Gamification**: Check XP and badges
5. **Check API Routes**: Verify all endpoints work

## 🐛 Common Issues

### Build Fails: "Prisma Client not found"
**Fix**: The `vercel-build` script already includes `prisma generate` - should work automatically.

### Database Connection Error
**Fix**: 
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check DATABASE_URL is correct
- Ensure database user has read/write permissions

### Authentication Not Working
**Fix**:
- Verify `NEXTAUTH_SECRET` is set
- Update `NEXTAUTH_URL` to your actual Vercel domain
- Check Google OAuth redirect URI if using Google sign-in

### API Routes Return 500
**Fix**:
- Check Vercel Function Logs in dashboard
- Verify all environment variables are set
- Check MongoDB connection

## 📊 Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Function Logs**: Check API route errors
- **MongoDB Atlas**: Monitor database connections

---

**Ready to deploy?** Just follow the steps above and your app will be live! 🚀

