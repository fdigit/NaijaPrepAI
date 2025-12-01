export enum ClassLevel {
  JSS1 = "JSS 1",
  JSS2 = "JSS 2",
  JSS3 = "JSS 3",
  SSS1 = "SSS 1",
  SSS2 = "SSS 2",
  SSS3 = "SSS 3",
}

export enum Term {
  FIRST = "First Term",
  SECOND = "Second Term",
  THIRD = "Third Term",
}

export interface SelectionState {
  classLevel: ClassLevel;
  subject: string;
  term: Term;
  week: number;
  topic: string; // User can type a specific topic or let AI infer from curriculum standard
}

export interface MCQ {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface TheoryQuestion {
  question: string;
  answer: string;
}

export interface LessonContent {
  topicTitle: string;
  introduction: string;
  mainContent: string; // Markdown supported
  summaryPoints: string[];
  practiceQuestions: MCQ[];
  theoryQuestion: TheoryQuestion;
}

export type SubjectOption = {
  id: string;
  name: string;
  categories: ('science' | 'art' | 'commercial' | 'general')[];
};

export interface ExamQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  topicCovered: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamPrepData {
  subject: string;
  classLevel: ClassLevel;
  examName?: string;
  questionCount?: number;
}