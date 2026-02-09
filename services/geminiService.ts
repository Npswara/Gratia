
import { GoogleGenAI, Type } from "@google/genai";
import { MoodEntry, UserRole, Language } from "../types";

const safeJsonParse = (text: string) => {
  try {
    // Remove markdown code blocks if present (often returned by Gemini)
    const cleanText = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw text:", text);
    return null;
  }
};

export const generateMealMenu = async (query: string, isPostPregnant: boolean, lang: Language = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a healthy and nutritious recipe for a mother who is ${isPostPregnant ? 'postpartum' : 'pregnant'}.
  The user request is: "${query}". 
  If the request is a CATEGORY (like "Healthy" or "Indonesian"), provide a signature dish from that category.
  If the request is a SPECIFIC RECIPE TITLE (like "Salmon Avocado Toast"), provide that exact recipe.
  
  Provide a full recipe including a short title, ingredients, and instructions. Also explain the nutritional benefits for the mother. 
  IMPORTANT: Response MUST be a valid JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefits: { type: Type.STRING }
          },
          required: ['title', 'ingredients', 'instructions', 'benefits']
        }
      }
    });
    return safeJsonParse(response.text);
  } catch (error: any) {
    console.error("Meal Generation Error:", error);
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.status === 429) {
        return { error: "QUOTA_EXCEEDED" };
    }
    return null;
  }
};

export const generateMealImage = async (mealTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A delicious, high-quality, professional food photography shot of ${mealTitle}. Served in a beautiful plate, bright lighting, healthy and fresh ingredients visible, soft background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Meal Image Generation Error:", error);
    return null;
  }
};

export const generateFatherTips = async (wifeMood: string, isPost: boolean, isPeriod: boolean, lang: Language = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `My wife is ${isPost ? 'postpartum' : 'pregnant'} ${isPeriod ? 'and she is currently on her menstrual period' : ''}. Her mood today is ${wifeMood}. 
  As her husband, provide 3 very specific, actionable, and loving "serving" tips on how I can physically and emotionally support/serve her today. 
  Focus on acts of service, comfort, and extra patience. 
  IMPORTANT: Respond strictly in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Tips Generation Error:", error);
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.status === 429) {
      return "Gratia AI is taking a short rest. For now: Listen actively, offer a warm drink, and handle one extra chore without being asked.";
    }
    return "Be patient and give extra love to your wife today.";
  }
};

export const generateDailyMoodAdvice = async (mood: string, note?: string, lang: Language = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `I am a mother in the pregnancy/postpartum phase. My mood today is "${mood}" ${note ? `and I wrote in my journal: "${note}"` : ''}.
  Give short, very warm, and practical advice based on my mood and journal entry today. 
  Focus on mental support and physical comfort. Maximum 3 sentences.
  IMPORTANT: Respond strictly in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Daily Mood Advice Error:", error);
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.status === 429) {
      return "Gratia AI is busy, but remember: your feelings are valid. Take 5 minutes just for yourself to breathe and rest.";
    }
    return "Breathe deeply and give some time for yourself today.";
  }
};

export const generateMoodAnalysis = async (history: MoodEntry[], lang: Language = 'en') => {
  if (history.length === 0) return "Not enough mood data for analysis yet.";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyText = history.map(h => `${h.date}: ${h.mood} (${h.note || 'no notes'})`).join(', ');
  const prompt = `Based on the following mother's mood history and daily notes: [${historyText}]. 
  Provide a brief analysis of her emotional trends and warm mental health advice. 
  IMPORTANT: Respond strictly in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Mood Analysis Error:", error);
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.status === 429) {
      return "Detailed analysis is unavailable due to high traffic, but your journey is uniquely yours and you are doing great.";
    }
    return "Analysis is currently unavailable, but keep taking care of your mental health.";
  }
};

export const generateParentingArticle = async (category: string, role: UserRole, lang: Language = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a short educational article about caring for a child/mother in the category "${category}" for a ${role === UserRole.MOTHER ? 'Mother' : 'Father'}. 
  The article should have a catchy title, a brief introduction, and practical key points. Respond in JSON format with fields 'title' and 'content' (use markdown for content). 
  IMPORTANT: Respond strictly in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ['title', 'content']
        }
      }
    });
    return safeJsonParse(response.text);
  } catch (error: any) {
    console.error("Article Generation Error:", error);
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.status === 429) {
      return { 
        title: "Parenting Wisdom", 
        content: "Our AI Library is temporarily at capacity. Please check back in a few minutes for fresh insights." 
      };
    }
    return { 
      title: "Parenting Tips", 
      content: "Sorry, the article couldn't be loaded at this time. Please try again later." 
    };
  }
};

export const generateCustomGuide = async (question: string, role: UserRole, lang: Language = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `You are a professional Parenting and Relationship Expert. 
  A user who is a ${role === UserRole.MOTHER ? 'Mother' : 'Father'} has a specific question: "${question}".
  
  Write a brief, supportive, and highly practical guide to help them. 
  The response MUST include:
  1. A clear, reassuring Title.
  2. An Introduction acknowledging their concern.
  3. A list of Practical Tips (3-5 points).
  4. A 'Coach's Secret' or final encouraging thought.
  
  Respond in JSON format with fields 'title' and 'content' (use markdown/newlines for content).
  IMPORTANT: Respond strictly in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ['title', 'content']
        }
      }
    });
    return safeJsonParse(response.text);
  } catch (error: any) {
    console.error("Custom Guide Generation Error:", error);
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.status === 429) {
      return {
        title: "AI Coach Rest Break",
        content: "I'm currently assisting many parents! Please wait a moment or try asking a simpler question shortly."
      };
    }
    return null;
  }
};
