
'use server';

/**
 * @fileOverview Implements the chat flow for the SmartKharcha AI advisor, providing personalized financial advice.
 *
 * - chatWithFinancialAdvisor - A function that handles the chat flow.
 * - ChatInput - The input type for the chatWithFinancialAdvisor function.
 * - ChatOutput - The return type for the chatWithFinancialAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define schemas for input and output
const ChatInputSchema = z.object({
  user_id: z.string().describe('The unique identifier for the user.'),
  question: z.string().describe("The user's question about financial planning."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe("The AI chatbot's response to the user's question."),
  confidence: z.number().describe("The confidence score of the AI's response (0.0-1.0)."),
  sources: z.array(
    z.object({
      doc_id: z.string().describe('The ID of the document used as a source.'),
      title: z.string().describe('The title of the document used as a source.'),
      url: z.string().describe('The URL of the document used as a source.'),
      similarity: z.number().describe('The similarity score between the question and the document.'),
    })
  ).describe('The sources used to generate the response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Define the chatWithFinancialAdvisor function
export async function chatWithFinancialAdvisor(input: ChatInput): Promise<ChatOutput> {
  return chatWithFinancialAdvisorFlow(input);
}


// Define the Genkit flow
const chatWithFinancialAdvisorFlow = ai.defineFlow(
  {
    name: 'chatWithFinancialAdvisorFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(), // Simplified output
  },
  async (input) => {
    // Directly call the AI model with a simple prompt
    const { output } = await ai.generate({
        prompt: `You are a financial advisor. Answer the following question: ${input.question}`,
    });
    
    if (!output) {
      return "The AI did not return a response.";
    }
    
    // The output of `generate` is a string when no output schema is defined for the model call.
    return output as string;
  }
);
