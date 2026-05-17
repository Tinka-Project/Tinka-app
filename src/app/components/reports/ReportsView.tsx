import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, LabelList,
} from 'recharts';
import { useApp, Sale } from '../../contexts/AppContext';
import { formatBs } from '../../utils/currency';

type Period = 'week' | 'month';

const PAYMENT_COLORS: Record<string, string> = {
  cash: '#10b981',
  qr: '#d946ef',
  transfer: '#3b82f6',
  card: '#f59e0b',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  qr: 'QR',
  transfer: 'Transferencia',
  card: 'Tarjeta',
};

const INITIAL_SHOWN = 5;

function groupByDay(sales: Sale[], days: number) {
  const result: { date: string; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
    const dateStr = d.toDateString();
    const total = sales
      .filter(s => new Date(s.date).toDateString() === dateStr)
      .reduce((sum, s) => sum + s.amount, 0);
    result.push({ date: label, total });
  }
  return result;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl px-3 py-2 text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-[#d946ef] font-semibold">{formatBs(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

function BarTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl px-3 py-2 text-xs">
        <p className="text-foreground font-semibold">{formatBs(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function ReportsView() {
  const { sales, categories } = useApp();
  const [period, setPeriod] = useState<Period>('week');
  const [showAll, setShowAll] = useState(false);

  const days = period === 'week' ? 7 : 30;

  const filteredSales = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return sales.filter(s => new Date(s.date) >= cutoff);
  }, [sales, days]);

  const lineData = useMemo(() => groupByDay(filteredSales, days), [filteredSales, days]);

  const totalRevenue = filteredSales.reduce((s, t) => s + t.amount, 0);
  const avgPerDay = totalRevenue / days;
  const topSale = filteredSales.reduce((max, s) => s.amount > max ? s.amount : max, 0);
  const qrTotal = filteredSales.filter(s => s.paymentMethod === 'qr').reduce((s, t) => s + t.amount, 0);

  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      map[s.paymentMethod] = (map[s.paymentMethod] ?? 0) + s.amount;
    });
    return Object.entries(map).map(([key, value]) => ({
      name: PAYMENT_LABELS[key] ?? key,
      value,
      color: PAYMENT_COLORS[key] ?? '#8b5cf6',
      key,
    }));
  }, [filteredSales]);

  // Show ALL selected categories (even those with 0 sales)
  const categoryData = useMemo(() => {
    const selected = categories.filter(c => c.selected);
    return selected
      .map(cat => {
        const total = filteredSales.filter(s => s.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
        return { name: cat.name, emoji: cat.emoji, total, color: cat.color };
      })
      .sort((a, b) => b.total - a.total);
  }, [filteredSales, categories]);

  const displayedSales = showAll ? filteredSales : filteredSales.slice(0, INITIAL_SHOWN);

  return (
    <div className="flex flex-col bg-background min-h-screen pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h2 className="text-2xl font-bold mb-1">Reportes</h2>
        <p className="text-sm text-muted-foreground">Análisis de tus ventas</p>
      </div>

      {/* Period toggle */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 p-1 bg-card rounded-2xl border border-border">
          {(['week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setShowAll(false); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: period === p ? '#d946ef' : 'transparent',
                color: period === p ? 'white' : '#a1a1aa',
              }}
            >
              {p === 'week' ? 'Esta semana' : 'Este mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Total recaudado', value: formatBs(totalRevenue), icon: '💰', color: '#10b981' },
          { label: 'QR', value: formatBs(qrTotal), icon: '📱', color: '#d946ef' },
          { label: 'Promedio diario', value: formatBs(avgPerDay), icon: '📈', color: '#3b82f6' },
          { label: 'Venta mayor', value: formatBs(topSale), icon: '⭐', color: '#f59e0b' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <span className="text-lg block mb-2">{card.icon}</span>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Area chart — sales over time */}
      <div className="px-5 mb-6">
        <p className="text-sm font-semibold mb-4">Evolución de Ingresos</p>
        <div className="bg-card rounded-2xl border border-border p-4" style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData} margin={{ top: 6, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={period === 'week' ? 1 : 6}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${Math.round(v / 100) * 100}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#d946ef"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#d946ef', stroke: '#09090b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart — payment methods */}
      {paymentData.length > 0 && (
        <div className="px-5 mb-6">
          <p className="text-sm font-semibold mb-4">Métodos de Pago</p>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-4">
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {paymentData.map(entry => (
                        <Cell key={entry.key} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {paymentData.map(entry => {
                  const pct = totalRevenue > 0 ? ((entry.value / totalRevenue) * 100).toFixed(0) : '0';
                  return (
                    <div key={entry.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="text-xs font-semibold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bar chart — by category (all selected categories) */}
      {categoryData.length > 0 && (
        <div className="px-5 mb-6">
          <p className="text-sm font-semibold mb-4">Ventas por Categoría</p>
          <div className="bg-card rounded-2xl border border-border p-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 24, right: 8, left: -20, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis
                  dataKey="emoji"
                  tick={{ fill: '#71717a', fontSize: 16 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v === 0 ? '0' : `${Math.round(v / 100) * 100}`}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#ffffff08', radius: 8 }} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={44}>
                  {categoryData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(v: number) => v > 0 ? `${Math.round(v)}` : ''}
                    style={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction list with Ver más */}
      <div className="px-5">
        <p className="text-sm font-semibold mb-4">Historial de Ventas</p>
        <div className="space-y-2">
          {displayedSales.map((sale, index) => {
            const cat = categories.find(c => c.id === sale.categoryId);
            const date = new Date(sale.date);
            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-card"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: (cat?.color ?? '#8b5cf6') + '22' }}
                >
                  {cat?.emoji ?? '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sale.product}</p>
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-[#10b981]">+{formatBs(sale.amount)}</p>
                  {sale.autoDetected && (
                    <p className="text-[10px] text-[#d946ef]">Auto 🤖</p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {filteredSales.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <span className="text-3xl block mb-3">📊</span>
              <p className="text-sm">Sin ventas en este período</p>
            </div>
          )}
        </div>

        {/* Ver más / Ver menos button */}
        {filteredSales.length > INITIAL_SHOWN && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAll(v => !v)}
            className="w-full mt-3 py-3 rounded-2xl border border-border text-sm text-muted-foreground font-medium"
          >
            {showAll
              ? 'Ver menos'
              : `Ver más (${filteredSales.length - INITIAL_SHOWN} registros más)`}
          </motion.button>
        )}
      </div>
    </div>
  );
}
