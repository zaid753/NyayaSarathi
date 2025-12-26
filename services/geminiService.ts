import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, MODULE_PROMPTS, LANGUAGES } from "../constants";
import { Message, Metadata, AppMode, LanguageCode, Attachment } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to extract JSON from the text response
const parseResponseMetadata = (text: string): { text: string; metadata?: Metadata } => {
  const jsonRegex = /---JSON_START---([\s\S]*?)---JSON_END---/;
  const match = text.match(jsonRegex);

  if (match && match[1]) {
    try {
      const metadata = JSON.parse(match[1]);
      const cleanedText = text.replace(jsonRegex, '').trim();
      return { text: cleanedText, metadata };
    } catch (e) {
      console.error("Failed to parse metadata JSON", e);
      return { text: text };
    }
  }
  return { text: text };
};

export const sendMessageToGemini = async (
  history: Message[],
  currentInput: string,
  mode: AppMode,
  language: LanguageCode,
  contextData?: string,
  location?: { latitude: number; longitude: number },
  attachment?: Attachment
): Promise<{ text: string; metadata?: Metadata }> => {
  
  try {
    const selectedLang = LANGUAGES.find(l => l.code === language);
    let systemInstruction = `${SYSTEM_PROMPT}\n\nCURRENT LANGUAGE SETTING: ${selectedLang?.name}.`;
    
    let userPrompt = currentInput;
    let tools: any[] = [];
    let toolConfig: any = {};
    let modelName = 'gemini-3-flash-preview';

    // Mode-specific instructions
    if (mode === AppMode.GLOBAL_SEARCH) {
      systemInstruction += `\n\n${MODULE_PROMPTS.GLOBAL_SEARCH}`;
    } else if (mode === AppMode.FIR_GENERATOR && contextData) {
      systemInstruction += `\n\n${MODULE_PROMPTS.FIR_ASSIST}`;
      userPrompt = `Generate a specialized legal document draft based on these details:\n${contextData}`;
    } else if (mode === AppMode.IPC_EXPLAINER) {
      systemInstruction += `\n\n${MODULE_PROMPTS.IPC_EXPLAIN}`;
    } else if (mode === AppMode.ADR_GUIDE) {
      systemInstruction += `\n\n${MODULE_PROMPTS.ADR_GUIDE}`;
    } else if (mode === AppMode.LEGAL_DICTIONARY) {
      systemInstruction += `\n\n${MODULE_PROMPTS.LEGAL_DICTIONARY}`;
    } else if (mode === AppMode.BANK_FRAUD) {
      systemInstruction += `\n\n${MODULE_PROMPTS.BANK_FRAUD}`;
    } else if (mode === AppMode.CONSUMER_RIGHTS) {
      systemInstruction += `\n\n${MODULE_PROMPTS.CONSUMER_COMPLAINT}`;
    } else if (mode === AppMode.AADHAAR_SUPPORT) {
      systemInstruction += `\n\n${MODULE_PROMPTS.AADHAAR_SUPPORT}`;
    } else if (mode === AppMode.STATION_FINDER) {
      modelName = 'gemini-2.5-flash'; 
      systemInstruction += `\n\n${MODULE_PROMPTS.STATION_FINDER}`;
      tools = [{ googleMaps: {} }];
      if (location) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }
    }

    const parts: any[] = [];
    
    if (attachment) {
      parts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    parts.push({ text: `
      PREVIOUS CONTEXT: ${history.slice(-3).map(m => `${m.role}: ${m.text}`).join('\n')}
      
      CURRENT REQUEST: ${userPrompt}
    `});

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, 
        tools: tools.length > 0 ? tools : undefined,
        toolConfig: tools.length > 0 ? toolConfig : undefined,
      }
    });

    const rawText = response.text || "I apologize, I could not generate a response.";
    const result = parseResponseMetadata(rawText);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      if (!result.metadata) {
        result.metadata = { confidence: 'HIGH', sources: [], actions: [] };
      }
      result.metadata.groundingChunks = groundingChunks;
    }

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "I am experiencing technical difficulties connecting to the legal database. Please ensure location services are enabled if using Station Finder.",
      metadata: { confidence: 'LOW', sources: [], actions: [] }
    };
  }
};