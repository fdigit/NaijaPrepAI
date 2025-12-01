import { prisma } from '../lib/prisma';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

export interface SubjectPerformance {
  subject: string;
  score: number;
  isWeak: boolean;
}

export interface ExamSubject {
  subject: string;
  date: string;
  time?: string;
}

export interface StudySession {
  date: string;
  subjects: {
    subject: string;
    duration: number; // minutes
    topics: string[];
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface WeeklyTimetable {
  week: number;
  startDate: string;
  endDate: string;
  sessions: StudySession[];
}

/**
 * Get user's weak subjects from quiz performance
 */
export const getWeakSubjects = async (userId: string): Promise<SubjectPerformance[]> => {
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      lesson: {
        select: {
          subject: true,
        },
      },
    },
  });

  if (quizAttempts.length === 0) {
    return [];
  }

  // Group by subject and calculate averages
  const subjectScores: Record<string, { total: number; count: number }> = {};

  quizAttempts.forEach((attempt) => {
    const subject = attempt.lesson?.subject || 'Unknown';
    if (!subjectScores[subject]) {
      subjectScores[subject] = { total: 0, count: 0 };
    }
    subjectScores[subject].total += attempt.score;
    subjectScores[subject].count += 1;
  });

  // Calculate average per subject
  const subjectAverages = Object.entries(subjectScores).map(([subject, data]) => ({
    subject,
    score: Math.round((data.total / data.count) * 100) / 100,
    isWeak: (data.total / data.count) < 60, // Below 60% is considered weak
  }));

  return subjectAverages.sort((a, b) => a.score - b.score);
};

/**
 * Generate AI-powered study plan based on weak subjects, exam timetable, and days remaining
 */
export const generateStudyPlan = async (
  userId: string,
  examTimetableId?: string,
  daysUntilExam?: number
): Promise<WeeklyTimetable[]> => {
  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      classLevel: true,
      preferredSubjects: true,
    },
  });

  // Get weak subjects
  const weakSubjects = await getWeakSubjects(userId);

  // Get exam timetable if provided
  let examTimetable = null;
  if (examTimetableId) {
    examTimetable = await prisma.examTimetable.findUnique({
      where: { id: examTimetableId },
    });
  } else {
    // Get active exam timetable
    examTimetable = await prisma.examTimetable.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        examDate: 'asc',
      },
    });
  }

  // Calculate days until exam
  let daysLeft = daysUntilExam;
  if (!daysLeft && examTimetable) {
    const now = new Date();
    const examDate = new Date(examTimetable.examDate);
    daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // If no exam date, default to 30 days
  if (!daysLeft || daysLeft < 0) {
    daysLeft = 30;
  }

  // Get subjects to focus on
  const subjectsToFocus = user?.preferredSubjects || [];
  const weakSubjectNames = weakSubjects.filter(s => s.isWeak).map(s => s.subject);
  
  // Combine preferred and weak subjects
  const allSubjects = Array.from(new Set([...subjectsToFocus, ...weakSubjectNames]));

  // Get exam subjects if available
  let examSubjects: ExamSubject[] = [];
  if (examTimetable && examTimetable.subjectExams) {
    examSubjects = (examTimetable.subjectExams as any) || [];
  }

  // Generate study plan using AI
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Create a comprehensive weekly study timetable for a Nigerian secondary school student.
    
    Context:
    - Class Level: ${user?.classLevel || 'Not specified'}
    - Days until exam: ${daysLeft} days
    - Subjects to focus on: ${allSubjects.join(', ')}
    - Weak subjects (need more attention): ${weakSubjectNames.join(', ') || 'None identified yet'}
    ${examSubjects.length > 0 ? `- Exam schedule: ${JSON.stringify(examSubjects)}` : ''}
    
    Requirements:
    1. Generate a ${Math.ceil(daysLeft / 7)}-week study plan
    2. Each week should have 5-7 study days (Monday-Sunday)
    3. Allocate more time to weak subjects
    4. If exam timetable is provided, prioritize subjects with earlier exam dates
    5. Each day should have 2-4 study sessions of 45-90 minutes each
    6. Include breaks between sessions
    7. Balance subjects throughout the week
    8. Focus on revision and practice for subjects with exams approaching
    
    Format the response as a JSON array of weekly timetables.
    Each week should have:
    - week: number
    - startDate: string (ISO date)
    - endDate: string (ISO date)
    - sessions: array of daily sessions with:
      - date: string (ISO date)
      - subjects: array of study sessions with:
        - subject: string
        - duration: number (minutes, 45-90)
        - topics: array of specific topics to cover
        - priority: "high" | "medium" | "low"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              week: { type: Type.INTEGER },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    subjects: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          subject: { type: Type.STRING },
                          duration: { type: Type.INTEGER },
                          topics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          priority: {
                            type: Type.STRING,
                            enum: ["high", "medium", "low"],
                          },
                        },
                        required: ["subject", "duration", "topics", "priority"],
                      },
                    },
                  },
                  required: ["date", "subjects"],
                },
              },
            },
            required: ["week", "startDate", "endDate", "sessions"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as WeeklyTimetable[];
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Study Plan Generation Error:", error);
    // Fallback to a simple generated plan
    return generateFallbackPlan(allSubjects, daysLeft);
  }
};

/**
 * Generate a simple fallback plan if AI fails
 */
function generateFallbackPlan(subjects: string[], daysLeft: number): WeeklyTimetable[] {
  const weeks = Math.ceil(daysLeft / 7);
  const timetables: WeeklyTimetable[] = [];
  const today = new Date();

  for (let week = 1; week <= weeks; week++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const sessions: StudySession[] = [];
    
    // Generate 5 study days per week (Monday-Friday)
    for (let day = 0; day < 5; day++) {
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(weekStart.getDate() + day);
      
      // Assign 2-3 subjects per day
      const subjectsPerDay = Math.min(3, Math.ceil(subjects.length / 5));
      const daySubjects = subjects.slice(
        (day * subjectsPerDay) % subjects.length,
        ((day * subjectsPerDay) % subjects.length) + subjectsPerDay
      );

      sessions.push({
        date: sessionDate.toISOString(),
        subjects: daySubjects.map((subject, idx) => ({
          subject,
          duration: idx === 0 ? 90 : 60, // First subject gets more time
          topics: [`Review ${subject} topics`, `Practice questions`],
          priority: idx === 0 ? 'high' : 'medium' as const,
        })),
      });
    }

    timetables.push({
      week,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      sessions,
    });
  }

  return timetables;
}

/**
 * Save study plan to database
 */
export const saveStudyPlan = async (
  userId: string,
  planName: string,
  timetables: WeeklyTimetable[],
  examTimetableId?: string
) => {
  try {
    // Combine all sessions from all weeks
    const allSessions = timetables.flatMap(t => t.sessions);
    const startDate = new Date(timetables[0]?.startDate || new Date());
    const endDate = new Date(timetables[timetables.length - 1]?.endDate || new Date());

    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        examTimetableId: examTimetableId || null,
        planName,
        startDate,
        endDate,
        schedule: allSessions as any,
        isActive: true,
        completed: false,
      },
    });

    return studyPlan;
  } catch (error) {
    console.error('Error saving study plan:', error);
    throw error;
  }
};

/**
 * Get user's active study plan
 */
export const getActiveStudyPlan = async (userId: string) => {
  return await prisma.studyPlan.findFirst({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get all study plans for a user
 */
export const getUserStudyPlans = async (userId: string) => {
  return await prisma.studyPlan.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

