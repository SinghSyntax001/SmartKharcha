import { genkit } from 'genkit';

// Genkit is initialized without model plugins.
// API calls will be made directly using the Groq SDK.
export const ai = genkit({
  plugins: [],
});
