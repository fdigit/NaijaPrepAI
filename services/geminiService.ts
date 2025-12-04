import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, SelectionState, ExamQuestion } from "../types";
import { AggregatedContent } from "./examPrepService";
import { ClassLevel } from "@prisma/client";
import { generateLessonImage } from "./imageService";

// Validate API key on module load
// Match working code: prioritize API_KEY, fallback to GEMINI_API_KEY
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('⚠️ API_KEY or GEMINI_API_KEY is not set in environment variables');
  console.error('Please add API_KEY or GEMINI_API_KEY to your .env.local file');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateLessonPlan = async (selection: SelectionState): Promise<LessonContent> => {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file and restart the server.');
  }

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
       **IMPORTANT**: Use LaTeX for ALL mathematical equations, formulas, and symbols.
       - Wrap inline math in single dollar signs, e.g., $E=mc^2$ or $x^2 + y^2 = r^2$.
       - Wrap block math in double dollar signs, e.g., $$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$.
    2. **Summary**: 3-5 concise bullet points for revision. Use LaTeX for any mathematical expressions.
    3. **Practice Questions**: 5 Multiple Choice Questions (MCQs) with 4 options (A-D) and one correct answer with explanation. Use LaTeX for any mathematical expressions in questions, options, and explanations.
    4. **Theory Question**: 1 structured theory question with a detailed model answer. Use LaTeX for any mathematical expressions.

    Format the response as a structured JSON object.
  `;

  try {
    // Run text generation and image fetching in parallel for better performance
    const [textResponseResult, imageResult] = await Promise.allSettled([
      ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicTitle: { type: Type.STRING, description: "The formal title of the lesson" },
              introduction: { type: Type.STRING, description: "A brief introductory paragraph" },
              mainContent: { type: Type.STRING, description: "Full lesson notes in Markdown format with LaTeX math" },
              summaryPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of key takeaways (use LaTeX for math)"
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "Question text (use LaTeX for math)" },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING, description: "Option text (use LaTeX for math)" },
                      description: "Array of 4 options"
                    },
                    correctOptionIndex: { type: Type.INTEGER, description: "0-3 index of correct option" },
                    explanation: { type: Type.STRING, description: "Why this answer is correct (use LaTeX for math)" }
                  },
                  required: ["question", "options", "correctOptionIndex", "explanation"]
                },
                description: "5 MCQs"
              },
              theoryQuestion: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Theory question text (use LaTeX for math)" },
                  answer: { type: Type.STRING, description: "Detailed model answer with LaTeX math" }
                },
                required: ["question", "answer"]
              }
            },
            required: ["topicTitle", "introduction", "mainContent", "summaryPoints", "practiceQuestions", "theoryQuestion"]
          }
        }
      }),
      generateLessonImage(selection.topic, selection.subject, selection.classLevel)
    ]);

    // Handle text response (required)
    if (textResponseResult.status === 'rejected') {
      throw textResponseResult.reason;
    }

    const textResponse = textResponseResult.value;
    let content: LessonContent;

    if (textResponse.text) {
      content = JSON.parse(textResponse.text) as LessonContent;
    } else {
      throw new Error("No content generated");
    }

    // Handle image response (optional - attach if successful)
    if (imageResult.status === 'fulfilled' && imageResult.value) {
      content.generatedImage = imageResult.value;
    }
    // If image generation fails, we continue without it (graceful degradation)

    return content;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      code: error?.code,
      response: error?.response?.data || error?.response,
    });
    
    // Provide more helpful error messages
    if (error?.message?.includes('API key') || error?.status === 401 || error?.status === 403 || error?.statusCode === 401 || error?.statusCode === 403) {
      throw new Error('Invalid or expired API key. The key may have been revoked after the security incident. Please create a new API key at https://aistudio.google.com/app/apikey and update .env.local');
    } else if (error?.message?.includes('quota') || error?.status === 429 || error?.statusCode === 429) {
      throw new Error('API quota exceeded. Please check your Google AI Studio account limits.');
    } else if (error?.message) {
      throw new Error(`AI service error: ${error.message}`);
    }
    
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
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file and restart the server.');
  }

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
   - Use LaTeX for ALL mathematical equations, formulas, and symbols:
     * Inline math: $equation$ (single dollar signs)
     * Block math: $$equation$$ (double dollar signs)
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
                description: "The question text (use LaTeX for math)"
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING, description: "Option text (use LaTeX for math)" },
                description: "Array of exactly 4 options (A, B, C, D)"
              },
              correctOptionIndex: {
                type: Type.INTEGER,
                description: "Index of correct option (0-3)"
              },
              explanation: {
                type: Type.STRING,
                description: "Detailed explanation of why this answer is correct (use LaTeX for math)"
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
  } catch (error: any) {
    console.error("Gemini API Error (Exam Questions):", error);
    
    // Provide more helpful error messages
    if (error?.message?.includes('API key') || error?.status === 401 || error?.status === 403) {
      throw new Error('Invalid or expired API key. Please check your GEMINI_API_KEY in .env.local and ensure it is valid.');
    } else if (error?.message?.includes('quota') || error?.status === 429) {
      throw new Error('API quota exceeded. Please check your Google AI Studio account limits.');
    } else if (error?.message) {
      throw new Error(`AI service error: ${error.message}`);
    }
    
    throw error;
  }
};