import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AiChatBubble, { TypingIndicator, InsightCard } from '../components/AiChatBubble';
import { aiApi } from '../services/api';

const SUGGESTED_PROMPTS = [
  { emoji: '💸', text: 'How much did I spend on food?' },
  { emoji: '📊', text: 'Where am I wasting money?' },
  { emoji: '📅', text: 'Compare this month with last month' },
  { emoji: '🔮', text: 'Can I afford a ₹50,000 purchase?' },
  { emoji: '🔄', text: 'Show all my subscriptions' },
  { emoji: '💡', text: 'How can I save ₹10,000 this month?' },
  { emoji: '📈', text: 'Which month was my worst?' },
  { emoji: '🏪', text: 'What are my most visited merchants?' },
];

const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    aiApi.getChatHistory(50)
      .then(history => {
        if (history.length > 0) {
          setMessages(history.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })));
          setShowInsights(false);
        }
      })
      .catch(() => {}); // Silently handle if backend not running
  }, []);

  // Load insights
  useEffect(() => {
    setInsightsLoading(true);
    aiApi.getInsights()
      .then(data => setInsights(data.insights || []))
      .catch(() => {})
      .finally(() => setInsightsLoading(false));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    setInput('');
    setShowInsights(false);

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await aiApi.chat(msg);

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.answer,
        relevantExpenses: result.relevantExpenses,
        stats: result.stats,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: err.response?.data?.error
          || '⚠️ **Could not reach the server.** Make sure the backend is running:\n\n```\ncd server && npm run dev\n```',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleClearChat = async () => {
    try {
      await aiApi.clearHistory();
    } catch {}
    setMessages([]);
    setShowInsights(true);
  };

  return (
    <main className="min-h-screen bg-surface-50 bg-mesh relative pt-6 pb-20">
      <div className="container-app max-w-4xl">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h1 className="text-heading-lg text-ink">AI Assistant</h1>
              <p className="text-caption mt-0.5">Ask anything about your finances</p>
            </div>
          </div>

          {messages.length > 0 && (
            <motion.button
              onClick={handleClearChat}
              className="btn-ghost btn-sm text-xs gap-1.5"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Chat
            </motion.button>
          )}
        </motion.div>

        {/* Chat Container */}
        <motion.div
          className="card overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-1">
            <AnimatePresence mode="popLayout">
              {/* Welcome / Insights */}
              {showInsights && messages.length === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-ink mb-2">
                    Hi! I'm your <span className="text-gradient-primary">Financial AI</span>
                  </h2>
                  <p className="text-body max-w-md mx-auto mb-6">
                    Ask me anything about your expenses — spending patterns, budget advice, comparisons, or savings tips.
                  </p>

                  {/* Smart Insights */}
                  {insights.length > 0 && (
                    <div className="mb-8 max-w-lg mx-auto">
                      <p className="text-overline mb-3">🧠 Smart Insights</p>
                      <div className="space-y-2 text-left">
                        {insights.map((insight, i) => (
                          <InsightCard key={i} insight={insight} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Prompts */}
                  <p className="text-overline mb-3">Try asking</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <motion.button
                        key={i}
                        onClick={() => sendMessage(prompt.text)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-surface
                                   hover:border-primary/30 hover:bg-primary-50/50 text-left text-sm text-ink-muted
                                   hover:text-ink transition-all duration-150 group"
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                      >
                        <span className="text-base flex-shrink-0">{prompt.emoji}</span>
                        <span className="truncate group-hover:text-primary transition-colors">{prompt.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Chat Messages */}
              {messages.map(msg => (
                <AiChatBubble key={msg.id} message={msg} isUser={msg.role === 'user'} />
              ))}

              {/* Typing Indicator */}
              {isLoading && <TypingIndicator />}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-surface">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about your expenses..."
                  className="input pr-10 h-11 text-sm bg-surface-50"
                  disabled={isLoading}
                />
                {input.trim() && (
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn-primary h-11 w-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0
                           disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.92 }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </motion.button>
            </form>

            <p className="text-[10px] text-ink-subtle mt-2 text-center">
              Powered by Gemini AI · Your data stays on your device
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AiChat;
