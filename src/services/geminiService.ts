import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getBookContent(title: string, author: string, language: string) {
  const prompt = `Provide a detailed summary and key insights of the book "${title}" by ${author} in ${language} language. 
  Format the response in Markdown. Include chapters or key sections if possible. 
  Make it engaging for a reader who wants to learn from this book.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Error fetching book content:", error);
    return "Failed to load book content. Please try again later.";
  }
}

