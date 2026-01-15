
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

export async function extractRecipeFromUrl(url: string): Promise<Recipe | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract detailed recipe information from this social media URL (TikTok/YouTube/Instagram): ${url}. 
      If you cannot access the content directly, use your knowledge and search capabilities to find the most likely recipe associated with this video or post. 
      Be very thorough with ingredients and steps.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the dish" },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of ingredients with quantities"
            },
            steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Detailed step-by-step instructions"
            },
            cookTime: { type: Type.STRING, description: "Estimated cooking or prep time" },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Pro tips or secrets from the author"
            },
            category: { type: Type.STRING, description: "Category like Dessert, Dinner, Snack, etc." }
          },
          required: ["name", "ingredients", "steps", "cookTime"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      ...data,
      id: crypto.randomUUID(),
      sourceUrl: url,
      createdAt: Date.now(),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`
    };
  } catch (error) {
    console.error("Error extracting recipe:", error);
    return null;
  }
}
