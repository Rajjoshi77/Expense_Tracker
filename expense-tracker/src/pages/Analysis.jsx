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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-semibold text-ink mb-1">{label || payload[0].name}</p>
        <p className="font-bold text-primary">
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomCashflowTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-semibold text-ink mb-1">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ color: p.color }} className="font-bold">
            {p.name}: ₹{p.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analysis = ({ expenses, incomes = [] }) => {
  const { totalExpenses, totalIncome, netSavings, savingsRate, byType, byCategory } = useMemo(() => {
    let tExp = 0;
    const tMap = { Recurring: 0, Regular: 0, Personal: 0 };
    const cMap = {};

    expenses.forEach(exp => {
      tExp += exp.amount;
      if (exp.type) tMap[exp.type] = (tMap[exp.type] || 0) + exp.amount;
      else tMap['Regular'] = (tMap['Regular'] || 0) + exp.amount; // fallback
      
      cMap[exp.category] = (cMap[exp.category] || 0) + exp.amount;
    });

    const tInc = incomes.reduce((s, i) => s + i.amount, 0);
    const net = tInc - tExp;
    const rate = tInc > 0 ? (net / tInc) * 100 : 0;

    const typeData = Object.entries(tMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    const catData = Object.entries(cMap).map(([name, value]) => {
      const catConfig = CATEGORIES.find(c => c.value === name);
      return { name: catConfig?.label || name, value, fill: catConfig?.color || '#cbd5e1' };
    }).sort((a,b) => b.value - a.value);

    return { totalExpenses: tExp, totalIncome: tInc, netSavings: net, savingsRate: rate, byType: typeData, byCategory: catData };
  }, [expenses, incomes]);

  const cashflowTrend = useMemo(() => {
    const dailyMap = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      d.setHours(0,0,0,0);
      const ts = d.getTime();
      dailyMap[ts] = (dailyMap[ts] || 0) - e.amount;
    });
    incomes.forEach(i => {
      const d = new Date(i.date);
      d.setHours(0,0,0,0);
      const ts = d.getTime();
      dailyMap[ts] = (dailyMap[ts] || 0) + i.amount;
    });

    const sortedDays = Object.entries(dailyMap)
      .map(([ts, delta]) => ({ ts: Number(ts), delta }))
      .sort((a, b) => a.ts - b.ts);

    const trendData = [];
    let cumSavings = 0;
    for (const day of sortedDays) {
      cumSavings += day.delta;
      trendData.push({
        ts: day.ts,
        amount: parseFloat(cumSavings.toFixed(2)),
        date: new Date(day.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return trendData;
  }, [expenses, incomes]);

  const monthlyCashflow = useMemo(() => {
    const monthlyMap = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[mKey]) monthlyMap[mKey] = { mKey, label, Income: 0, Expenses: 0 };
      monthlyMap[mKey].Expenses += e.amount;
    });
    incomes.forEach(i => {
      const d = new Date(i.date);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[mKey]) monthlyMap[mKey] = { mKey, label, Income: 0, Expenses: 0 };
      monthlyMap[mKey].Income += i.amount;
    });

    return Object.values(monthlyMap)
      .sort((a, b) => a.mKey.localeCompare(b.mKey))
      .map(item => ({
        ...item,
        Income: parseFloat(item.Income.toFixed(2)),
        Expenses: parseFloat(item.Expenses.toFixed(2))
      }));
  }, [expenses, incomes]);


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
            Deep dive into your cashflow and spending habits. Visualize income streams, track monthly savings, and analyze category breakdowns.
          </p>
        </motion.div>

        {/* Core Cashflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card p-6 bg-gradient-to-br from-success-500 to-emerald-700 text-white shadow-success-100 shadow-md">
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Incomes</h3>
            <p className="text-3xl font-bold">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card p-6 bg-gradient-to-br from-danger-500 to-rose-700 text-white shadow-danger-100 shadow-md">
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Expenses</h3>
            <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className={`card p-6 border-l-4 ${netSavings >= 0 ? 'border-success-500 bg-success-50/10' : 'border-danger-500 bg-danger-50/10'}`}>
            <h3 className="text-sm font-medium text-ink-muted mb-1">Net Savings</h3>
            <p className={`text-3xl font-bold ${netSavings >= 0 ? 'text-success-600' : 'text-danger'}`}>
              {netSavings < 0 ? '-' : ''}₹{Math.abs(netSavings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="card p-6 bg-white border-border border">
            <h3 className="text-sm font-medium text-ink-muted mb-1">Savings Rate</h3>
            <p className={`text-3xl font-bold ${savingsRate >= 15 ? 'text-success-600' : savingsRate >= 0 ? 'text-primary' : 'text-danger'}`}>
              {savingsRate.toFixed(1)}%
            </p>
          </motion.div>
        </div>

        {/* Row 1: Cashflow Comparison & Savings Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Cashflow Comparison (Bar Chart) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-heading-sm mb-6">Income vs Expenses (Monthly)</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCashflow} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomCashflowTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cumulative Savings Trend (Line Chart) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-heading-sm mb-6">Net Savings Cumulative Trend</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashflowTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomCashflowTooltip />} />
                  <Line type="monotone" dataKey="amount" name="Balance" stroke="#4F46E5" strokeWidth={3} dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 0, fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Expenses by Category & Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart: Expenses by Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-heading-sm mb-6">Expenses by Category</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                    {byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart: Expenses by Type */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-heading-sm mb-6">Expenses by Type</h3>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
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
                    <p className="text-[10px] text-ink-muted uppercase tracking-widest">Total Spent</p>
                    <p className="text-lg font-bold text-ink">₹{totalExpenses.toFixed(0)}</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  );
};

export default Analysis;
