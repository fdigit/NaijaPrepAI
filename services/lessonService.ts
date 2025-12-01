import { prisma } from '../lib/prisma';
import { LessonContent, SelectionState } from '../types';
import { ClassLevel, Term } from '@prisma/client';

/**
 * Save a generated lesson to the database
 */
// Map TypeScript Term enum to Prisma Term enum
const mapTermToPrisma = (term: string): Term => {
  if (term === 'First Term' || term === Term.FIRST) return Term.FIRST;
  if (term === 'Second Term' || term === Term.SECOND) return Term.SECOND;
  if (term === 'Third Term' || term === Term.THIRD) return Term.THIRD;
  // Default fallback
  return Term.FIRST;
};

// Map TypeScript ClassLevel enum to Prisma ClassLevel enum
const mapClassLevelToPrisma = (classLevel: string): ClassLevel => {
  const normalized = classLevel.replace(/\s+/g, '').toUpperCase();
  if (normalized === 'JSS1') return ClassLevel.JSS1;
  if (normalized === 'JSS2') return ClassLevel.JSS2;
  if (normalized === 'JSS3') return ClassLevel.JSS3;
  if (normalized === 'SSS1') return ClassLevel.SSS1;
  if (normalized === 'SSS2') return ClassLevel.SSS2;
  if (normalized === 'SSS3') return ClassLevel.SSS3;
  // Default fallback
  return ClassLevel.SSS1;
};

export const saveLesson = async (
  selection: SelectionState,
  content: LessonContent,
  userId?: string
) => {
  try {
    // Map the term and classLevel to Prisma enum values
    const prismaTerm = mapTermToPrisma(selection.term);
    const prismaClassLevel = mapClassLevelToPrisma(selection.classLevel);
    
    const lesson = await prisma.lesson.create({
      data: {
        classLevel: prismaClassLevel,
        subject: selection.subject,
        term: prismaTerm,
        week: selection.week,
        topic: selection.topic,
        topicTitle: content.topicTitle,
        introduction: content.introduction,
        mainContent: content.mainContent,
        summaryPoints: content.summaryPoints,
        practiceQuestions: content.practiceQuestions as any,
        theoryQuestion: content.theoryQuestion as any,
        ...(userId && { userId }),
      },
    });
    return lesson;
  } catch (error) {
    console.error('Error saving lesson:', error);
    throw error;
  }
};

/**
 * Get lessons by filters
 */
export const getLessons = async (
  filters: {
    classLevel?: ClassLevel;
    subject?: string;
    term?: Term;
    week?: number;
    userId?: string;
  },
  limit?: number
) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        ...(filters.classLevel && { classLevel: filters.classLevel }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.term && { term: filters.term }),
        ...(filters.week && { week: filters.week }),
        ...(filters.userId && { userId: filters.userId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: limit }),
    });
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

/**
 * Get a lesson by ID
 */
export const getLessonById = async (id: string) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });
    return lesson;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

/**
 * Delete a lesson by ID
 */
export const deleteLesson = async (id: string) => {
  try {
    await prisma.lesson.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

