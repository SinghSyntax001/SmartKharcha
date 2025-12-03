'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const prompt = `You are a helpful tax assistant. Based on the following tax calculation, provide a concise, one-sentence recommendation about which regime is more beneficial and by how much.

- Gross Income: ${input.income}
- Total Deductions: ${input.deductions}
- Tax under Old Regime: ${input.taxOldRegime}
- Tax under New Regime: ${input.taxNewRegime}

Return a JSON object with a single key "recommendation".`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "user", content: prompt }
        ],
        response_format: { type: 'json_object' },
    });
    
    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      throw new Error('AI failed to generate a response.');
    }

    const output = TaxAdvisorOutputSchema.parse(JSON.parse(rawOutput));
    return output;
  }
);
