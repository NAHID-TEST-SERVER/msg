import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateBotResponse = async (botName: string, botBio: string, userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are ${botName}, a user on a social media platform. Your bio is: "${botBio}". 
      A user just sent you this message: "${userMessage}".
      Reply in a friendly, casual, and human-like way. Keep it short and natural. Use emojis occasionally.
      Do not sound like an AI. Be a person.`,
    });
    return response.text || "Hey there!";
  } catch (error) {
    console.error("Error generating bot response:", error);
    return "That's interesting! Tell me more.";
  }
};
