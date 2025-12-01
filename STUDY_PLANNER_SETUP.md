# Study Planner & Timetable Generator - Setup Guide

## 🚀 Quick Setup Steps

### Step 1: Update Database Schema

Since we added new models (`ExamTimetable` and `StudyPlan`), you need to update your database:

**⚠️ IMPORTANT: Stop your development server first (Ctrl+C)**

```powershell
# 1. Generate Prisma Client with new models
npm run db:generate

# 2. Push schema changes to your MongoDB database
npm run db:push
```

**Note**: 
- `db:push` is safe for MongoDB and will add the new collections without affecting existing data
- If you get a "file in use" error, make sure the dev server is stopped
- The schema has been fixed to include `url = env("DATABASE_URL")` in the datasource block

### Step 2: Verify Environment Variables

Make sure you have these in your `.env.local` file:

```bash
# Required for Study Planner AI features
GEMINI_API_KEY=your-gemini-api-key-here

# Required for database
DATABASE_URL=your-mongodb-connection-string

# Required for authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Getting a Gemini API Key:**
1. Visit: https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to your `.env.local` file

### Step 3: Restart Development Server

After updating the database schema:

```powershell
# Stop the current server (Ctrl+C if running)
# Then restart:
npm run dev
```

### Step 4: Test the Feature

1. **Navigate to Study Planner:**
   - Go to: `http://localhost:3000/dashboard/study-planner`
   - Or click "Study Planner" in the sidebar

2. **Create an Exam Timetable:**
   - Click "Create Timetable"
   - Enter exam name (e.g., "WAEC 2024")
   - Set exam start date
   - Add subject exam dates (optional)
   - Click "Save Timetable"

3. **Generate a Study Plan:**
   - Click "Generate AI Study Plan"
   - Wait for the AI to create your personalized schedule
   - Review the weekly timetables
   - Enter a plan name and click "Save Plan"

## 📋 What Was Added

### New Database Models
- **ExamTimetable**: Stores exam schedules with subject-specific dates
- **StudyPlan**: Stores AI-generated weekly study plans

### New API Endpoints
- `GET/POST/PATCH/DELETE /api/study-planner/exam-timetable` - Manage exam timetables
- `POST /api/study-planner/generate` - Generate AI study plans
- `GET/POST/PATCH /api/study-planner/plans` - Manage study plans

### New Pages & Components
- `/dashboard/study-planner` - Main Study Planner page
- `WeeklyTimetable` component - Displays weekly schedules
- `ExamTimetableForm` component - Form for exam timetables

### Navigation
- Added "Study Planner" to sidebar (Calendar icon)

## 🎯 Features

✅ **AI-Powered Study Plans**
- Analyzes your quiz performance to identify weak subjects
- Prioritizes subjects with earlier exam dates
- Allocates more time to subjects you struggle with
- Creates balanced weekly schedules

✅ **Exam Timetable Management**
- Set exam dates and subject-specific schedules
- Track days until exams
- Multiple timetable support

✅ **Weekly Timetables**
- Daily study sessions with specific subjects
- Duration recommendations (45-90 minutes)
- Priority levels (high/medium/low)
- Specific topics to cover each day

## 🔧 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```powershell
npm run db:generate
```

### Issue: "Database schema is out of sync"
**Solution:**
```powershell
npm run db:push
```

### Issue: "Failed to generate study plan"
**Possible Causes:**
1. Missing `GEMINI_API_KEY` in `.env.local`
2. Invalid API key
3. API rate limit exceeded

**Solution:**
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is valid at https://aistudio.google.com/app/apikey
- The system will use a fallback plan if AI fails

### Issue: "Unauthorized" errors
**Solution:**
- Make sure you're logged in
- Check `NEXTAUTH_SECRET` is set in `.env.local`
- Restart the server after adding environment variables

### Issue: TypeScript errors
**Solution:**
```powershell
# Regenerate Prisma client
npm run db:generate

# Restart TypeScript server in your IDE
```

## 📊 How It Works

1. **Weak Subject Detection:**
   - Analyzes all quiz attempts
   - Calculates average scores per subject
   - Identifies subjects below 60% as "weak"

2. **Study Plan Generation:**
   - Uses Gemini AI to create personalized schedules
   - Considers:
     - Weak subjects (more time allocated)
     - Exam timetable (prioritizes earlier exams)
     - Days until exam (adjusts plan length)
     - Preferred subjects from user profile

3. **Fallback Plan:**
   - If AI generation fails, creates a simple balanced schedule
   - Distributes subjects evenly across study days
   - Ensures the feature always works

## 🎓 Usage Tips

1. **Set Exam Timetable First:**
   - This helps the AI prioritize subjects correctly
   - Shows countdown to exams

2. **Complete Quizzes:**
   - More quiz data = better weak subject detection
   - AI can create more targeted study plans

3. **Update Preferences:**
   - Go to Settings → Select preferred subjects
   - These are prioritized in study plans

4. **Save Multiple Plans:**
   - Generate plans for different time periods
   - Compare and choose the best one

## ✅ Verification Checklist

- [ ] Database schema updated (`npm run db:push`)
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] `GEMINI_API_KEY` set in `.env.local`
- [ ] Server restarted after changes
- [ ] Can access `/dashboard/study-planner`
- [ ] Can create exam timetable
- [ ] Can generate study plan
- [ ] Can save study plan

## 🚨 Important Notes

- **MongoDB**: This project uses MongoDB, so `db:push` is the correct command (not migrations)
- **PowerShell**: Commands are for PowerShell (Windows). For Mac/Linux, use standard bash commands
- **API Key**: Gemini API key is required for AI features. Without it, fallback plans will be used
- **Data Safety**: `db:push` only adds new collections, existing data is safe

## 📞 Need Help?

If you encounter issues:
1. Check server console for error messages
2. Verify all environment variables are set
3. Ensure database connection is working
4. Check Prisma client is generated correctly

---

**Ready to boost student retention! 🎯**

