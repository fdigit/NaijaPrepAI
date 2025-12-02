/**
 * Image Generation Service for Educational Content
 * Primary: Google Gemini Image Model (gemini-2.5-flash-image)
 * Fallback: Pexels API (when Gemini quota is exceeded)
 */

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI for image generation
// Match working code: prioritize API_KEY, fallback to GEMINI_API_KEY
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generate an educational image using Gemini Image Model
 * Uses dynamic prompt engineering based on subject type
 * 
 * @param topic - The lesson topic
 * @param subject - The subject name
 * @param classLevel - The class level
 * @returns Base64 data URL or undefined if generation fails
 */
async function generateWithGemini(
  topic: string,
  subject: string,
  classLevel: string
): Promise<string | undefined> {
  if (!ai) {
    return undefined; // No API key, skip to fallback
  }

  try {
    console.log("🔄 Attempting Gemini image generation...");
    console.log("   Topic:", topic);
    console.log("   Subject:", subject);
    console.log("   Class Level:", classLevel);
    console.log("   API Key present:", !!apiKey);
    
    // Build prompt matching working code structure
    // Use the exact prompt format from working code
    const imagePrompt = `Create a clear, educational diagram, chart, or illustration explaining "${topic}" for a ${subject} class (${classLevel}). 

The image should be suitable for a high school textbook. 

If it's a science topic, create a labeled diagram. 

If it's math, show a geometric figure or graph. 

If it's literature or history, create a relevant scene or timeline.

Use a clean, white background style.`;

    console.log("📤 Sending request to Gemini API...");
    console.log("   Model: gemini-2.5-flash-image");
    
    // Use working implementation structure: parts array and imageConfig
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: imagePrompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    console.log("📥 Received response from Gemini API");
    console.log("   Response structure:", {
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length || 0,
      hasContent: !!response.candidates?.[0]?.content,
      hasParts: !!response.candidates?.[0]?.content?.parts,
      partsLength: response.candidates?.[0]?.content?.parts?.length || 0
    });

    // Extract base64 image data from response (matching working code)
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      console.log("   Checking part:", Object.keys(part || {}));
      if (part.inlineData) {
        console.log("   ✅ Found inlineData!");
        console.log("   MIME type:", part.inlineData.mimeType);
        console.log("   Data length:", part.inlineData.data?.length || 0);
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    console.log("   ⚠️ No inlineData found in response parts");
    console.log("   Response sample:", JSON.stringify(response, null, 2).substring(0, 500));
    return undefined;
  } catch (error: any) {
    console.error("❌ Failed to generate image:");
    console.error("   Error type:", error?.constructor?.name);
    console.error("   Error message:", error?.message);
    console.error("   Error status:", error?.status || error?.statusCode);
    console.error("   Error code:", error?.code);
    if (error?.response) {
      console.error("   Error response:", JSON.stringify(error.response, null, 2).substring(0, 500));
    }
    console.error("   Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2).substring(0, 1000));
    return undefined; // Fail silently for images, we still want the text
  }
}

/**
 * Fetch image from Pexels (fallback when Gemini quota is exceeded)
 */
async function fetchFromPexels(topic: string, subject: string): Promise<string | undefined> {
  try {
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (!pexelsKey) {
      return undefined;
    }
    
    // Build search query
    const cleanTopic = topic.toLowerCase().trim();
    const cleanSubject = subject.toLowerCase().trim();
    const query = `${cleanTopic} ${cleanSubject} educational diagram`;
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': pexelsKey
        }
      }
    );

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src?.medium || data.photos[0].src?.large;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Generate an educational image for a lesson topic
 * Tries Gemini first, falls back to Pexels if quota exceeded
 * 
 * @param topic - The lesson topic
 * @param subject - The subject name
 * @param classLevel - The class level
 * @returns Base64 data URL (Gemini) or image URL (Pexels) or undefined
 */
export const generateLessonImage = async (
  topic: string,
  subject: string,
  classLevel: string
): Promise<string | undefined> => {
  // Try Gemini first
  const geminiImage = await generateWithGemini(topic, subject, classLevel);
  if (geminiImage) {
    return geminiImage;
  }
  
  // Fallback to Pexels if Gemini fails (quota or other errors)
  console.log("🔄 Falling back to Pexels (Gemini quota exceeded or unavailable)");
  return await fetchFromPexels(topic, subject);
};

