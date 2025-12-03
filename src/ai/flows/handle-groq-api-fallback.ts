'use server';
/**
 * @fileOverview This file implements a Genkit flow that handles fallback behavior when the Groq API is unavailable.
 *
 * - handleGroqApiFallback - A function that attempts to get financial advice from Groq, but falls back to deterministic rules if the Groq API fails.
 * - HandleGroqApiFallbackInput - The input type for the handleGroqApiFallback function.
 * - HandleGroqApiFallbackOutput - The return type for the handleGroqApiFallback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandleGroqApiFallbackInputSchema = z.object({
  user_id: z.string().describe('The ID of the user.'),
  question: z.string().describe('The user question.'),
  profile: z.any().describe('The user profile data.'),
  computed_facts_json: z.string().describe('Computed financial facts as JSON.'),
  retrieved_documents: z.array(z.any()).describe('Retrieved documents from the knowledge base.'),
});
export type HandleGroqApiFallbackInput = z.infer<typeof HandleGroqApiFallbackInputSchema>;

const HandleGroqApiFallbackOutputSchema = z.object({
  reply: z.string().describe('The financial advice reply.'),
  confidence: z.number().describe('Confidence score of the advice.'),
  sources: z.array(z.any()).describe('Sources used to generate the advice.'),
});
export type HandleGroqApiFallbackOutput = z.infer<typeof HandleGroqApiFallbackOutputSchema>;

export async function handleGroqApiFallback(input: HandleGroqApiFallbackInput): Promise<HandleGroqApiFallbackOutput> {
  return handleGroqApiFallbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'groqApiFallbackPrompt',
  input: {
    schema: HandleGroqApiFallbackInputSchema,
  },
  output: {
    schema: HandleGroqApiFallbackOutputSchema,
  },
  prompt: `You are a conservative, professional Indian financial advisor. Your primary directive is to use ONLY the provided facts and documents to answer user questions. Do NOT invent policy wording, financial figures, or legal sections.

You MUST follow these rules:
1.  **Source citations are mandatory.** At the end of each statement that uses information from a document, you MUST cite the document's index in brackets, like this [0].
2.  **Answer only from the provided context.** If the documents do not contain the information to answer the question, you MUST state: "I'm sorry, but I don't have a verified source of information to answer that question."
3.  **Be direct and clear.** Present information in a structured way.

User profile:
- Age: {{{profile.age}}}
- Annual income: {{{profile.annualIncome}}}
- Dependents: {{{profile.dependents}}}
- Goal: {{{profile.goal}}}

Computed facts:
{{{computed_facts_json}}}

Retrieved documents:
{{#each retrieved_documents}}
[{{@index}}] Title: {{{this.title}}}
Content: {{{this.content}}}
{{/each}}

Question: {{{question}}}

Based *only* on the documents and facts above, provide:
1.  A 1-3 bullet point recommendation.
2.  Up to 3 product suggestions (product name + provider + 1-line reason), if applicable.
3.  An estimated premium or cost (use the computed facts as ground truth).
4.  A list of all source indices used in your response (e.g., "Sources: [0], [2]").
5.  A confidence score (a number between 0.0 and 1.0) based on how well the documents support your answer.`,
});

const handleGroqApiFallbackFlow = ai.defineFlow(
  {
    name: 'handleGroqApiFallbackFlow',
    inputSchema: HandleGroqApiFallbackInputSchema,
    outputSchema: HandleGroqApiFallbackOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
          throw new Error("AI failed to generate a response.");
      }
      return output;
    } catch (error: any) {
      console.error('Groq API call failed:', error.message);

      // Deterministic fallback logic
      const reply = "I am sorry, the AI service is currently unavailable. Based on your profile and available information, here's a deterministic recommendation: Consider a term insurance plan with coverage of 10x your annual income.";
      const confidence = 0.5; // Lower confidence score for fallback
      const sources = input.retrieved_documents.map(doc => ({
        doc_id: doc.doc_id,
        title: doc.title,
        url: doc.source_url,
        similarity: doc.trust_score,
      }));

      return {
        reply: reply,
        confidence,
        sources,
      };
    }
  }
);
