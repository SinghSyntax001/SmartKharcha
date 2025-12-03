'use server';

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

const taxAdvisorFlow = ai.defineFlow(
  {
    name: 'taxAdvisorFlow',
    inputSchema: TaxAdvisorInputSchema,
    outputSchema: TaxAdvisorOutputSchema,
  },
  async (input) => {
    const model = ai.model('gemini-1.5-flash-latest');
    const prompt = `You are a helpful tax assistant. Based on the following tax calculation, provide a concise, one-sentence recommendation about which regime is more beneficial and by how much.

- Gross Income: ${input.income}
- Total Deductions: ${input.deductions}
- Tax under Old Regime: ${input.taxOldRegime}
- Tax under New Regime: ${input.taxNewRegime}

Return a JSON object with a single key "recommendation".`;

    const { output } = await ai.generate({
      model: model,
      prompt: prompt,
      config: {
        response: {
          format: 'json',
          schema: TaxAdvisorOutputSchema
        }
      }
    });
    
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }

    return output;
  }
);
