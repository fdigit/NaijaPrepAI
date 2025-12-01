# Exam Preparatory Feature - Analysis & Implementation Plan

## 📋 Current Codebase Analysis

### 1. **Notes Storage Structure**

The system stores "notes" as **Lessons** in the database. Each lesson contains:

```52:83:prisma/schema.prisma
model Lesson {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Selection State
  classLevel ClassLevel
  subject    String
  term       Term
  week       Int
  topic      String

  // Lesson Content
  topicTitle      String
  introduction    String
  mainContent     String   @db.String
  summaryPoints   String[]
  practiceQuestions Json
  theoryQuestion  Json

  // Ownership
  userId String? @db.ObjectId
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Relations
  quizAttempts  QuizAttempt[]
  studySessions StudySession[]

  @@index([classLevel, subject, term, week])
  @@index([userId])
  @@map("lessons")
}
```

**Key Points:**
- Lessons are linked to users via `userId`
- Each lesson has a `subject` field (string)
- Lessons contain `mainContent` (full notes), `summaryPoints`, and existing `practiceQuestions`
- Lessons are indexed by `classLevel`, `subject`, `term`, and `week` for efficient querying

### 2. **Subject Organization**

Subjects are defined in `constants.ts`:
- Available subjects: Mathematics, English, Physics, Chemistry, Biology, etc.
- Subjects are categorized (science, art, commercial, general)
- Users can have `preferredSubjects` in their profile

### 3. **AI Integration**

The system uses **Google Gemini AI** (`gemini-2.5-flash`) via `services/geminiService.ts`:
- Currently generates lesson content from curriculum inputs
- Uses structured JSON schema for responses
- Supports generating MCQs with explanations

### 4. **Current Quiz System**

- Quizzes are tied to individual lessons (`QuizAttempt` model)
- Each lesson has 5 practice questions (MCQs)
- Quiz attempts are tracked with scores and answers

---

## 🎯 Exam Preparatory Feature Requirements

### Feature Goals:
1. **Aggregate all notes by subject** - Collect all lessons for a specific subject
2. **Generate comprehensive CBT questions** - Use AI to create exam-style questions covering all topics
3. **Subject-based coverage** - Ensure questions cover everything from all notes for that subject
4. **Exam preparation focus** - Make students well-prepared for actual exams

---

## 🏗️ Proposed Architecture

### 1. **Database Schema Additions**

We need a new model to store generated exam questions:

```prisma
model ExamPrep {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Exam Information
  subject   String   // e.g., "Mathematics", "Physics"
  classLevel ClassLevel
  examName  String?  // Optional: "WAEC Prep", "BECE Prep", etc.
  
  // Source Lessons (which lessons were used to generate this exam)
  sourceLessonIds String[] @db.ObjectId // Array of lesson IDs
  
  // Generated Questions
  questions Json     // Array of CBT questions with structure:
                     // { question: string, options: string[], 
                     //   correctOptionIndex: number, explanation: string,
                     //   topicCovered: string, difficulty: 'easy'|'medium'|'hard' }
  
  // Metadata
  totalQuestions Int
  topicsCovered  String[] // List of topics from source lessons
  isActive       Boolean  @default(true)
  
  @@index([userId, subject])
  @@index([userId, classLevel])
  @@map("examPreps")
}
```

**Update User model:**
```prisma
model User {
  // ... existing fields ...
  examPreps ExamPrep[]  // Add this relation
}
```

### 2. **Service Layer**

Create `services/examPrepService.ts` with functions:

```typescript
// Get all lessons for a subject
export async function getLessonsBySubject(
  userId: string, 
  subject: string, 
  classLevel?: ClassLevel
): Promise<Lesson[]>

// Aggregate lesson content for AI processing
export function aggregateLessonContent(lessons: Lesson[]): {
  topics: string[];
  fullContent: string;
  summaryPoints: string[];
}

// Generate exam questions using AI
export async function generateExamQuestions(
  subject: string,
  classLevel: ClassLevel,
  aggregatedContent: AggregatedContent,
  questionCount?: number // Default: 50 questions
): Promise<ExamQuestion[]>

// Save generated exam
export async function saveExamPrep(
  userId: string,
  subject: string,
  classLevel: ClassLevel,
  questions: ExamQuestion[],
  sourceLessonIds: string[],
  examName?: string
): Promise<ExamPrep>
```

