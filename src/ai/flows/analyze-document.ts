
'use server';

/**
 * @fileOverview This file implements a Genkit flow for analyzing financial documents from an image.
 *
 * - analyzeDocument - A function that extracts structured data from a document image.
 * - AnalyzeDocumentInput - The input type for the analyzeDocument function.
 * - AnalyzeDocumentOutput - The return type for the analyzeDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeDocumentInputSchema = z.object({
  documentImage: z
    .string()
    .describe(
      "A photo of a financial document (like a bill, payslip, or invoice) as a data URI. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;


const AnalyzeDocumentOutputSchema = z.object({
    documentType: z.string().describe("The type of document (e.g., 'Invoice', 'Salary Slip', 'Receipt')."),
    extractedData: z.any().describe("A JSON object containing the extracted key-value pairs from the document."),
    summary: z.string().describe("A brief one-sentence summary of the document's content."),
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;


export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: { schema: AnalyzeDocumentInputSchema },
  output: { schema: AnalyzeDocumentOutputSchema },
  prompt: `You are an expert financial document analyst. Your task is to meticulously analyze the provided image of a document and extract structured information.

Based on the image, identify the document type, extract all relevant key-value pairs into a valid JSON object, and provide a concise summary.

- For an invoice or bill, extract fields like 'Invoice Number', 'Vendor Name', 'Total Amount', 'Due Date', and a list of line items.
- For a salary slip, extract 'Employee Name', 'Gross Salary', 'Net Salary', 'Deductions', and a breakdown of earnings.
- For a generic receipt, extract 'Store Name', 'Total Amount', 'Date', and items purchased.

Return the information in the specified JSON format, ensuring the extractedData field is a well-formed JSON object.

Document Image:
{{media url=documentImage}}
`,
});


const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);
