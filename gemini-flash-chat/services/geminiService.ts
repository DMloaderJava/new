
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// IMPORTANT: API_KEY must be set in the environment variables as process.env.API_KEY
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("Gemini API Key (process.env.API_KEY) is not configured. API calls will fail.");
}

const modelConfig = {
  model: 'gemini-2.5-flash-preview-04-17',
  // For higher quality responses, thinkingConfig is omitted (default is enabled).
  // If low latency is critical (e.g., game AI), you might add:
  // config: { thinkingConfig: { thinkingBudget: 0 } }
};

const initializeChat = () => {
  if (!ai) {
    // This error will be thrown if API_KEY was not available at initialization
    throw new Error("Gemini AI client is not initialized. Check API Key configuration.");
  }
  if (!chat) {
    chat = ai.chats.create(modelConfig);
  }
};

export const sendMessage = async (messageText: string): Promise<string> => {
  if (!API_KEY || !ai) {
    throw new Error("Gemini API Key is not configured or AI client failed to initialize.");
  }

  try {
    initializeChat(); // Ensures chat is created if not already
    if (!chat) { // Should not happen if initializeChat works, but as a safeguard
        throw new Error("Chat session could not be established.");
    }
    const result: GenerateContentResponse = await chat.sendMessage({ message: messageText });
    return result.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    // Reset chat on certain types of errors if they indicate a session problem.
    // For now, just re-throw a user-friendly error.
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied")) {
        // Potentially reset chat or guide user, but for now, a clear message.
        // chat = null; // Optionally reset chat session on critical API key errors
        throw new Error("Invalid or unauthorized Gemini API Key. Please check your configuration and ensure the key has correct permissions.");
      }
      // Provide a more generic message for other API errors
      throw new Error(`Failed to get response from Gemini: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

export const resetChatSession = (): void => {
  chat = null; // This will cause initializeChat to create a new session on next message
  console.log("Gemini chat session has been reset.");
};
