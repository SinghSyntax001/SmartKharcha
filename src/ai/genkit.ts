import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Correct Groq configuration using the google-genai plugin as a proxy
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GROQ_API_KEY,
      // Point to Groq's OpenAI-compatible API endpoint
      baseUrl: 'https://api.groq.com/openai/v1',
    }),
  ],
  // Specify the model name as expected by the Groq API
  model: 'llama-3.1-8b-instant',
});
