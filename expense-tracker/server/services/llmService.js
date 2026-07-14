/**
 * LLM Service — Abstraction layer for Google Gemini AI
 *
 * Handles all LLM interactions: chat completion, embeddings, and structured output.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Chat / Text Generation ──────────────────────────
const SYSTEM_PROMPT = `You are "Spendora AI", an intelligent Indian financial assistant built into an expense tracking app.
Your personality: Friendly, concise, data-driven, uses ₹ (Indian Rupees) for all amounts.

Rules:
- Always format amounts in Indian Rupees (₹) with proper Indian number formatting (e.g., ₹1,00,000).
- Be concise — use bullet points, bold text, and short paragraphs.
- When presenting expense data, show amounts, dates, and categories clearly.
- If the user asks about spending, always reference the actual data provided in the context.
- Give actionable financial advice when appropriate.
- If you don't have enough data to answer, say so honestly.
- Use markdown formatting for better readability.
- When comparing periods, use ↑ and ↓ arrows with percentages.
- For predictions, be transparent about assumptions.

Current date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

/**
 * Generate a chat response using Gemini with context from RAG
 */
export async function generateChatResponse(userMessage, context = '') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}

--- EXPENSE DATA CONTEXT ---
${context || 'No expense data available yet. The user has not added any expenses.'}
--- END CONTEXT ---

User: ${userMessage}

Respond helpfully based on the expense data context above. If relevant data exists, reference specific numbers. Be concise and use markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('LLM Error:', error.message);

    if (error.message?.includes('API_KEY')) {
      return '⚠️ **Gemini API key not configured.** Please add your API key to `server/.env`.\n\nGet a free key at: [Google AI Studio](https://aistudio.google.com/apikey)';
    }

    return '⚠️ Sorry, I encountered an error processing your request. Please try again.';
  }
}

/**
 * Generate smart insights from expense data
 */
export async function generateInsights(expenseData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}

Analyze this expense data and generate 3-5 smart, actionable insights.

--- EXPENSE DATA ---
${expenseData}
--- END DATA ---

Return a JSON array of insight objects with this exact structure:
[
  {
    "type": "warning" | "tip" | "info" | "success",
    "title": "Short title",
    "description": "One sentence explanation",
    "metric": "₹X,XXX" or "XX%" (optional key metric)
  }
]

Only return valid JSON, nothing else.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Insights Error:', error.message);
    return [];
  }
}

// ── Embeddings ──────────────────────────────────────

/**
 * Generate text embedding using Gemini embedding model
 */
export async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values; // Returns float array
  } catch (error) {
    console.error('Embedding Error:', error.message);
    return null;
  }
}

export default {
  generateChatResponse,
  generateInsights,
  generateEmbedding,
};
