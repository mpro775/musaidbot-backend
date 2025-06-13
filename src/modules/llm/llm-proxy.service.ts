import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

@Injectable()
export class LlmProxyService {
  private readonly logger = new Logger(LlmProxyService.name);

  async sendPrompt(
    prompt: string,
    options?: {
      model?: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    const modelName = options?.model || 'gemini-1.5-flash-latest';
    if (!apiKey) throw new Error('No Gemini API key provided');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.4,
          maxOutputTokens: options?.maxTokens ?? 1024,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const text =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return text;
    } catch (error) {
      this.logger.error('Gemini API Error:', error?.message || error);
      throw new Error('Gemini API call failed');
    }
  }
}
