import { motion } from 'framer-motion';

const INSIGHT_STYLES = {
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: '⚠️',
    text: 'text-amber-800',
    metric: 'text-amber-600',
  },
  tip: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: '💡',
    text: 'text-emerald-800',
    metric: 'text-emerald-600',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'ℹ️',
    text: 'text-blue-800',
    metric: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: '✅',
    text: 'text-green-800',
    metric: 'text-green-600',
  },
};

const AiChatBubble = ({ message, isUser }) => {
  if (isUser) {
    return (
      <motion.div
        className="flex justify-end mb-4"
        initial={{ opacity: 0, y: 10, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-primary text-white text-sm leading-relaxed shadow-lg">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // ── AI Message ──
  return (
    <motion.div
      className="flex justify-start mb-4"
      initial={{ opacity: 0, y: 10, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-white font-bold">AI</span>
          </div>
          <span className="text-[11px] font-medium text-ink-muted">Spendora AI</span>
        </div>

        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-surface border border-border text-sm text-ink leading-relaxed shadow-sm">
          <MarkdownContent content={message.content} />
        </div>

        {/* Relevant expenses */}
        {message.relevantExpenses?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.relevantExpenses.slice(0, 3).map(exp => (
              <div key={exp.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 border border-border text-xs">
                <span className="font-medium text-ink">{exp.name}</span>
                <span className="text-ink-muted">·</span>
                <span className="font-bold text-primary">₹{exp.amount?.toLocaleString('en-IN')}</span>
                <span className="text-ink-muted">·</span>
                <span className="text-ink-subtle">{exp.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Simple Markdown Renderer ──
const MarkdownContent = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1 my-2 ml-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(<h4 key={i} className="font-bold text-ink mt-3 mb-1 text-sm">{trimmed.slice(4)}</h4>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(<h3 key={i} className="font-bold text-ink mt-3 mb-1">{trimmed.slice(3)}</h3>);
      return;
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      inList = true;
      const text = trimmed.replace(/^[-*]\s|^\d+\.\s/, '');
      listItems.push(text);
      return;
    }

    flushList();
    elements.push(
      <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />
    );
  });

  flushList();
  return <>{elements}</>;
};

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-surface-50 text-primary text-xs font-mono">$1</code>')
    .replace(/₹([\d,]+(?:\.\d{2})?)/g, '<span class="font-bold text-primary">₹$1</span>')
    .replace(/↑/g, '<span class="text-red-500">↑</span>')
    .replace(/↓/g, '<span class="text-green-500">↓</span>');
}

// ── Typing Indicator ──
export const TypingIndicator = () => (
  <motion.div
    className="flex justify-start mb-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
        <span className="text-[10px] text-white font-bold">AI</span>
      </div>
      <div className="flex gap-1 px-4 py-3 rounded-2xl bg-surface border border-border">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ── Insight Card ──
export const InsightCard = ({ insight, index }) => {
  const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info;

  return (
    <motion.div
      className={`rounded-xl border p-3.5 ${style.bg}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base flex-shrink-0 mt-0.5">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${style.text}`}>{insight.title}</p>
            {insight.metric && (
              <span className={`text-xs font-bold ${style.metric} flex-shrink-0`}>{insight.metric}</span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${style.text} opacity-80`}>{insight.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AiChatBubble;
