
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

const prompt = ai.definePrompt({
  name: 'smartKharchaPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a conservative, professional Indian financial advisor. Your primary directive is to use ONLY the provided facts and documents to answer user questions. Do NOT invent policy wording, financial figures, or legal sections.

You MUST follow these rules:
1.  **Source citations are mandatory.** At the end of each statement that uses information from a document, you MUST cite the document's index in brackets, like this [0].
2.  **Answer only from the provided context.** If the documents do not contain the information to answer the question, you MUST state: "I'm sorry, but I don't have a verified source of information to answer that question."
3.  **Be direct and clear.** Present information in a structured way.

User profile:
- Age: {age}
- Annual income: {annualIncome}
- Dependents: {dependents}
- Goal: {goal}

Computed facts:
{computed_facts_json}

Retrieved documents:
{{#each retrieved_documents}}
[{{@index}}] Title: {{{this.title}}}
Content: {{{this.content}}}
{{/each}}

Question: {question}

Based *only* on the documents and facts above, provide:
1.  A 1-3 bullet point recommendation.
2.  Up to 3 product suggestions (product name + provider + 1-line reason), if applicable.
3.  An estimated premium or cost (use the computed facts as ground truth).
4.  A list of all source indices used in your response (e.g., "Sources: [0], [2]").
5.  A confidence score (a number between 0.0 and 1.0) based on how well the documents support your answer.`,
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
    
    const retrieved_documents = [
        {
            doc_id: 'rule_of_thumb_insurance',
            title: 'General Rule of Thumb for Term Insurance Cover',
            content: 'A widely accepted rule of thumb for term insurance coverage is to have a sum assured that is at least 10 to 15 times your current annual income.',
            source_url: 'https://www.investopedia.com/articles/insurance/08/life-insurance-how-much.asp',
            trust_score: 0.7
        }
    ];

    // Call the prompt with the combined input
    const {output} = await prompt({
      ...input,
      ...profile,
      computed_facts_json,
      retrieved_documents,
    });

    // For now, return a simple mock response
    return {
      reply: output?.reply || 'This is a default response.',
      confidence: output?.confidence || 0.75,
      sources: output?.sources || [],
    };
  }
);
