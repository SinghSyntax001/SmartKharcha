import { config } from 'dotenv';
config();

import '@/ai/flows/retrieve-relevant-financial-documents.ts';
import '@/ai/flows/chat-with-financial-advisor.ts';
import '@/ai/flows/handle-groq-api-fallback.ts';