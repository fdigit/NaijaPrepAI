import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, SelectionState, ExamQuestion } from "../types";
import { AggregatedContent } from "./examPrepService";
import { ClassLevel } from "@prisma/client";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

export const generateLessonPlan = async (selection: SelectionState): Promise<LessonContent> => {
  const modelId = "gemini-2.5-flash"; // Using Flash for speed and efficiency with large text generation

  const prompt = `
    Create a comprehensive Nigerian curriculum (NERDC) aligned lesson plan.
    
    Context:
    - Class: ${selection.classLevel}
    - Subject: ${selection.subject}
    - Term: ${selection.term}
    - Week: ${selection.week}
    - Specific Topic: ${selection.topic}

    Requirements:
    1. **Lesson Notes**: Detailed, academic tone, approx 800-1000 words. Use Markdown for formatting (headers, bold, lists). Include definitions, formulas (if applicable), and examples relevant to the Nigerian context.
    2. **Summary**: 3-5 concise bullet points for revision.
    3. **Practice Questions**: 5 Multiple Choice Questions (MCQs) with 4 options (A-D) and one correct answer with explanation.
    4. **Theory Question**: 1 structured theory question with a detailed model answer.

    Format the response as a structured JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicTitle: { type: Type.STRING, description: "The formal title of the lesson" },
            introduction: { type: Type.STRING, description: "A brief introductory paragraph" },
            mainContent: { type: Type.STRING, description: "Full lesson notes in Markdown format" },
            summaryPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key takeaways"
            },
            practiceQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of 4 options"
                  },
                  correctOptionIndex: { type: Type.INTEGER, description: "0-3 index of correct option" },
                  explanation: { type: Type.STRING, description: "Why this answer is correct" }
                },
                required: ["question", "options", "correctOptionIndex", "explanation"]
              },
              description: "5 MCQs"
            },
            theoryQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING, description: "Detailed model answer" }
              },
              required: ["question", "answer"]
            }
          },
          required: ["topicTitle", "introduction", "mainContent", "summaryPoints", "practiceQuestions", "theoryQuestion"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as LessonContent;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generate comprehensive exam questions from aggregated lesson content
 */
export const generateExamQuestions = async (
  subject: string,
  classLevel: ClassLevel,
  aggregatedContent: AggregatedContent,
  questionCount: number = 50
): Promise<ExamQuestion[]> => {
  const modelId = "gemini-2.5-flash";

  // Build content summary for prompt
  const contentSummary = aggregatedContent.fullContent.length > 10000
    ? aggregatedContent.fullContent.substring(0, 10000) + "\n\n[Content truncated for length...]"
    : aggregatedContent.fullContent;

  const prompt = `
You are an expert Nigerian curriculum (NERDC) exam question generator specializing in Computer-Based Test (CBT) format questions.

Context:
- Subject: ${subject}
- Class Level: ${classLevel}
- Total Lessons Analyzed: ${aggregatedContent.lessonCount}
- Topics Covered: ${aggregatedContent.topics.join(", ")}

Lesson Content Summary:
${contentSummary}

Key Summary Points:
${aggregatedContent.summaryPoints.slice(0, 20).join("\n- ")}

Requirements:
1. Generate ${questionCount} comprehensive CBT (Computer-Based Test) questions
2. Questions MUST cover ALL topics from the provided lessons: ${aggregatedContent.topics.join(", ")}
3. Difficulty distribution:
   - 30% easy questions (basic recall and understanding)
   - 50% medium questions (application and analysis)
   - 20% hard questions (synthesis and evaluation)
4. Each question should:
   - Test understanding, not just memorization
   - Be relevant to Nigerian curriculum standards (NERDC)
   - Have exactly 4 options (A, B, C, D)
   - Include a detailed explanation of why the correct answer is right
   - Reference which topic it covers
   - Be appropriate for ${classLevel} level
5. Ensure comprehensive coverage - every major topic should have at least one question
6. Questions should prepare students for actual WAEC/BECE exams
7. Avoid duplicate questions or questions too similar to each other
8. Make questions practical and applicable to real-world scenarios where possible

Format the response as a JSON array of questions.
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
              question: {
                type: Type.STRING,
                description: "The question text"
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 4 options (A, B, C, D)"
              },
              correctOptionIndex: {
                type: Type.INTEGER,
                description: "Index of correct option (0-3)"
              },
              explanation: {
                type: Type.STRING,
                description: "Detailed explanation of why this answer is correct"
              },
              topicCovered: {
                type: Type.STRING,
                description: "Which topic from the lessons this question covers"
              },
              difficulty: {
                type: Type.STRING,
                enum: ["easy", "medium", "hard"],
                description: "Difficulty level of the question"
              }
            },
            required: ["question", "options", "correctOptionIndex", "explanation", "topicCovered", "difficulty"]
          }
        }
      }
    });

    if (response.text) {
      const questions = JSON.parse(response.text) as ExamQuestion[];
      
      // Validate questions
      if (!Array.isArray(questions)) {
        throw new Error("AI response is not an array");
      }

      // Validate each question has 4 options
      const invalidQuestions = questions.filter(
        q => !q.options || q.options.length !== 4
      );
      
      if (invalidQuestions.length > 0) {
        console.warn(`Warning: ${invalidQuestions.length} questions have invalid option count`);
      }

      return questions;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini API Error (Exam Questions):", error);
    throw error;
  }
};