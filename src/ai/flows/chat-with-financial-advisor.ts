
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
import type { UserProfile } from '@/lib/types';

// Define schemas for input and output
const ChatInputSchema = z.object({
  question: z.string().describe("The user's question about financial planning."),
  profile: z.any().describe("The user's profile data."),
  retrieved_documents: z.array(z.any()).describe("Documents retrieved from the knowledge base."),
  computed_facts_json: z.string().describe("JSON string of computed financial facts."),
  documentContext: z.string().optional().describe("Optional context from a user-uploaded document."),
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
    name: 'financialAdvisorPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: z.object({
        reply: z.string(),
        confidence: z.number(),
        source_indices: z.array(z.number()),
    })},
    prompt: `You are a conservative, professional Indian financial advisor. Your primary directive is to use ONLY the provided facts and documents to answer user questions. Do NOT invent policy wording, financial figures, or legal sections.

You MUST follow these rules:
1.  **Source citations are mandatory.** At the end of each statement that uses information from a document, you MUST cite the document's index in brackets, like this [0].
2.  **Answer only from the provided context.** If the documents or computed facts do not contain the information to answer the question, you MUST state: "I'm sorry, but I don't have a verified source of information to answer that question."
3.  **Be direct and clear.** Present information in a structured way using markdown.
4.  **If document data is present in the computed facts (from a user upload), prioritize it.**

User profile:
- Age: {{{profile.age}}}
- Annual income: {{{profile.annualIncome}}}
- Dependents: {{{profile.dependents}}}
- Goal: {{{profile.goal}}}

Computed facts (including any data extracted from documents):
{{{computed_facts_json}}}

Retrieved documents from knowledge base:
{{#each retrieved_documents}}
[{{@index}}] Title: {{{this.title}}}
Content: {{{this.content}}}
{{/each}}

Question: {{{question}}}

Based *only* on the documents and facts above, provide:
1. A detailed, multi-paragraph response answering the user's question with citations.
2. A confidence score (a number between 0.0 and 1.0) based on how well the documents support your answer.
3. A list of all source indices used in your response (e.g., [0, 2]).
`,
});


// Define the Genkit flow
const chatWithFinancialAdvisorFlow = ai.defineFlow(
  {
    name: 'chatWithFinancialAdvisorFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
        throw new Error("AI failed to generate a valid response.");
    }
    
    // Map the source indices from the AI response back to the full source objects
    const sources = output.source_indices
        .map(index => input.retrieved_documents[index])
        .filter(Boolean) // Filter out any invalid indices
        .map(doc => ({
            doc_id: doc.doc_id,
            title: doc.title,
            url: doc.source_url,
            similarity: doc.similarity,
        }));


    return {
        reply: output.reply,
        confidence: output.confidence,
        sources: sources,
    };
  }
);
