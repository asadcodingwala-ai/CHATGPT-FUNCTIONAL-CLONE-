
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, ModelType } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async *streamChat(
    messages: Message[],
    model: ModelType = ModelType.FLASH
  ) {
    // Format history for the chat model
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = this.ai.chats.create({
      model: model,
      history: history,
      config: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    try {
      const result = await chat.sendMessageStream({ message: lastMessage.content });
      
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) yield text;
      }
    } catch (error) {
      console.error("Gemini stream error:", error);
      throw error;
    }
  }

  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: ModelType.FLASH,
        contents: `Summarize this chat starter into a 3-5 word title: "${firstMessage}"`,
        config: {
          maxOutputTokens: 20
        }
      });
      return response.text?.replace(/"/g, '') || "New Chat";
    } catch (error) {
      return "New Chat";
    }
  }
}

export const geminiService = new GeminiService();