### 3. **AI Prompt Strategy**

The AI prompt should:
1. **Analyze all lesson content** - Process mainContent, summaryPoints from all lessons
2. **Identify key topics** - Extract all topics covered across lessons
3. **Generate comprehensive questions** - Create questions that:
   - Cover all major topics
   - Include easy, medium, and hard difficulty levels
   - Test understanding, not just memorization
   - Follow CBT format (4 options A-D)
   - Include detailed explanations
4. **Ensure coverage** - Verify all topics from notes are represented

**Example Prompt Structure:**
```
You are an expert Nigerian curriculum (NERDC) exam question generator.

Context:
- Subject: {subject}
- Class Level: {classLevel}
- Total Lessons Analyzed: {count}

Lesson Content Summary:
{aggregatedContent}

Requirements:
1. Generate {questionCount} comprehensive CBT (Computer-Based Test) questions
2. Questions must cover ALL topics from the provided lessons
3. Difficulty distribution: 30% easy, 50% medium, 20% hard
4. Each question should:
   - Test understanding, not just recall
   - Be relevant to Nigerian curriculum standards
   - Have 4 options (A, B, C, D)
   - Include detailed explanation
   - Reference which topic it covers
5. Ensure comprehensive coverage - every major topic should have at least one question
6. Questions should prepare students for actual WAEC/BECE exams

Format as JSON array of questions.
```

### 4. **API Endpoints**

Create `app/api/exam-prep/route.ts`:

```typescript
// POST /api/exam-prep/generate
// Body: { subject: string, classLevel?: ClassLevel, examName?: string, questionCount?: number }
// Returns: { examPrep: ExamPrep, questions: ExamQuestion[] }

// GET /api/exam-prep?userId=X&subject=Y
// Returns: List of exam preps for user/subject

// GET /api/exam-prep/[id]
// Returns: Specific exam prep with questions

// POST /api/exam-prep/[id]/attempt
// Body: { answers: Array<{questionIndex: number, selectedOption: number}> }
// Returns: { score: number, results: Array<{isCorrect: boolean, explanation: string}> }
```

### 5. **UI Components**

#### Dashboard Integration:
- Add "Exam Prep" to sidebar navigation (icon: FileText or ClipboardList)
- Route: `/dashboard/exam-prep`

#### New Pages:
1. **`/dashboard/exam-prep`** - Main exam prep page
   - Subject selector
   - List of existing exam preps
   - "Generate New Exam" button
   - Show stats: questions generated, topics covered, last generated date

