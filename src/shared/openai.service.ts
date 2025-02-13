import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);
  private readonly MAX_TOKENS = 4096;
  private readonly RESPONSE_TOKENS = 150;
  private readonly BUFFER_TOKENS = 100;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  async chatWithCharacter(
    characterContext: string,
    userMessage: string,
    previousMessages: Message[] = [],
  ): Promise<string> {
    try {
      const systemMessage: Message = {
        role: 'system',
        content: `You are a Star Wars character. Here is your background information: ${characterContext}. 
                 Stay in character while responding, using knowledge and personality consistent with your background. 
                 Keep responses concise and authentic to your character's way of speaking.`,
      };

      const newUserMessage: Message = {
        role: 'user',
        content: userMessage,
      };
      const allMessages = [...previousMessages, newUserMessage];
      const trimmedMessages = this.trimMessagesToTokenLimit(
        allMessages,
        systemMessage,
      );
      const completion = await this.openai.chat.completions.create({
        messages: trimmedMessages,
        model: 'gpt-4-turbo-preview',
        max_tokens: this.RESPONSE_TOKENS,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || 'No response generated';
    } catch (error) {
      this.logger.error('Error in OpenAI chat completion:', error);
      throw error;
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Trim messages to fit within token limit
  private trimMessagesToTokenLimit(
    messages: Message[],
    systemMessage: Message,
  ): Message[] {
    const availableTokens =
      this.MAX_TOKENS - this.RESPONSE_TOKENS - this.BUFFER_TOKENS;
    let currentTokens = this.estimateTokens(systemMessage.content);
    const trimmedMessages: Message[] = [systemMessage];

    // Process messages from newest to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = this.estimateTokens(messages[i].content);

      if (currentTokens + messageTokens <= availableTokens) {
        trimmedMessages.unshift(messages[i]);
        currentTokens += messageTokens;
      } else {
        break;
      }
    }

    return trimmedMessages;
  }
}
