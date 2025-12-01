# Dashboard Architecture & Feature Integration

## 🎯 Core Principles

1. **Logged-in users should generate lessons from the dashboard** (not homepage)
2. **Sidebar navigation** for better organization and mobile UX
3. **Subject preferences** drive personalization across the app
4. **Seamless flow** between generation → viewing → analytics

---

## 📐 Dashboard Structure

### Navigation Layout
```
┌─────────────────────────────────────────────────┐
│  Header: Logo | User Info | Sign Out            │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Main Content Area                   │
│          │                                      │
│ • Home   │  [Dynamic content based on route]    │
│ • Generate│                                      │
│ • Lessons│                                      │
│ • Analytics│                                    │
│ • Settings│                                     │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Sidebar Navigation Items

1. **🏠 Home (Dashboard Overview)**
   - Route: `/dashboard`
   - Content: Welcome card, stats, weekly progress, recent lessons, performance analytics
   - Quick actions: "Generate New Lesson" button

2. **✨ Generate Lesson**
   - Route: `/dashboard/generate`
   - Content: Curriculum form (pre-populated with user preferences)
   - Features:
     - Pre-fill class level from user profile
     - Pre-select preferred subjects (if set)
     - Show "Save subjects" prompt if none selected
     - After generation → save → redirect to `/lessons/[id]`

3. **📚 My Lessons**
   - Route: `/dashboard/lessons`
   - Content: Filterable lesson library
   - Features:
     - Filter by class, subject, term, week
     - Search by topic
     - Sort by date, subject, class
     - Quick actions: View, Delete

4. **📊 Analytics**
   - Route: `/dashboard/analytics`
   - Content: Detailed performance charts
   - Features:
     - Performance over time (line chart)
     - Subject breakdown (pie/bar chart)
     - Quiz history table
     - Study streak calendar
     - Strengths & weaknesses analysis

5. **⚙️ Settings**
   - Route: `/dashboard/settings`
   - Content: User profile & preferences
   - Features:
     - **Subject Selection** (multi-select)
       - Show all available subjects
       - Allow selecting multiple
       - Save to `User.preferredSubjects`
       - Used to pre-fill generation form
     - Class Level selection
     - Profile info (name, email)
     - Account management

---

## 🔄 User Flows

### Flow 1: New User Onboarding
```
1. User registers → Dashboard
2. Dashboard shows "Complete your profile" prompt
3. User clicks → Settings page
4. User selects:
   - Class Level (JSS1, JSS2, etc.)
   - Preferred Subjects (multiple)
5. Save → Redirect to Dashboard
6. Dashboard now personalized
```

### Flow 2: Generate Lesson (Logged-in User)
```
1. User on Dashboard → Clicks "Generate Lesson" (sidebar or quick action)
2. Navigate to /dashboard/generate
3. Form pre-populated:
   - Class Level: From user profile
   - Subject: First preferred subject (or empty if none)
   - Term: FIRST (default)
   - Week: 1 (default)
   - Topic: Empty (user enters)
4. User fills topic → Clicks "Generate"
5. AI generates lesson
6. Lesson automatically saved to database (linked to userId)
7. Redirect to /lessons/[id] to view lesson
8. User can take quiz, view content
```

### Flow 3: Subject Preferences Integration
```
Settings Page:
- Multi-select subject picker
- Visual: Checkboxes or chips
- Save button
- Success message on save

Used In:
1. Generate Lesson Form:
   - Pre-select first preferred subject
   - Show all preferred subjects at top of dropdown
   - Highlight preferred subjects

2. My Lessons Page:
   - Filter defaults to preferred subjects
   - Quick filter buttons for preferred subjects

3. Dashboard:
   - Show "Continue with [Preferred Subject]" quick action
   - Recent lessons prioritize preferred subjects

4. Analytics:
   - Default view shows preferred subjects
   - Compare performance across preferred subjects
```

### Flow 4: Homepage for Non-logged-in Users
```
Homepage (/):
- Landing page with marketing content
- Lesson generation form (for demo/trial)
- If user generates while not logged in:
  - Show lesson in preview mode
  - Prompt: "Sign up to save this lesson"
  - After signup → lesson saved automatically (if possible)