2. **`/dashboard/exam-prep/generate`** - Generate exam page
   - Subject dropdown (pre-populate with user's preferred subjects)
   - Class level selector
   - Optional: Exam name input
   - Optional: Question count selector (default: 50)
   - "Generate Exam" button with loading state
   - Progress indicator showing: "Analyzing {X} lessons...", "Generating questions..."

3. **`/dashboard/exam-prep/[id]`** - Take exam page
   - Display questions one at a time or all at once (toggle)
   - Timer (optional)
   - Submit button
   - Results page showing:
     - Score percentage
     - Correct/incorrect breakdown
     - Explanations for each question
     - Topics performance breakdown

#### Components to Create:
- `components/exam-prep/SubjectSelector.tsx`
- `components/exam-prep/ExamPrepList.tsx`
- `components/exam-prep/ExamGenerator.tsx`
- `components/exam-prep/ExamViewer.tsx`
- `components/exam-prep/ExamResults.tsx`
- `components/exam-prep/QuestionCard.tsx`

---

## 📊 Data Flow

### Generation Flow:
```
1. User selects subject → 
2. System queries all lessons for that subject (userId + subject) →
3. Aggregates lesson content (mainContent, summaryPoints, topics) →
4. Sends to AI with comprehensive prompt →
5. AI generates questions covering all topics →
6. Save to ExamPrep model with sourceLessonIds →
7. Display to user for practice
```

### Taking Exam Flow:
```
1. User selects exam prep →
2. Load questions →
3. User answers questions →
4. Submit answers →
5. Calculate score →
6. Show results with explanations →
7. (Optional) Save attempt to track progress
```

---

## 🔧 Implementation Steps

### Phase 1: Database & Service Layer
1. ✅ Update Prisma schema with `ExamPrep` model
2. ✅ Run `npx prisma generate` and `npx prisma db push`
3. ✅ Create `services/examPrepService.ts`
4. ✅ Add AI generation function to `services/geminiService.ts` (or extend existing)

### Phase 2: API Endpoints
1. ✅ Create `/api/exam-prep/route.ts` (GET, POST)
2. ✅ Create `/api/exam-prep/[id]/route.ts` (GET specific exam)
3. ✅ Create `/api/exam-prep/[id]/attempt/route.ts` (POST attempt)

### Phase 3: UI Components
1. ✅ Add "Exam Prep" to sidebar navigation
2. ✅ Create `/dashboard/exam-prep/page.tsx`
3. ✅ Create `/dashboard/exam-prep/generate/page.tsx`
4. ✅ Create `/dashboard/exam-prep/[id]/page.tsx`
5. ✅ Build reusable components

### Phase 4: Testing & Refinement
1. ✅ Test with various subjects and lesson counts
2. ✅ Verify AI generates comprehensive questions
3. ✅ Test exam taking flow
4. ✅ Add error handling and loading states

---

## 🎨 UI/UX Considerations

### Design Consistency:
- Follow existing dashboard design patterns
- Use same color scheme (#00695C primary color)
- Match card/button styles from other pages

### User Experience:
- Show progress during generation (can take 30-60 seconds)
- Display lesson count before generation: "We found {X} lessons for {Subject}"
- Allow canceling generation
- Show estimated time remaining
- After generation, highlight topics covered
- Allow regenerating if user wants more/different questions

### Mobile Responsiveness:
- Ensure exam taking works well on mobile
- Consider question-by-question view for mobile
- Full list view for desktop

---

## 🔍 Key Technical Considerations

### 1. **Content Aggregation**
- When aggregating lessons, we need to handle:
  - Large content (multiple lessons = potentially 10,000+ words)
  - Token limits in AI API
  - Solution: Summarize intelligently or chunk content

### 2. **Question Quality**
- Ensure AI generates questions that:
  - Are not duplicates of existing practice questions
  - Test deeper understanding
  - Cover all topics proportionally
  - Are appropriate for the class level

### 3. **Performance**
- Generation can take time (30-60 seconds)
- Consider:
  - Background job processing
  - Progress updates via WebSocket or polling
  - Caching generated exams

### 4. **Storage**
- Exam questions stored as JSON in MongoDB
- Consider if questions get very large (100+ questions)
- May need pagination for display

---

## 📈 Future Enhancements

1. **Exam Attempt Tracking**
   - Store attempts similar to QuizAttempt
   - Track improvement over time
   - Show performance analytics per subject

2. **Adaptive Question Generation**
   - Analyze user's weak areas from quiz attempts
   - Generate more questions on weak topics

3. **Timed Exams**
   - Add timer functionality
   - Simulate real exam conditions

4. **Question Bank Management**
   - Allow users to regenerate specific topics
   - Save favorite questions
   - Export questions

5. **Collaborative Features**
   - Share exam preps with classmates
   - Community-generated question banks

---

## ✅ Success Metrics

- **Adoption**: % of users who generate at least one exam prep
- **Coverage**: Average topics covered per exam
- **Quality**: User satisfaction with question relevance
- **Engagement**: Average exam attempts per user
- **Performance**: Average score improvement over time

---

## 🚀 Next Steps

1. Review and approve this architecture
2. Start with Phase 1 (Database & Service Layer)
3. Test AI generation with sample lesson data
4. Iterate on prompt engineering for best question quality
5. Build UI components
6. Test end-to-end flow
7. Deploy and gather user feedback

