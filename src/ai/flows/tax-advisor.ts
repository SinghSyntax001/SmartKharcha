'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing tax advice.
 *
 * - getTaxAdvice - A function that provides a recommendation based on tax calculation results.
 * - TaxAdvisorInput - The input type for the getTaxAdvice function.
 * - TaxAdvisorOutput - The return type for the getTaxAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaxAdvisorInputSchema = z.object({
  income: z.number().describe('Gross annual income.'),
  deductions: z.number().describe('Total deductions claimed.'),
  taxOldRegime: z.number().describe('Tax calculated under the Old Regime.'),
  taxNewRegime: z.number().describe('Tax calculated under the New Regime.'),
});
export type TaxAdvisorInput = z.infer<typeof TaxAdvisorInputSchema>;

const TaxAdvisorOutputSchema = z.object({
  recommendation: z.string().describe('The AI-powered recommendation.'),
});

export type TaxAdvisorOutput = z.infer<typeof TaxAdvisorOutputSchema>;

export async function getTaxAdvice(input: TaxAdvisorInput): Promise<TaxAdvisorOutput> {
  return taxAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taxAdvisorPrompt',
  input: {
    schema: TaxAdvisorInputSchema,
  },
  output: {
    schema: TaxAdvisorOutputSchema,
  },
  prompt: `You are a helpful tax assistant. Based on the following tax calculation, provide a concise, one-sentence recommendation about which regime is more beneficial and by how much.

- Gross Income: {{{income}}}
- Total Deductions: {{{deductions}}}
- Tax under Old Regime: {{{taxOldRegime}}}
- Tax under New Regime: {{{taxNewRegime}}}

Recommendation:`,
});

const taxAdvisorFlow = ai.defineFlow(
  {
    name: 'taxAdvisorFlow',
    inputSchema: TaxAdvisorInputSchema,
    outputSchema: TaxAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);