- If logged-in user visits homepage:
  - Show banner: "Welcome back! Go to Dashboard"
  - Or auto-redirect to /dashboard
```

---

## 🎨 UI/UX Considerations

### Sidebar Design
- **Desktop**: Fixed left sidebar (240px width)
- **Mobile**: Collapsible drawer (overlay)
- **Active state**: Highlight current page
- **Icons**: Lucide React icons (consistent with current design)

### Generate Lesson Page
- **Layout**: Centered form (max-width: 800px)
- **Pre-population**: 
  - Show user's class level (editable)
  - Subject dropdown with preferred subjects highlighted
  - Helper text: "Select from your preferred subjects or choose another"
- **Quick Actions**:
  - "Save current selection as preferences" checkbox
  - "Go to Settings" link if no preferences set

### Settings Page Sections
1. **Profile Information**
   - Name, Email (read-only, from auth)
   - Class Level selector
   
2. **Study Preferences**
   - Subject Selection (multi-select)
   - Visual: Grid of subject cards/chips
   - "Select All" / "Clear All" buttons
   - Save button with loading state

3. **Account**
   - Change password (if credentials auth)
   - Delete account (with confirmation)

---

## 🔧 Technical Implementation

### Database Schema (Already exists)
```prisma
model User {
  classLevel    ClassLevel?
  preferredSubjects String[]  // Already in schema ✅
}
```

### API Endpoints Needed

1. **GET /api/user/profile**
   - Returns: user profile including preferredSubjects, classLevel

2. **PATCH /api/user/profile**
   - Body: { classLevel?, preferredSubjects? }
   - Updates user preferences

3. **GET /api/lessons?userId=X&subject=Y**
   - Filter lessons by user and subject (already exists ✅)

### Components to Create/Modify

1. **New Components:**
   - `components/dashboard/Sidebar.tsx` - Sidebar navigation
   - `components/settings/SubjectSelector.tsx` - Multi-select subject picker
   - `components/dashboard/GenerateLessonForm.tsx` - Enhanced curriculum form

2. **Modify Existing:**
   - `components/dashboard/DashboardLayout.tsx` - Add sidebar, remove header nav
   - `components/CurriculumForm.tsx` - Add pre-population logic
   - `app/page.tsx` - Add logged-in user detection/redirect

3. **New Pages:**
   - `app/dashboard/generate/page.tsx` - Generate lesson page
   - `app/dashboard/settings/page.tsx` - Settings page
   - `app/dashboard/analytics/page.tsx` - Analytics page (if not exists)

---

## 📋 Implementation Priority

### Phase 1: Core Structure (High Priority)
1. ✅ Convert DashboardLayout to sidebar navigation
2. ✅ Create `/dashboard/generate` page
3. ✅ Move lesson generation logic to dashboard
4. ✅ Update homepage to redirect logged-in users

### Phase 2: Subject Preferences (High Priority)
1. ✅ Create Settings page
2. ✅ Create SubjectSelector component
3. ✅ Create API endpoint for updating preferences
4. ✅ Pre-populate generation form with preferences

### Phase 3: Enhancements (Medium Priority)
1. ✅ Analytics page with detailed charts
2. ✅ Quiz attempt tracking
3. ✅ Study session tracking
4. ✅ Quick actions on dashboard

---

## 🎯 Success Metrics

- **User Engagement**: % of users who set preferences
- **Lesson Generation**: % of lessons generated from dashboard vs homepage
- **Subject Focus**: Average lessons per preferred subject
- **Retention**: Users who generate 3+ lessons

---

## 💡 Future Enhancements

1. **Smart Recommendations**
   - Suggest topics based on curriculum progress
   - "You haven't studied [Subject] in 2 weeks"

2. **Study Plans**
   - Auto-generate weekly study plan based on preferences
   - Track completion

3. **Subject Groups**
   - Group subjects (Science, Arts, Commercial)
   - Quick filter by group

4. **Progress Tracking per Subject**
   - Show completion % per subject
   - Visual progress bars

