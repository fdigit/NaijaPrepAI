import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, SelectionState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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