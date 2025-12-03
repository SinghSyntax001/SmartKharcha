'use server';

/**
 * @fileOverview This file defines a Genkit flow for retrieving relevant financial documents from a knowledge base.
 *
 * The flow takes a user's question and profile data as input, retrieves relevant documents from a local JSON knowledge base,
 * and returns a list of documents with their similarity scores.
 *
 * - retrieveRelevantFinancialDocuments - A function that handles the retrieval process.
 * - RetrieveFinancialDocumentsInput - The input type for the retrieveRelevantFinancialDocuments function.
 * - RetrievedFinancialDocumentsOutput - The return type for the retrieveRelevantFinancialDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single document in the knowledge base
const SeedKbDocSchema = z.object({
  doc_id: z.string(),
  title: z.string(),
  content: z.string(),
  source_url: z.string(),
  trust_score: z.number().min(0).max(1),
});

// Define the input schema for the flow
const RetrieveFinancialDocumentsInputSchema = z.object({
  user_id: z.string(),
  question: z.string(),
  profile: z.object({
    name: z.string(),
    age: z.number(),
    monthlyIncome: z.number(),
    annualIncome: z.number(),
    dependents: z.number(),
    goal: z.string(),
    created_at: z.number(),
  }),
});
export type RetrieveFinancialDocumentsInput = z.infer<
  typeof RetrieveFinancialDocumentsInputSchema
>;

// Define the output schema for the flow
const RetrievedFinancialDocumentsOutputSchema = z.array(z.object({
  doc_id: z.string(),
  title: z.string(),
  url: z.string(),
  similarity: z.number(),
}));
export type RetrievedFinancialDocumentsOutput = z.infer<
  typeof RetrievedFinancialDocumentsOutputSchema
>;

// Exported function to retrieve relevant financial documents
export async function retrieveRelevantFinancialDocuments(
  input: RetrieveFinancialDocumentsInput
): Promise<RetrievedFinancialDocumentsOutput> {
  return retrieveRelevantFinancialDocumentsFlow(input);
}

// Load the seed knowledge base (KB) from a JSON file
// In a real application, this might come from a database or external source
import seedKb from '../../../frontend/seed_data/seed_kb.json';

// Define the Genkit flow for retrieving relevant financial documents
const retrieveRelevantFinancialDocumentsFlow = ai.defineFlow(
  {
    name: 'retrieveRelevantFinancialDocumentsFlow',
    inputSchema: RetrieveFinancialDocumentsInputSchema,
    outputSchema: RetrievedFinancialDocumentsOutputSchema,
  },
  async input => {
    // Naive keyword-based retrieval implementation
    // In a real application, this could be replaced with a more sophisticated
    // retrieval mechanism, such as embeddings and FAISS.
    const keywords = input.question.toLowerCase().split(' ');

    const relevantDocs = seedKb
      .map(doc => {
        // Calculate a simple similarity score based on keyword matches
        const content = doc.content.toLowerCase();
        const matches = keywords.filter(keyword => content.includes(keyword));
        const similarity = matches.length / keywords.length;

        return {
          doc_id: doc.doc_id,
          title: doc.title,
          url: doc.source_url,
          similarity: similarity,
        };
      })
      .filter(doc => doc.similarity > 0) // Filter out documents with no keyword matches
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity in descending order

    return relevantDocs as RetrievedFinancialDocumentsOutput;
  }
);
