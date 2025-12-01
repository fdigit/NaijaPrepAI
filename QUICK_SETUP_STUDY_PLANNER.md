# ⚡ Quick Setup - Study Planner Feature

## 🎯 3-Step Setup

### Step 1: Stop Server (if running)
Press `Ctrl+C` in your terminal to stop the development server.

### Step 2: Update Database
Run these commands in PowerShell:

```powershell
# Generate Prisma Client
npm run db:generate

# Push new schema to database
npm run db:push
```

### Step 3: Restart Server
```powershell
npm run dev
```

## ✅ Verify It Works

1. Go to: `http://localhost:3000/dashboard/study-planner`
2. You should see the Study Planner page
3. Click "Create Timetable" to test

## 🔑 Required Environment Variable

Make sure you have `GEMINI_API_KEY` in your `.env.local`:

```bash
GEMINI_API_KEY=your-api-key-here
```

Get your key at: https://aistudio.google.com/app/apikey

## 🐛 If You Get Errors

**"File in use" error:**
- Make sure server is completely stopped
- Close any other programs using the database
- Try again

**"Cannot find module" error:**
- Run `npm install` first
- Then `npm run db:generate`

**"Unauthorized" error:**
- Make sure you're logged in
- Check `.env.local` has `NEXTAUTH_SECRET`

---

**That's it! The feature is ready to use.** 🚀

