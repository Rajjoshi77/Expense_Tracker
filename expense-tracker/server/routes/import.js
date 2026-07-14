import express from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { analyzeCSVStructure, classifyTransactionsBatch, parsePDFBankStatement } from '../services/llmService.js';
import { embedExpense } from '../services/embeddingService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Robust helper to parse CSV string handling double quotes and commas
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  return lines.map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  });
}

/**
 * POST /api/import/bank-statement
 * Parses uploaded CSV or PDF bank statement using AI and returns them for review.
 */
router.post('/bank-statement', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No statement file uploaded.' });
    }

    const isPDF = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      console.log(`[Import Route] Processing PDF statement using multimodal Gemini...`);
      const transactions = await parsePDFBankStatement(req.file.buffer);
      return res.json({
        success: true,
        isPDF: true,
        transactions
      });
    }

    // Process as CSV
    const csvText = req.file.buffer.toString('utf8');
    const parsedRows = parseCSV(csvText);

    if (parsedRows.length < 2) {
      return res.status(400).json({ error: 'CSV file is empty or contains insufficient data.' });
    }

    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(1);

    // Take a small sample (first 3-5 rows) for the LLM to analyze the structure
    const sampleRows = dataRows.slice(0, 5);

    console.log(`[Import Route] Analyzing CSV structure with Gemini...`);
    const mapping = await analyzeCSVStructure(headers, sampleRows);

    if (!mapping) {
      return res.status(500).json({ error: 'Failed to analyze CSV structure using AI.' });
    }

    console.log(`[Import Route] Mapping results:`, mapping);

    // Map all rows based on the mapping indexes
    const mappedTransactions = [];
    const descriptionsToClassify = [];

    for (const row of dataRows) {
      // Basic bounds check
      if (row.length < Math.max(mapping.dateIndex, mapping.descriptionIndex)) {
        continue;
      }

      const dateStr = row[mapping.dateIndex];
      const descStr = row[mapping.descriptionIndex];
      
      // Parse Amount: support separate debit/credit or single amount column
      let rawAmount = 0;
      let type = 'Regular';

      if (mapping.debitIndex !== -1 && row[mapping.debitIndex]) {
        // If there's a separate debit column, this is an expense
        rawAmount = parseFloat(row[mapping.debitIndex].replace(/[^\d.-]/g, '')) || 0;
        type = 'Regular';
      } else if (mapping.creditIndex !== -1 && row[mapping.creditIndex]) {
        // If it is in the credit column, it is income (represented as negative expense or skipped, but let's label it income)
        rawAmount = parseFloat(row[mapping.creditIndex].replace(/[^\d.-]/g, '')) || 0;
        type = 'Income';
      } else if (mapping.amountIndex !== -1 && row[mapping.amountIndex]) {
        rawAmount = parseFloat(row[mapping.amountIndex].replace(/[^\d.-]/g, '')) || 0;
        if (mapping.isAmountNegativeForExpense) {
          if (rawAmount < 0) {
            rawAmount = Math.abs(rawAmount);
            type = 'Regular';
          } else {
            type = 'Income';
          }
        } else {
          // If amount is positive, treat as regular expense unless determined otherwise
          type = 'Regular';
        }
      }

      // Ignore zero transactions or income for now (the main app is an expense tracker, but let's allow it as Regular category)
      if (rawAmount === 0) continue;

      // Clean the date string
      let date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        date = new Date(); // Fallback to today
      }

      mappedTransactions.push({
        name: descStr || 'Transaction',
        amount: Math.abs(rawAmount),
        date: date.toISOString().split('T')[0],
        merchant: descStr.split(/\s+/).slice(0, 3).join(' '), // Guess merchant name from description start
        note: `Imported from bank statement: ${descStr}`,
        type: type,
        category: 'Other' // To be filled by AI batch classifier
      });

      descriptionsToClassify.push(descStr || 'Transaction');
    }

    // Classify categories in batch to minimize LLM requests
    console.log(`[Import Route] Batch classifying ${mappedTransactions.length} transactions...`);
    const categories = await classifyTransactionsBatch(descriptionsToClassify.slice(0, 100)); // Cap sample size for batch rate limits

    mappedTransactions.forEach((tx, idx) => {
      if (idx < categories.length) {
        tx.category = categories[idx];
      }
    });

    return res.json({
      success: true,
      mapping,
      transactions: mappedTransactions
    });
  } catch (error) {
    console.error('[Import Route] Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to parse bank statement.' });
  }
});

/**
 * POST /api/import/confirm
 * Bulk creates confirmed expenses and generates their vector embeddings
 */
router.post('/confirm', async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid transactions format.' });
    }

    console.log(`[Import Confirm] Importing ${transactions.length} transactions...`);

    let confirmCount = 0;

    for (const tx of transactions) {
      if (tx.type === 'Income') {
        await prisma.income.create({
          data: {
            source: tx.name.trim(),
            amount: parseFloat(tx.amount),
            date: new Date(tx.date),
            isRecurring: false,
            note: tx.note?.trim() || null
          }
        });
        confirmCount++;
      } else {
        const expense = await prisma.expense.create({
          data: {
            name: tx.name.trim(),
            amount: parseFloat(tx.amount),
            category: tx.category || 'Other',
            type: tx.type || 'Regular',
            date: new Date(tx.date),
            merchant: tx.merchant?.trim() || null,
            note: tx.note?.trim() || null,
            user: 'Me'
          }
        });

        confirmCount++;

        // Async embed each expense
        embedExpense(expense)
          .then(emb => {
            if (emb) console.log(`[Import Confirm] Generated vector for: ${expense.name}`);
          })
          .catch(err => {
            console.error(`[Import Confirm] Embedding fail for ${expense.name}:`, err.message);
          });
      }
    }

    return res.json({
      success: true,
      count: confirmCount
    });
  } catch (error) {
    console.error('[Import Confirm] Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to import transactions.' });
  }
});

export default router;
