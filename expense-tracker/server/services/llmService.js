/**
 * LLM Service — Abstraction layer for Google Gemini AI with automatic model fallback
 *
 * Handles all LLM interactions: chat completion, embeddings, and structured output.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Fallback models for text generation and chat
const CHAT_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

// Fallback models for embeddings
const EMBEDDING_MODELS = [
  'gemini-embedding-2',
  'models/gemini-embedding-2',
  'gemini-embedding-001',
  'models/gemini-embedding-001'
];

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
 * Helper to execute text generation with automatic model fallback
 */
async function generateTextWithFallback(prompt) {
  let lastError = null;

  for (const modelName of CHAT_MODELS) {
    try {
      console.log(`[Spendora AI] Attempting text generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      
      if (result && result.response) {
        console.log(`[Spendora AI] Successfully generated text using: ${modelName}`);
        return result.response.text();
      }
    } catch (error) {
      console.warn(`[Spendora AI] Model ${modelName} failed:`, error.message);
      lastError = error;

      // Stop trying if the API key is completely wrong or missing
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not configured')) {
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini text models failed or are currently unavailable.');
}

/**
 * Generate a chat response using Gemini with context from RAG
 */
export async function generateChatResponse(userMessage, context = '') {
  try {
    const prompt = `${SYSTEM_PROMPT}

--- EXPENSE DATA CONTEXT ---
${context || 'No expense data available yet. The user has not added any expenses.'}
--- END CONTEXT ---

User: ${userMessage}

Respond helpfully based on the expense data context above. If relevant data exists, reference specific numbers. Be concise and use markdown formatting.`;

    return await generateTextWithFallback(prompt);
  } catch (error) {
    console.error('LLM Error:', error.message);

    if (error.message?.includes('API_KEY')) {
      return '⚠️ **Gemini API key not configured or invalid.** Please check your key in `server/.env`.\n\nGet a free key at: [Google AI Studio](https://aistudio.google.com/apikey)';
    }

    if (error.message?.includes('429') || error.message?.includes('503')) {
      return '⚠️ **All Gemini API models are experiencing high demand or rate limits.** Please wait a few seconds and try again.';
    }

    return `⚠️ Sorry, I encountered an error processing your request. Please try again. (Error: ${error.message})`;
  }
}

/**
 * Generate smart insights from expense data
 */
export async function generateInsights(expenseData) {
  try {
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

    const text = await generateTextWithFallback(prompt);

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
 * Generate text embedding using Gemini embedding model with fallback
 */
export async function generateEmbedding(text) {
  let lastError = null;

  for (const modelName of EMBEDDING_MODELS) {
    try {
      console.log(`[Spendora AI] Attempting embedding generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        console.log(`[Spendora AI] Successfully generated embedding using: ${modelName}`);
        return result.embedding.values;
      }
    } catch (error) {
      console.warn(`[Spendora AI] Embedding model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }

  console.error('All embedding models failed:', lastError?.message);
  return null;
}

/**
 * Analyze CSV structure and map headers to transaction fields
 */
export async function analyzeCSVStructure(headers, sampleRows) {
  const prompt = `You are a bank statement analysis bot.
We have a CSV file with these headers: ${JSON.stringify(headers)}
And these sample rows: ${JSON.stringify(sampleRows)}

Analyze the headers and sample rows to determine which column index (0-based) corresponds to:
- "date" (transaction date)
- "description" (merchant or transaction description)
- "amount" (amount spent or received)
- "debit" (if separate debit/withdrawal column exists)
- "credit" (if separate credit/deposit column exists)

Also determine if amounts are generally negative for expenses (debits) when in a single "amount" column.

Return a JSON object with this exact structure:
{
  "dateIndex": 0,
  "descriptionIndex": 1,
  "amountIndex": 2,
  "debitIndex": -1,
  "creditIndex": -1,
  "isAmountNegativeForExpense": false
}
Note: If a field doesn't exist or is not applicable, use -1. Do not include any other text or markdown block formatting.`;

  try {
    const responseText = await generateTextWithFallback(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('analyzeCSVStructure Error:', error.message);
  }
  return null;
}

/**
 * Batch classify categories for a list of transaction descriptions
 */
export async function classifyTransactionsBatch(descriptions) {
  if (!descriptions || descriptions.length === 0) return [];

  const prompt = `You are a financial classification assistant. Categorize these transaction descriptions into one of these standard categories: Food, Shopping, Entertainment, Utilities, Travel, Health, Subscriptions, Other.

Descriptions:
${JSON.stringify(descriptions)}

Return a JSON array of strings in the exact same order as the input descriptions, representing the classified category for each transaction. Example format:
["Food", "Utilities", "Travel"]
Do not return any other text, just the raw JSON array.`;

  try {
    const responseText = await generateTextWithFallback(prompt);
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('classifyTransactionsBatch Error:', error.message);
  }
  // Fallback to "Other" for all
  return descriptions.map(() => 'Other');
}

export default {
  generateChatResponse,
  generateInsights,
  generateEmbedding,
  analyzeCSVStructure,
  classifyTransactionsBatch,
};

