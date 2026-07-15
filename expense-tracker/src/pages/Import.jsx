import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ocrApi, importApi } from '../services/api';

const categories = ['Food', 'Shopping', 'Entertainment', 'Utilities', 'Travel', 'Health', 'Subscriptions', 'Other'];

const Import = ({ onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState('receipt'); // 'receipt' or 'csv'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Receipt Scanner State
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState([]);
  const csvInputRef = useRef(null);

  // ── Receipt Scanner Functions ─────────────────────────

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      setExtractedData(null);
      setError(null);
      setSuccess(null);
    } else {
      setError('Please upload a valid receipt image (PNG, JPG, or WEBP).');
    }
  };

  const triggerScan = async () => {
    if (!receiptFile) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const response = await ocrApi.scanReceipt(formData);
      if (response.success) {
        setExtractedData(response.data);
        setSuccess('Receipt parsed successfully!');
      } else {
        setError(response.error || 'Failed to scan receipt.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while uploading the receipt.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!extractedData) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Direct call to submit a parsed expense
      const rawRes = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: extractedData.merchant,
          amount: extractedData.amount,
          category: extractedData.category,
          date: extractedData.date,
          merchant: extractedData.merchant,
          note: extractedData.note,
          type: 'Regular',
        })
      });
      const data = await rawRes.json();
      if (rawRes.ok) {
        setSuccess(`Successfully added ${extractedData.merchant} expense of ₹${extractedData.amount}!`);
        setExtractedData(null);
        setReceiptFile(null);
        setReceiptPreview(null);
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        setError(data.error || 'Failed to save expense.');
      }
    } catch {
      setError('Failed to save scanned expense.');
    } finally {
      setLoading(false);
    }
  };

  // ── CSV Import Functions ──────────────────────────────

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv' || file.name.endsWith('.pdf') || file.type === 'application/pdf')) {
      setCsvFile(file);
      setParsedTransactions([]);
      setSelectedTx([]);
      setError(null);
      setSuccess(null);
    } else {
      setError('Please upload a valid CSV bank statement or PDF file.');
    }
  };

  const triggerCsvParse = async () => {
    if (!csvFile) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('statement', csvFile);

    try {
      const response = await importApi.parseStatement(formData);
      if (response.success) {
        setParsedTransactions(response.transactions);
        // Default select all transactions
        setSelectedTx(response.transactions.map((_, idx) => idx));
        setSuccess(`Successfully parsed statement! Review ${response.transactions.length} items below.`);
      } else {
        setError(response.error || 'Failed to parse statement.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing CSV bank statement.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectTx = (index) => {
    if (selectedTx.includes(index)) {
      setSelectedTx(selectedTx.filter(idx => idx !== index));
    } else {
      setSelectedTx([...selectedTx, index]);
    }
  };

  const handleTxFieldChange = (index, field, value) => {
    const updated = [...parsedTransactions];
    updated[index][field] = value;
    setParsedTransactions(updated);
  };

  const handleImportConfirm = async () => {
    if (selectedTx.length === 0) {
      setError('Please select at least one transaction to import.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const txsToImport = parsedTransactions.filter((_, idx) => selectedTx.includes(idx));

    try {
      const response = await importApi.confirmImport(txsToImport);
      if (response.success) {
        setSuccess(`Successfully imported ${response.count} transactions!`);
        setParsedTransactions([]);
        setSelectedTx([]);
        setCsvFile(null);
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        setError(response.error || 'Failed to complete import.');
      }
    } catch {
      setError('Error while importing transactions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-heading-lg font-black text-ink">Smart Scan & Import</h1>
        <p className="text-sm text-ink-muted">AI-powered digital receipt processing and automated CSV/PDF bank imports.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1.5 bg-surface border border-border rounded-xl w-fit mb-8 shadow-primary">
        <button
          onClick={() => { setActiveTab('receipt'); setError(null); setSuccess(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'receipt' ? 'bg-primary text-white shadow-lg shadow-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scan Receipt
        </button>
        <button
          onClick={() => { setActiveTab('csv'); setError(null); setSuccess(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'csv' ? 'bg-primary text-white shadow-lg shadow-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Bank Statement (CSV/PDF)
        </button>
      </div>

      {/* Dynamic Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-800 text-sm font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-success-50 border border-success-100 text-success-800 text-sm font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Upload Panel */}
        <div className="lg:col-span-1">
          <div className="card p-6 bg-surface border border-border flex flex-col gap-6 relative">
            <h2 className="text-heading-sm font-extrabold text-ink">
              {activeTab === 'receipt' ? 'Upload Receipt Image' : 'Select Bank Statement'}
            </h2>

            {activeTab === 'receipt' ? (
              // ── Receipt Upload Area
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleReceiptChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {receiptPreview ? (
                  <div className="relative rounded-xl border border-border overflow-hidden bg-slate-50 group">
                    <img src={receiptPreview} alt="Receipt preview" className="w-full max-h-72 object-contain" />
                    
                    {/* Scanning effect Overlay */}
                    {loading && (
                      <div className="absolute inset-0 bg-indigo-500/10">
                        <motion.div 
                          className="w-full h-1.5 bg-gradient-to-r from-primary to-indigo-400 opacity-80 shadow-[0_0_8px_#6366f1]"
                          animate={{ y: [0, 280, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-3 py-1.5 bg-white text-ink text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-lg"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-primary-50/10 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-ink-muted group-hover:text-primary group-hover:bg-primary-50 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-ink mb-0.5">Click or drag image to upload</p>
                      <p className="text-[10px] text-ink-muted">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                )}

                <button
                  disabled={!receiptFile || loading}
                  onClick={triggerScan}
                  className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning with AI...
                    </>
                  ) : (
                    'Scan Receipt & Extract'
                  )}
                </button>
              </div>
            ) : (
              // ── CSV/PDF statement upload area
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  ref={csvInputRef}
                  onChange={handleCsvChange}
                  accept=".csv, .pdf, application/pdf"
                  className="hidden"
                />

                {csvFile ? (
                  <div className="p-4 rounded-xl border border-border bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-ink truncate">{csvFile.name}</p>
                        <p className="text-[10px] text-ink-muted">{(csvFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCsvFile(null)}
                      className="text-ink-muted hover:text-danger p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => csvInputRef.current.click()}
                    className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-primary-50/10 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-ink-muted group-hover:text-primary group-hover:bg-primary-50 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-ink mb-0.5">Click or drag CSV or PDF statement</p>
                      <p className="text-[10px] text-ink-muted">Bank statement CSV or PDF file</p>
                    </div>
                  </div>
                )}

                <button
                  disabled={!csvFile || loading}
                  onClick={triggerCsvParse}
                  className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing statement...
                    </>
                  ) : (
                    'Analyze Bank Statement'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Review Interface */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'receipt' && extractedData && (
              // ── Receipt Review Glass Card
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6 bg-white/70 border border-slate-200/80 backdrop-blur-md shadow-xl flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-heading-sm font-extrabold text-ink">Review Extracted Transaction</h3>
                  <p className="text-xs text-ink-muted">AI extracted the following parameters. Please verify and confirm.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Merchant Name</label>
                    <input
                      type="text"
                      value={extractedData.merchant}
                      onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                      className="px-3.5 py-2.5 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Amount (INR)</label>
                    <input
                      type="number"
                      value={extractedData.amount}
                      onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) || 0 })}
                      className="px-3.5 py-2.5 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Transaction Date</label>
                    <input
                      type="date"
                      value={extractedData.date}
                      onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                      className="px-3.5 py-2.5 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Suggested Category</label>
                    <select
                      value={extractedData.category}
                      onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                      className="px-3.5 py-2.5 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Parsed Note/Memo</label>
                    <textarea
                      value={extractedData.note}
                      onChange={(e) => setExtractedData({ ...extractedData, note: e.target.value })}
                      rows={3}
                      className="px-3.5 py-2.5 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-ink text-xs font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveExpense}
                    className="px-5 py-2 bg-success text-white text-xs font-bold rounded-lg hover:bg-success-600 transition-all shadow-md shadow-success-100"
                  >
                    Save Expense Record
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'csv' && parsedTransactions.length > 0 && (
              // ── CSV Statement Table Review
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6 bg-white/70 border border-slate-200/80 backdrop-blur-md shadow-xl flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-heading-sm font-extrabold text-ink">Review Transactions ({selectedTx.length} selected)</h3>
                    <p className="text-xs text-ink-muted">AI identified column fields and automatically classified categories.</p>
                  </div>
                  <button
                    onClick={handleImportConfirm}
                    disabled={selectedTx.length === 0 || loading}
                    className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md"
                  >
                    {loading ? 'Importing...' : `Confirm Bulk Import (${selectedTx.length})`}
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 px-2 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-8">
                          <input
                            type="checkbox"
                            checked={selectedTx.length === parsedTransactions.length}
                            onChange={() => {
                              if (selectedTx.length === parsedTransactions.length) {
                                setSelectedTx([]);
                              } else {
                                setSelectedTx(parsedTransactions.map((_, i) => i));
                              }
                            }}
                            className="rounded text-primary focus:ring-primary-100"
                          />
                        </th>
                        <th className="py-3 px-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-24">Date</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Description</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-28">Type</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-36">Category</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-24 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTransactions.map((tx, idx) => {
                        const isSelected = selectedTx.includes(idx);
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-xs ${
                              isSelected ? 'bg-primary-50/5' : 'opacity-60'
                            }`}
                          >
                            <td className="py-3 px-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectTx(idx)}
                                className="rounded text-primary focus:ring-primary-100"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="date"
                                value={tx.date}
                                onChange={(e) => handleTxFieldChange(idx, 'date', e.target.value)}
                                className="bg-transparent border-0 p-0 text-xs w-full focus:ring-0 focus:outline-none"
                              />
                            </td>
                            <td className="py-3 px-3 font-semibold text-ink">
                              <input
                                type="text"
                                value={tx.name}
                                onChange={(e) => handleTxFieldChange(idx, 'name', e.target.value)}
                                className="bg-transparent border-0 p-0 text-xs w-full font-semibold text-ink focus:ring-0 focus:outline-none"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={tx.type || 'Regular'}
                                onChange={(e) => handleTxFieldChange(idx, 'type', e.target.value)}
                                className="py-1 px-2 border border-slate-200/80 bg-white rounded-md text-xs w-full focus:ring-1 focus:ring-primary focus:outline-none font-semibold text-ink"
                              >
                                <option value="Regular">Expense</option>
                                <option value="Income">Income</option>
                                <option value="Recurring">Recurring Exp</option>
                                <option value="Personal">Personal Exp</option>
                              </select>
                            </td>
                            <td className="py-3 px-3">
                              {tx.type === 'Income' ? (
                                <span className="text-ink-muted italic text-[11px] px-2">N/A (Income)</span>
                              ) : (
                                <select
                                  value={tx.category || 'Other'}
                                  onChange={(e) => handleTxFieldChange(idx, 'category', e.target.value)}
                                  className="py-1 px-2 border border-slate-200/80 bg-white rounded-md text-xs w-full focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                  {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-ink">
                              <input
                                type="number"
                                value={tx.amount}
                                onChange={(e) => handleTxFieldChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-0 p-0 text-xs text-right font-bold text-ink w-full focus:ring-0 focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {!extractedData && parsedTransactions.length === 0 && (
              // ── Empty Preview State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center p-8 bg-slate-50/20"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-ink-muted mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-ink mb-1">Preview Scanned / Uploaded Data</h3>
                <p className="text-xs text-ink-muted max-w-sm">
                  Upload a receipt image or drag in a bank CSV statement to begin AI parsing. The resulting transaction mapping will appear here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Import;
