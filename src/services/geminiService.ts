import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  
  if (!genAI) {
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

interface FinancialContext {
  transactions: any[];
  budgets: any[];
  userProfile: any;
}

export async function askAI(prompt: string, context: FinancialContext) {
  const ai = getAI();
  if (!ai) {
    return "I'm sorry, but the AI Assistant is not configured on this deployment. Please provide a GEMINI_API_KEY to enable this feature.";
  }
  
  const { transactions, budgets, userProfile } = context;
  
  // Create a summary for context
  const transactionSummary = (transactions || []).slice(0, 10).map(t => 
    `- ${t.date}: ${t.type === 'expense' ? '-' : '+'}${t.amount} (${t.category}) - ${t.description}`
  ).join('\n');
  
  const budgetSummary = (budgets || []).map(b => 
    `- ${b.category}: ${b.amount} (Spent: ${b.spent || 0})`
  ).join('\n');

  const systemInstruction = `
    You are a professional financial advisor assistant for the "WealthFlow" app.
    The user is currently viewing their dashboard and wants to ask a question.
    
    User Profile:
    - Name: ${userProfile?.displayName || 'User'}
    - Preferred Currency: ${userProfile?.preferredCurrency || 'USD'}
    
    Context of recent transactions:
    ${transactionSummary || 'No recent transactions.'}
    
    Current Budget Status:
    ${budgetSummary || 'No budgets set.'}
    
    Instructions:
    - Be concise, helpful, and professional.
    - Provide financial insights based on the context provided.
    - If asked about their spending, refer to the transactions and budgets.
    - Encourage good financial habits.
    - Do not give legal or high-risk investment advice.
    - Keep responses formatted in clean Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text;
    return typeof text === 'string' ? text : "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a descriptive error message instead of just throwing
    // to allow the UI to handle it gracefully without crashing
    if (error && typeof error === 'object' && 'message' in error) {
      if ((error as any).message?.includes('PERMISSION_DENIED') || (error as any).status === 'PERMISSION_DENIED') {
        return "I'm sorry, I don't have permission to access the Gemini API. Please check your API key configuration.";
      }
    }
    throw error;
  }
}
