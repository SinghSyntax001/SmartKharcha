import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GROQ_API_KEY,
      // Point to the Groq API endpoint which is OpenAI-compatible
      baseURL: 'https://api.groq.com/openai/v1',
    }),
  ],
  // Specify the model using the plugin provider prefix and the model ID from Groq
  model: 'googleai/llama-3.1-8b-instant', 
});
