
import { GoogleGenAI, Modality } from "@google/genai";
import { ArabicVoice } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Generates natural Arabic speech from text.
 */
export const generateArabicTTS = async (text: string, voice: ArabicVoice): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const naturalPrompt = `Speak the following Modern Standard Arabic text in a completely natural, expressive, and human-like voice. Use smooth transitions between words and realistic conversational intonation, as if you are a professional narrator speaking naturally to a person. Do not sound robotic or overly slow: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: naturalPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Failed to generate audio content from Gemini API.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};

/**
 * Automatically adds diacritics (Tashkeel) to raw Arabic text.
 */
export const vowelizeArabicText = async (text: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing");
  if (!text.trim()) return "";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Arabic linguist. Add full and correct diacritics (Tashkeel/Harakat) to the following Arabic text to ensure perfect pronunciation in Modern Standard Arabic. Return ONLY the processed text with no explanations or extra formatting: ${text}`,
    });

    const result = response.text;
    if (!result) throw new Error("Failed to process text.");
    
    return result.trim();
  } catch (error) {
    console.error("Tashkeel Error:", error);
    throw error;
  }
};
