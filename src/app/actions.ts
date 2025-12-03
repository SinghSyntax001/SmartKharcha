
'use server';

import { z } from 'zod';
import { handleGroqApiFallback } from '@/ai/flows/handle-groq-api-fallback';
import { retrieveRelevantFinancialDocuments } from '@/ai/flows/retrieve-relevant-financial-documents';
import { getTaxAdvice } from '@/ai/flows/tax-advisor';
import type { UserProfile, SeedKbDoc } from '@/lib/types';
import seedKb from '../../frontend/seed_data/seed_kb.json';

const allDocs: SeedKbDoc[] = seedKb;

const ProfileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(18, 'You must be at least 18.').max(100, 'Age must be 100 or less.'),
  monthlyIncome: z.coerce.number().min(0, 'Monthly income cannot be negative.'),
  dependents: z.coerce.number().min(0, 'Dependents cannot be negative.'),
  goal: z.string().min(1, 'Please select a goal.'),
});

export async function createProfile(formData: unknown): Promise<{ success: boolean; data: UserProfile | z.ZodError<typeof ProfileFormSchema> }> {
  const validatedFields = ProfileFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { success: false, data: validatedFields.error };
  }

  const { name, age, monthlyIncome, dependents, goal } = validatedFields.data;
  const annualIncome = monthlyIncome * 12;

  const profile: UserProfile = {
    user_id: `user_${Date.now()}`,
    name,
    age,
    monthlyIncome,
    annualIncome,
    dependents,
    goal,
    created_at: Date.now(),
  };

  return { success: true, data: profile };
}

export async function getAiResponse(question: string, profile: UserProfile) {
  try {
    // 1. Compute deterministic facts based on user profile
    const recommended_insurance_cover = profile.annualIncome * 10;
    // Illustrative rule for premium estimation
    const premium_estimate = Math.round((recommended_insurance_cover / 1000) * (profile.age / 10) + (profile.dependents * 200));
    const computed_facts_json = JSON.stringify({
      "Recommended Term Insurance Cover (₹)": recommended_insurance_cover.toLocaleString('en-IN'),
      "Illustrative Annual Premium (₹)": premium_estimate.toLocaleString('en-IN'),
    });

    // 2. Retrieve relevant document headers from the knowledge base
    const relevantDocHeaders = await retrieveRelevantFinancialDocuments({
      user_id: profile.user_id,
      question,
      profile,
    });

    // 3. Get full document content for the relevant docs
    const docMap = new Map(allDocs.map(doc => [doc.doc_id, doc]));
    const retrieved_documents_full = relevantDocHeaders
      .map(header => {
        const fullDoc = docMap.get(header.doc_id);
        if (!fullDoc) return null;
        return {
          ...fullDoc,
          similarity: header.similarity,
        };
      })
      .filter((doc): doc is SeedKbDoc & { similarity: number } => doc !== null);
      
    // 4. Call the main AI flow with all context
    const response = await handleGroqApiFallback({
      user_id: profile.user_id,
      question,
      profile,
      computed_facts_json,
      retrieved_documents: retrieved_documents_full,
    });

    return { success: true, data: response };

  } catch (error) {
    console.error("Error in getAiResponse:", error);
    return { 
      success: false, 
      data: { 
        reply: "Sorry, I encountered an error while processing your request. Please try again later.",
        confidence: 0,
        sources: []
      } 
    };
  }
}

const CalculatorSchema = z.object({
  income: z.coerce.number().min(1),
  deductions: z.coerce.number().min(0).default(0),
  hra: z.coerce.number().min(0).default(0),
});

export async function calculateTax(values: z.infer<typeof CalculatorSchema>) {
  const validated = CalculatorSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, data: null };
  }
  const { income, deductions, hra } = validated.data;
  const STANDARD_DEDUCTION = 50000;

  // Old Regime Calculation
  const taxableIncomeOld = Math.max(0, income - deductions - hra - STANDARD_DEDUCTION);
  let taxOldRegime = 0;
  if (taxableIncomeOld > 1000000) {
    taxOldRegime = 112500 + (taxableIncomeOld - 1000000) * 0.3;
  } else if (taxableIncomeOld > 500000) {
    taxOldRegime = 12500 + (taxableIncomeOld - 500000) * 0.2;
  } else if (taxableIncomeOld > 250000) {
    taxOldRegime = (taxableIncomeOld - 250000) * 0.05;
  }
  // Health and Education Cess
  taxOldRegime *= 1.04;

  // New Regime Calculation (for FY 2023-24 / AY 2024-25)
  const taxableIncomeNew = Math.max(0, income - STANDARD_DEDUCTION);
  let taxNewRegime = 0;
  if (taxableIncomeNew > 1500000) {
    taxNewRegime = 150000 + (taxableIncomeNew - 1500000) * 0.3;
  } else if (taxableIncomeNew > 1200000) {
    taxNewRegime = 90000 + (taxableIncomeNew - 1200000) * 0.2;
  } else if (taxableIncomeNew > 900000) {
    taxNewRegime = 45000 + (taxableIncomeNew - 900000) * 0.15;
  } else if (taxableIncomeNew > 600000) {
    taxNewRegime = 15000 + (taxableIncomeNew - 600000) * 0.1;
  } else if (taxableIncomeNew > 300000) {
    taxNewRegime = (taxableIncomeNew - 300000) * 0.05;
  }

  // Rebate under section 87A if taxable income is <= 7,00,000
  if (taxableIncomeNew <= 700000) {
    taxNewRegime = 0;
  } else {
    // Health and Education Cess
    taxNewRegime *= 1.04;
  }

  try {
    const { recommendation } = await getTaxAdvice({
      income,
      deductions: deductions + hra,
      taxOldRegime: Math.round(taxOldRegime),
      taxNewRegime: Math.round(taxNewRegime),
    });

    return {
      success: true,
      data: {
        taxOldRegime: Math.round(taxOldRegime),
        taxNewRegime: Math.round(taxNewRegime),
        recommendation,
      },
    };
  } catch (error) {
     console.error("Error in getTaxAdvice:", error);
     const saving = Math.round(taxOldRegime - taxNewRegime);
     let recommendation = `The New Regime seems more beneficial for you, saving you ₹${Math.abs(saving).toLocaleString('en-IN')}.`;
     if (saving < 0) {
         recommendation = `The Old Regime seems more beneficial for you, saving you ₹${Math.abs(saving).toLocaleString('en-IN')}.`;
     }
     return { 
      success: true, 
      data: { 
        taxOldRegime: Math.round(taxOldRegime),
        taxNewRegime: Math.round(taxNewRegime),
        recommendation: recommendation,
      } 
    };
  }
}
