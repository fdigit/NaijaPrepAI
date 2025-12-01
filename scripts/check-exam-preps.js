// Script to check exam preps in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExamPreps() {
  try {
    console.log('Checking all exam preps in database...\n');
    
    // Get all exam preps (no filters)
    const allExamPreps = await prisma.examPrep.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Total exam preps found: ${allExamPreps.length}\n`);

    if (allExamPreps.length > 0) {
      console.log('Exam Preps:');
      allExamPreps.forEach((exam, index) => {
        console.log(`\n${index + 1}. ID: ${exam.id}`);
        console.log(`   Subject: ${exam.subject}`);
        console.log(`   Class Level: ${exam.classLevel}`);
        console.log(`   Exam Name: ${exam.examName || 'N/A'}`);
        console.log(`   Total Questions: ${exam.totalQuestions}`);
        console.log(`   Topics Covered: ${exam.topicsCovered.length}`);
        console.log(`   Is Active: ${exam.isActive}`);
        console.log(`   User ID: ${exam.userId}`);
        console.log(`   Created At: ${exam.createdAt}`);
      });
    } else {
      console.log('No exam preps found in database.');
    }

    // Check by specific user if provided
    const userId = process.argv[2];
    if (userId) {
      console.log(`\n\nChecking exam preps for user: ${userId}\n`);
      const userExamPreps = await prisma.examPrep.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      console.log(`Found ${userExamPreps.length} exam preps for this user.`);
    }
  } catch (error) {
    console.error('Error checking exam preps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExamPreps();

