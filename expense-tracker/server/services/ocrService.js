import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CHAT_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    }
  };
}

/**
 * Extract transaction details from an uploaded receipt image buffer using Gemini Multimodal
 */
export async function parseReceiptImage(buffer, mimeType) {
  const imagePart = bufferToGenerativePart(buffer, mimeType);
  const prompt = `You are an expert receipt parser. Analyze this receipt image carefully and extract:
1. Merchant/Store name
2. Total amount (as a raw float number)
3. Transaction date (format: YYYY-MM-DD, default to today if missing or unreadable)
4. Category (choose from: Food, Shopping, Entertainment, Utilities, Travel, Health, Subscriptions, Other)
5. A brief note describing the items purchased

Return the result as a raw JSON object with this structure:
{
  "merchant": "Store Name",
  "amount": 1500.50,
  "category": "Food",
  "date": "2026-07-14",
  "note": "Items list or description"
}

Do not wrap the response in markdown blocks. Return only valid JSON.`;

  let lastError = null;

  for (const modelName of CHAT_MODELS) {
    try {
      console.log(`[OCR Service] Extracting receipt details with: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      
      if (result && result.response) {
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            merchant: parsed.merchant || 'Unknown Merchant',
            amount: parseFloat(parsed.amount) || 0,
            category: parsed.category || 'Other',
            date: parsed.date || new Date().toISOString().split('T')[0],
            note: parsed.note || 'AI Scanned Receipt'
          };
        }
      }
    } catch (error) {
      console.warn(`[OCR Service] Model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error('All Gemini multimodal models failed to extract details from this receipt.');
}

export default {
  parseReceiptImage
};
