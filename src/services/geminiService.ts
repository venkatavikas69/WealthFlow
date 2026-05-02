// geminiService.ts - Updated to call Netlify Function
export interface FinancialContext {
  transactions: any[];
  budgets: any[];
  userProfile: any;
}

export async function askAI(prompt: string, context: FinancialContext) {
  try {
    // We send both the prompt and the financial context to the Netlify function
    // The backend will now handle the system instruction construction and API key security
    const response = await fetch('/.netlify/functions/ai', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return `I'm sorry, I encountered an error: ${error.message}. Please check if the Netlify functions are working and your GEMINI_API_KEY is configured in the Netlify dashboard.`;
  }
}
