import { GoogleGenAI } from "@google/genai";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIssue = async (title: string, description: string, lang: Language): Promise<string> => {
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