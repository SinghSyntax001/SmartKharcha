import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GROQ_API_KEY,
      // Pass an empty string for the API key to the googleAI plugin, since we are using Groq's API key.
      // The actual key is passed as a Bearer token in the header, which is handled automatically.
      // We also need to specify the base URL for the Groq API.
      baseURL: 'https://api.groq.com/openai/v1',
    }),
  ],
  model: 'googleai/llama-3.1-8b-instant', // Specify the model with the plugin provider
});
