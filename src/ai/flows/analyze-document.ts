'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert financial document analyst. Your task is to meticulously analyze the provided image of a document and extract structured information.

Based on the image, identify the document type, extract all relevant key-value pairs into a valid JSON object, and provide a concise summary.

- For an invoice or bill, extract fields like 'Invoice Number', 'Vendor Name', 'Total Amount', 'Due Date', and a list of line items.
- For a salary slip, extract 'Employee Name', 'Gross Salary', 'Net Salary', 'Deductions', and a breakdown of earnings.
- For a generic receipt, extract 'Store Name', 'Total Amount', 'Date', and items purchased.

Return the information in the specified JSON format, ensuring the extractedData field is a well-formed JSON object.`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { 
                        type: "image_url", 
                        image_url: {
                            "url": input.documentImage
                        }
                    },
                ]
            }
        ],
        response_format: { type: 'json_object' },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      throw new Error('AI failed to generate a response.');
    }

    const output = AnalyzeDocumentOutputSchema.parse(JSON.parse(rawOutput));
    return output;
  }
);
