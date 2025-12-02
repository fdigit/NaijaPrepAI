# 🔄 Update GEMINI_API_KEY in Vercel

## ✅ Yes, You Need to Update Vercel!

If you have your app deployed on Vercel, you **must** update the `GEMINI_API_KEY` environment variable there as well. The local fix only works for your development environment.

## 🚀 Quick Steps to Update Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Find your **NaijaPrepAI** project
4. Click on it to open the project dashboard

### Step 2: Navigate to Environment Variables
1. Click on **Settings** (in the top navigation)
2. Click on **Environment Variables** (in the left sidebar)

### Step 3: Update GEMINI_API_KEY
1. Find `GEMINI_API_KEY` in the list
2. Click the **Edit** (pencil icon) or **Delete** button
3. **Delete the old key** (the one that was revoked)
4. Click **Add New** to add a new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyByTm-HztGLW7kqQf9llMGJ6UhqZX_C2oQ` (your new key)
   - **Environment**: Select all environments:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Click **Save**

### Step 4: Redeploy
After updating the environment variable, you need to trigger a new deployment:

**Option A: Automatic Redeploy**
- Vercel will automatically redeploy if you have auto-deploy enabled
- Wait a few minutes for the deployment to complete

**Option B: Manual Redeploy**
1. Go to the **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a deployment

## ✅ Verify It's Working

After the deployment completes:
1. Visit your Vercel app URL
2. Try generating a lesson
3. It should work now! 🎉

## 🔒 Security Reminder

Since you're updating the API key in Vercel:
- ✅ The old revoked key is removed
- ✅ The new key is active
- ⚠️ **Remember**: Also rotate your MongoDB connection string and NEXTAUTH_SECRET if they were exposed

## 📋 Environment Variables to Check in Vercel

While you're in the Vercel dashboard, verify these are all set correctly:

- [ ] `GEMINI_API_KEY` ← **Update this one!**
- [ ] `NEXTAUTH_SECRET` (should be rotated if exposed)
- [ ] `NEXTAUTH_URL` (should be your Vercel domain)
- [ ] `DATABASE_URL` (should be rotated if exposed)
- [ ] `GOOGLE_CLIENT_ID` (optional)
- [ ] `GOOGLE_CLIENT_SECRET` (optional)

## 🎯 Summary

**Yes, you need to update Vercel!** The environment variables in Vercel are separate from your local `.env.local` file. After updating:

1. ✅ Update `GEMINI_API_KEY` in Vercel dashboard
2. ✅ Redeploy (automatic or manual)
3. ✅ Test your deployed app

Your app will work both locally and on Vercel! 🚀

