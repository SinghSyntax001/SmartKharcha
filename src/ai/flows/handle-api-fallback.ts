
'use server';
/**
 * @fileOverview This file implements a Genkit flow that handles fallback behavior when the primary AI API is unavailable.
 *
 * - handleApiFallback - A function that attempts to get financial advice, but falls back to deterministic rules if the API fails.
 * - HandleApiFallbackInput - The input type for the handleApiFallback function.
 * - HandleApiFallbackOutput - The return type for the handleApiFallback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const HandleApiFallbackInputSchema = z.object({
  question: z.string().describe("The user's question about financial planning."),
  profile: z.any().describe("The user's profile data."),
  retrieved_documents: z.array(z.any()).describe("Documents retrieved from the knowledge base."),
  computed_facts_json: z.string().describe("JSON string of computed financial facts."),
  documentContext: z.string().optional().describe("Optional context from a user-uploaded document."),
});
export type HandleApiFallbackInput = z.infer<typeof HandleApiFallbackInputSchema>;

const AiOutputSchema = z.object({
    reply: z.string().describe("The AI chatbot's response to the user's question."),
    confidence: z.number().min(0).max(1).describe("The confidence score of the AI's response (0.0-1.0)."),
    source_indices: z.array(z.number()).describe('A list of all source indices from the retrieved documents that were used in the response.'),
});


const HandleApiFallbackOutputSchema = z.object({
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
export type HandleApiFallbackOutput = z.infer<typeof HandleApiFallbackOutputSchema>;

export async function handleApiFallback(input: HandleApiFallbackInput): Promise<HandleApiFallbackOutput> {
  return handleApiFallbackFlow(input);
}


const handleApiFallbackFlow = ai.defineFlow(
  {
    name: 'handleApiFallbackFlow',
    inputSchema: HandleApiFallbackInputSchema,
    outputSchema: HandleApiFallbackOutputSchema,
  },
  async (input) => {
    try {
      const model = ai.model('gemini-1.5-flash-latest');
      const documentsContext = input.retrieved_documents.map((doc, index) => `[${index}] Title: ${doc.title}\nContent: ${doc.content}`).join('\n\n');

      const systemPrompt = `You are a conservative, professional Indian financial advisor. Your primary directive is to use ONLY the provided facts and documents to answer user questions. Do NOT invent policy wording, financial figures, or legal sections.

You MUST follow these rules:
1.  **Source citations are mandatory.** At the end of each statement that uses information from a document, you MUST cite the document's index in brackets, like this [0].
2.  **Answer only from the provided context.** If the documents or computed facts do not contain the information to answer the question, you MUST state: "I'm sorry, but I don't have a verified source of information to answer that question."
3.  **Be direct and clear.** Present information in a structured way using markdown.
4.  **If document data is present in the computed facts (from a user upload), prioritize it.**

User profile:
- Age: ${input.profile.age}
- Annual income: ${input.profile.annualIncome}
- Dependents: ${input.profile.dependents}
- Goal: ${input.profile.goal}

Computed facts (including any data extracted from documents):
${input.computed_facts_json}

Retrieved documents from knowledge base:
${documentsContext}

Based *only* on the documents and facts above, generate a JSON response with three keys: 'reply', 'confidence', and 'source_indices'.`;

      const { output } = await ai.generate({
          model: model,
          prompt: `${systemPrompt}\n\nUser Question: ${input.question}`,
          config: {
            response: {
              format: 'json',
              schema: AiOutputSchema
            }
          }
      });
      
      if (!output) {
          throw new Error("AI failed to generate a response.");
      }

      const sources = output.source_indices
          .map(index => input.retrieved_documents[index])
          .filter(Boolean)
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

    } catch (error: any) {
      console.error('AI API call failed. Full error:', JSON.stringify(error, null, 2));

      // Deterministic fallback logic
      const reply = "I am sorry, the AI service is currently unavailable. Based on your profile and available information, here's a deterministic recommendation: Consider a term insurance plan with coverage of 10x your annual income.";
      const confidence = 0.5; // Lower confidence score for fallback
      const sources = input.retrieved_documents.map(doc => ({
        doc_id: doc.doc_id,
        title: doc.title,
        url: doc.source_url,
        similarity: doc.trust_score, // Using trust_score as a fallback similarity
      }));

      return {
        reply,
        confidence,
        sources,
      };
    }
  }
);
