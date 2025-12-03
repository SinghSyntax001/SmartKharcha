
import type { getAiResponse } from "@/app/actions";

export type UserProfile = {
  user_id: string;
  name: string;
  age: number;
  monthlyIncome: number;
  annualIncome: number;
  dependents: number;
  goal: string;
  created_at: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    doc_id: string;
    title: string;
    url: string;
    similarity: number;
  }[];
  confidence?: number;
};

export type SeedKbDoc = {
  doc_id: string;
  title: string;
  content: string;
  source_url: string;
  trust_score: number;
};

export type AiAction = typeof getAiResponse;
