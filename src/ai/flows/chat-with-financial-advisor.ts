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
  question: z.string().describe('The user's question about financial planning.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The AI chatbot''s response to the user''s question.'),
  confidence: z.number().describe('The confidence score of the AI''s response (0.0-1.0).'),
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

const prompt = ai.definePrompt({
  name: 'smartKharchaPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a conservative, professional Indian financial advisor. Use ONLY the provided facts and documents to answer. Do NOT invent policy wording. Always cite bracket indices for sources you used.\n\nUser profile:\n- Age: {age}\n- Annual income: {annualIncome}\n- Dependents: {dependents}\n- Goal: {goal}\n\nComputed facts:\n{computed_facts_json}\n\nRetrieved documents:\n[1] Title: ...\n...\n\nQuestion: {question}\n\nOutput:\n1) 1-3 bullet recommendation\n2) Up to 3 product suggestions (product name + provider + 1-line reason)\n3) Estimated premium or cost (use computed facts as ground truth)\n4) Sources (list bracket indices used)\n5) Confidence: number between 0.0 and 1.0\nIf the documents do not support a claim, say \"I don't have a verified source for that.\"`,
});

// Define the Genkit flow
const chatWithFinancialAdvisorFlow = ai.defineFlow(
  {
    name: 'chatWithFinancialAdvisorFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    // Here you would load the profile, compute facts, retrieve docs, etc.
    // For now, we'll mock these steps.

    // Mock data for profile, computed facts, and retrieved documents
    const profile = {
      age: 30,
      annualIncome: 500000,
      dependents: 2,
      goal: 'retirement',
    };

    const computed_facts_json = JSON.stringify({
      recommended_insurance_cover: 5000000,
      premium_estimate: 10000,
    });

    // Mock retrieved documents
    // const retrievedDocuments = [
    //   {
    //     doc_id: 'doc1',
    //     title: 'Sample Document',
    //     content: 'This is a sample document.',
    //     source_url: 'http://example.com',
    //     trust_score: 0.8,
    //   },
    // ];

    // Call the prompt with the combined input
    const {output} = await prompt({
      ...input,
      ...profile,
      computed_facts_json,
    });

    // For now, return a simple mock response
    return {
      reply: output?.reply || 'This is a default response.',
      confidence: output?.confidence || 0.75,
      sources: output?.sources || [],
    };
  }
);
