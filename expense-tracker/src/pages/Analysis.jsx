import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { CATEGORIES } from '../data/categories';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const TYPE_COLORS = {
  Recurring: '#8B5CF6',
  Regular: '#3B82F6',
  Personal: '#10B981'
};

const Analysis = ({ expenses }) => {
  const { total, byType, byCategory } = useMemo(() => {
    let t = 0;
    const tMap = { Recurring: 0, Regular: 0, Personal: 0 };
    const cMap = {};
    const dMap = {};

    expenses.forEach(exp => {
      t += exp.amount;
      if (exp.type) tMap[exp.type] = (tMap[exp.type] || 0) + exp.amount;
      else tMap['Regular'] = (tMap['Regular'] || 0) + exp.amount; // fallback
      
      cMap[exp.category] = (cMap[exp.category] || 0) + exp.amount;
      
      const dateKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dMap[dateKey] = (dMap[dateKey] || 0) + exp.amount;
    });

    const typeData = Object.entries(tMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    const catData = Object.entries(cMap).map(([name, value]) => {
      const catConfig = CATEGORIES.find(c => c.value === name);
      return { name: catConfig?.label || name, value, fill: catConfig?.color || '#cbd5e1' };
    }).sort((a,b) => b.value - a.value);

    // Sorting the trend data by actual date using year
    // Since our dateKey is just "May 12", we need to sort using original exp dates or we can just sort by map keys if we kept original dates.
    // Better way: keep full date for sorting, display short date.
    
    return { total: t, byType: typeData, byCategory: catData };
  }, [expenses]);

  const trend = useMemo(() => {
    const dMap = {};
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      d.setHours(0,0,0,0);
      const ts = d.getTime();
      dMap[ts] = (dMap[ts] || 0) + exp.amount;
    });
    return Object.entries(dMap)
      .map(([ts, amount]) => ({
        ts: Number(ts),
        amount,
        date: new Date(Number(ts)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
          <p className="text-sm font-semibold text-ink mb-1">{label || payload[0].name}</p>
          <p className="text-sm text-primary font-bold">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-surface-50 bg-mesh relative pt-10 pb-20">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-heading-lg text-ink mb-3">Financial Analysis</h1>
          <p className="text-body text-ink-muted max-w-xl mx-auto">
            Deep dive into your spending habits. Understand where your money goes across different expense types and categories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-primary">
            <h3 className="text-sm font-medium opacity-80 mb-1">Total Spent</h3>
            <p className="text-3xl font-bold">${total.toFixed(2)}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card p-6 flex flex-col justify-between border-l-4" style={{ borderLeftColor: TYPE_COLORS.Recurring }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.Recurring }} />
              <h3 className="text-sm font-medium text-ink-muted">Recurring Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-ink">${(byType.find(t => t.name === 'Recurring')?.value || 0).toFixed(2)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="card p-6 flex flex-col justify-between border-l-4" style={{ borderLeftColor: TYPE_COLORS.Regular }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.Regular }} />
              <h3 className="text-sm font-medium text-ink-muted">Regular Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-ink">${(byType.find(t => t.name === 'Regular')?.value || 0).toFixed(2)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="card p-6 flex flex-col justify-between border-l-4" style={{ borderLeftColor: TYPE_COLORS.Personal }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.Personal }} />
              <h3 className="text-sm font-medium text-ink-muted">Personal Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-ink">${(byType.find(t => t.name === 'Personal')?.value || 0).toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart: Expenses by Type */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-heading-sm mb-6">Expenses by Type</h3>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                 <div className="text-center">
                    <p className="text-xs text-ink-muted uppercase tracking-widest">Total</p>
                    <p className="text-xl font-bold text-ink">${total.toFixed(0)}</p>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Bar Chart: Expenses by Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-heading-sm mb-6">Expenses by Category</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Line Chart: Spending Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6 h-[400px] flex flex-col">
          <h3 className="text-heading-sm mb-6">Spending Trend</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </main>
  );
};

export default Analysis;
