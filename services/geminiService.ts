
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types.ts";

export async function extractRecipeFromUrl(url: string): Promise<Recipe | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extrae la receta completa de este link: ${url}. 
      Proporciona el nombre, ingredientes con cantidades, pasos claros, tiempo total y trucos extra. 
      Si el video no tiene toda la info, usa Google Search para completarla de fuentes fiables.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            cookTime: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING }
          },
          required: ["name", "ingredients", "steps", "cookTime"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    // Extraer URLs de las fuentes encontradas por Google Search
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri,
      title: chunk.web?.title
    })).filter((s: any) => s.uri) || [];
    
    const data = JSON.parse(text);
    return {
      ...data,
      id: crypto.randomUUID(),
      sourceUrl: url,
      createdAt: Date.now(),
      imageUrl: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`,
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
