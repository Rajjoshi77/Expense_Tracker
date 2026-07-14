/**
 * Embedding Service — Vector operations for semantic search
 *
 * Converts expenses into text documents, generates embeddings,
 * and performs cosine similarity search.
 */
import { generateEmbedding } from './llmService.js';

/**
 * Convert an expense record into a searchable text document
 */
export function expenseToDocument(expense) {
  const date = new Date(expense.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const parts = [
    `Spent ₹${expense.amount} on ${expense.name}`,
    `Category: ${expense.category}`,
    `Date: ${date}`,
    `Type: ${expense.type}`,
  ];

  if (expense.merchant) parts.push(`Merchant: ${expense.merchant}`);
  if (expense.note) parts.push(`Note: ${expense.note}`);
  if (expense.user && expense.user !== 'Me') parts.push(`By: ${expense.user}`);

  return parts.join('. ') + '.';
}

/**
 * Generate and return embedding for an expense
 */
export async function embedExpense(expense) {
  const doc = expenseToDocument(expense);
  const embedding = await generateEmbedding(doc);
  return embedding;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Semantic search: find top-K most similar expenses to a query
 */
export async function semanticSearch(query, expenses, topK = 10) {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return expenses.slice(0, topK); // Fallback to first K

  const scored = expenses
    .filter(e => e.embedding) // Only search expenses with embeddings
    .map(e => {
      let emb;
      try {
        emb = typeof e.embedding === 'string' ? JSON.parse(e.embedding) : e.embedding;
      } catch {
        return { expense: e, score: 0 };
      }
      return {
        expense: e,
        score: cosineSimilarity(queryEmbedding, emb),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map(s => ({ ...s.expense, _similarityScore: s.score }));
}

export default {
  expenseToDocument,
  embedExpense,
  cosineSimilarity,
  semanticSearch,
};
