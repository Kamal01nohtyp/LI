import { GoogleGenAI } from "@google/genai";
import { Language } from "./translations";

const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || "";
// Only init AI if key is present to prevent crashes on client-side load before config
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeIssue = async (title: string, description: string, lang: Language): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return lang === 'ru' ? "Требуется настройка ключа API." : "API Key configuration required.";
  }

  try {
    const prompt = `
      You are a logistics and supply chain expert assistant.
      Analyze the following issue briefly and suggest a 1-sentence immediate action plan.
      
      IMPORTANT: Answer in ${lang === 'ru' ? 'RUSSIAN' : 'ENGLISH'} language.
      Keep it professional and concise.
      
      Issue Title: ${title}
      Issue Description: ${description}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || (lang === 'ru' ? "Нет анализа." : "No analysis available.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'ru' ? "Сервис AI временно недоступен." : "AI Service unavailable at the moment.";
  }
};