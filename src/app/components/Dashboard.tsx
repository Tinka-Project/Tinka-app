import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, ChevronDown, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useApp, Sale } from '../contexts/AppContext';
import { formatBs } from '../utils/currency';
import { BankSyncCard } from './banksync/BankSyncCard';
import { useOfflineDetection } from '../hooks/useOfflineDetection';
import { toast } from 'sonner';

type Period = 'today' | 'week' | 'month';

interface Props {
  onOpenSettings: () => void;
}

const PAYMENT_ICONS: Record<string, string> = {
  cash: '💵',
  qr: '📱',
  transfer: '🏦',
  card: '💳',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  qr: 'QR',
  transfer: 'Transfer.',
  card: 'Tarjeta',
};

const LOCATION_ICONS: Record<string, string> = {
  store: '🏪',
  fair: '🏕️',
  delivery: '🛵',
  online: '💻',
};

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo;
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function filterByPeriod(sales: Sale[], period: Period) {
  if (period === 'today') return sales.filter(s => isToday(s.date));
  if (period === 'week') return sales.filter(s => isThisWeek(s.date));
  return sales.filter(s => isThisMonth(s.date));
}

function filterByPrevPeriod(sales: Sale[], period: Period) {
  if (period === 'today') {
    return sales.filter(s => {
      const d = new Date(s.date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return d.toDateString() === yesterday.toDateString();
    });
  }
  if (period === 'week') {
    return sales.filter(s => {
      const d = new Date(s.date);
      const now = new Date();
      const start = new Date(now); start.setDate(now.getDate() - 14);
      const end = new Date(now); end.setDate(now.getDate() - 7);
      return d >= start && d < end;
    });
  }
  return sales.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
  });
}

// ── Category long-press modal ─────────────────────────────────────────────────

interface CatWithTotal {
  id: string;
  name: string;
  emoji: string;
  color: string;
  salesGoal: number;
  total: number;
}

function CategoryModal({
  category,
  onClose,
  onUpdateGoal,
}: {
  category: CatWithTotal;
  onClose: () => void;
  onUpdateGoal: (catId: string, newGoal: number) => void;
}) {
  const [tab, setTab] = useState<'expense' | 'goal'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveExpense = () => {
    if (!amount) return;
    toast.success(`💸 Gasto registrado: -${formatBs(parseFloat(amount))}`, {
      description: `${category.emoji} ${category.name}${description ? ' · ' + description : ''}`,
      duration: 7000,
    });
    onClose();
  };

  const handleSaveGoal = () => {
    if (!amount) return;
    onUpdateGoal(category.id, parseFloat(amount));
    toast.success(`🎯 Presupuesto actualizado: ${formatBs(parseFloat(amount))}`, {
      description: `${category.emoji} ${category.name}`,
      duration: 5000,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26 }}
        className="w-full bg-[#18181b] rounded-t-3xl"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: category.color + '22' }}
            >
              {category.emoji}
            </div>
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                Meta: {formatBs(category.salesGoal)} · Vendido: {formatBs(category.total)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-5 mb-5">
          <button
            onClick={() => setTab('expense')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === 'expense' ? '#ef4444' : '#27272a',
              color: tab === 'expense' ? 'white' : '#a1a1aa',
            }}
          >
            💸 Gasto
          </button>
          <button
            onClick={() => setTab('goal')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === 'goal' ? category.color : '#27272a',
              color: tab === 'goal' ? 'white' : '#a1a1aa',
            }}
          >
            🎯 Presupuesto
          </button>
        </div>

        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#27272a] border border-border">
            <span className="text-muted-foreground text-sm">Bs.</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="flex-1 bg-transparent text-2xl font-bold text-foreground outline-none"
            />
          </div>

          {tab === 'expense' && (
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full px-4 py-3 rounded-2xl bg-[#27272a] border border-border text-foreground text-sm outline-none focus:border-[#d946ef]"
            />
          )}

          <div className="grid grid-cols-4 gap-2">
            {(tab === 'expense' ? [100, 300, 500, 1000] : [1000, 2000, 3000, 5000]).map(v => (
              <button
                key={v}
                onClick={() => setAmount(v.toString())}
                className="py-2 rounded-xl bg-[#27272a] text-xs font-medium text-muted-foreground"
              >
                {v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={tab === 'expense' ? handleSaveExpense : handleSaveGoal}
            disabled={!amount}
            className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
            style={{
              background: tab === 'expense'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : `linear-gradient(135deg, ${category.color}, #9333ea)`,
            }}
          >
            {tab === 'expense' ? 'Registrar Gasto' : 'Actualizar Presupuesto'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard({ onOpenSettings }: Props) {
  const { user, sales, categories, setCategories } = useApp();
  const [period, setPeriod] = useState<Period>('today');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [longPressedCat, setLongPressedCat] = useState<CatWithTotal | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useOfflineDetection();

  const selectedCategories = useMemo(() => categories.filter(c => c.selected), [categories]);

  const periodSales = useMemo(() => filterByPeriod(sales, period), [sales, period]);
  const prevPeriodSales = useMemo(() => filterByPrevPeriod(sales, period), [sales, period]);

  const totalRevenue = useMemo(() => periodSales.reduce((s, t) => s + t.amount, 0), [periodSales]);
  const prevRevenue = useMemo(() => prevPeriodSales.reduce((s, t) => s + t.amount, 0), [prevPeriodSales]);

  const percentChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const isUp = percentChange >= 0;

  const salesByCategory = useMemo(() => {
    return selectedCategories.map(cat => {
      const catSales = periodSales.filter(s => s.categoryId === cat.id);
      const total = catSales.reduce((s, t) => s + t.amount, 0);
      return { ...cat, total, count: catSales.length };
    }).filter(c => c.total > 0 || selectedCategories.length <= 4);
  }, [selectedCategories, periodSales]);

  const paymentTotals = useMemo(() => {
    const map: Record<string, number> = {};
    periodSales.forEach(s => { map[s.paymentMethod] = (map[s.paymentMethod] ?? 0) + s.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [periodSales]);

  const recentSales = useMemo(() => sales.slice(0, 6), [sales]);

  const periodLabels: Record<Period, string> = { today: 'Hoy', week: 'Esta semana', month: 'Este mes' };

  const handlePressStart = (cat: CatWithTotal) => {
    pressTimerRef.current = setTimeout(() => setLongPressedCat(cat), 2000);
  };
  const handlePressEnd = () => {
    if (pressTimerRef.current) { clearTimeout(pressTimerRef.current); pressTimerRef.current = null; }
  };
  const handleUpdateGoal = (catId: string, newGoal: number) => {
    setCategories(categories.map(c => c.id === catId ? { ...c, salesGoal: newGoal } : c));
  };

  return (
    <div className="flex flex-col bg-background min-h-screen pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground"
            >
              ¡Hola, {user?.name ?? 'Emprendedora'}! 👋
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-1"
            >
              <span className="text-xs px-2.5 py-1 rounded-full border font-medium"
                style={{ borderColor: '#d946ef55', backgroundColor: '#d946ef11', color: '#d946ef' }}>
                Comunidad Tinka 🏅
              </span>
            </motion.div>
          </div>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border"
          >
            <Settings size={18} className="text-muted-foreground" />
          </motion.button>
        </div>

        {/* Period selector */}
        <div className="relative inline-block">
          <button
            onClick={() => setIsPeriodOpen(v => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <ChevronDown size={14} />
            {periodLabels[period]}
          </button>
          <AnimatePresence>
            {isPeriodOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="absolute left-0 top-full mt-2 z-30 w-44 bg-card rounded-2xl border border-border overflow-hidden shadow-xl"
              >
                {(['today', 'week', 'month'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setIsPeriodOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${period === p ? 'text-[#d946ef] bg-[#d946ef]/10' : 'text-foreground hover:bg-muted'}`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Total revenue */}
        <motion.div key={period} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total Ventas</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-foreground leading-none">
              {formatBs(totalRevenue)}
            </span>
            {prevRevenue > 0 && (
              <div className={`flex items-center gap-1 mb-1 text-sm font-medium ${isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(percentChange).toFixed(0)}% vs anterior
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {periodSales.length} venta{periodSales.length !== 1 ? 's' : ''} registrada{periodSales.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Payment method pills */}
        {paymentTotals.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {paymentTotals.map(([method, amount]) => (
              <div
                key={method}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium"
              >
                <span>{PAYMENT_ICONS[method]}</span>
                <span className="text-muted-foreground">{PAYMENT_LABELS[method]}</span>
                <span className="text-foreground font-semibold">{formatBs(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Category bars (Barras.jpeg design) ───────────────────────────────── */}
      {salesByCategory.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Por categoría</p>
            <p className="text-[10px] text-muted-foreground">Mantén 2s para gestionar</p>
          </div>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(salesByCategory.length, 4)}, 1fr)` }}
          >
            {salesByCategory.slice(0, 4).map((cat, index) => {
              // Bar height relative to goal (not max category)
              const barPct = cat.salesGoal > 0
                ? Math.min((cat.total / cat.salesGoal) * 100, 100)
                : 0;

              const exceeds60 = cat.salesGoal > 0 && cat.total >= cat.salesGoal * 0.6;
              const exceededGoal = cat.salesGoal > 0 && cat.total > cat.salesGoal;
              const isLow = cat.salesGoal > 0 && cat.total < cat.salesGoal * 0.6 && cat.total > 0;
              const achievedPct = cat.salesGoal > 0 ? Math.round((cat.total / cat.salesGoal) * 100) : 0;

              // Card background: light tint of category color; red if low performer
              const cardBg = isLow ? '#ef444410' : cat.color + '14';
              // Bar color: red if low, green if exceeded, else category color
              const barColor = isLow ? '#ef4444' : exceededGoal ? '#10b981' : cat.color;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  onMouseDown={() => handlePressStart(cat)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(cat)}
                  onTouchEnd={handlePressEnd}
                  onTouchCancel={handlePressEnd}
                  className="flex flex-col items-center rounded-2xl p-3 cursor-pointer select-none"
                  style={{ backgroundColor: cardBg, height: '192px' }}
                >
                  {/* Emoji + name — fixed top section */}
                  <span className="text-2xl mb-1 flex-shrink-0">{cat.emoji}</span>
                  <p className="text-[10px] text-muted-foreground text-center mb-2 truncate w-full leading-tight flex-shrink-0">
                    {cat.name}
                  </p>

                  {/* Bar with dashed goal outline — flex-1 so all cards same height */}
                  <div className="w-full flex-1 relative min-h-0">
                    {/* Dashed rectangle = goal boundary. Shown only when ≥60% */}
                    {exceeds60 && (
                      <div
                        className="absolute inset-0 rounded-xl border-2 border-dashed"
                        style={{ borderColor: cat.color + '80' }}
                      />
                    )}

                    {/* Filled bar — grows from bottom */}
                    {cat.total > 0 && (
                      <motion.div
                        initial={{ height: '0%' }}
                        animate={{ height: `${Math.max(barPct, 6)}%` }}
                        transition={{ duration: 0.9, delay: index * 0.07 + 0.15, ease: [0.34, 1.2, 0.64, 1] }}
                        className="absolute bottom-0 rounded-xl"
                        style={{
                          left: exceeds60 ? '3px' : '0px',
                          right: exceeds60 ? '3px' : '0px',
                          backgroundColor: barColor,
                        }}
                      />
                    )}

                    {/* Empty state */}
                    {cat.total === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground">—</span>
                      </div>
                    )}
                  </div>

                  {/* Fixed-height bottom info — always same space so all cards align */}
                  <div className="mt-2 flex flex-col items-center flex-shrink-0" style={{ height: '36px', justifyContent: 'flex-start' }}>
                    <p
                      className="text-[11px] font-bold text-center leading-tight"
                      style={{ color: isLow ? '#ef4444' : barColor }}
                    >
                      {cat.total > 0 ? formatBs(cat.total) : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {cat.salesGoal > 0 && cat.total > 0 ? `${achievedPct}%` : ' '}
                    </p>
                    <p className="text-[9px] text-[#10b981] font-semibold leading-tight" style={{ visibility: exceededGoal ? 'visible' : 'hidden' }}>
                      ✓ meta
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No sales state */}
      {periodSales.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 px-8 text-center text-muted-foreground"
        >
          <span className="text-4xl mb-4">📱</span>
          <p className="font-medium mb-1">Sin ventas {periodLabels[period].toLowerCase()}</p>
          <p className="text-sm">Usa el micrófono para registrar tu primera venta</p>
        </motion.div>
      )}

      {/* BancaMovil FIE sync card */}
      <BankSyncCard />

      {/* Recent sales */}
      <div className="px-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Últimas ventas</p>
        <div className="space-y-2">
          {recentSales.map((sale, index) => {
            const cat = categories.find(c => c.id === sale.categoryId);
            const date = new Date(sale.date);
            const timeStr = date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
            const dateStr = isToday(sale.date) ? `Hoy ${timeStr}` : date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-card"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: (cat?.color ?? '#8b5cf6') + '22' }}
                >
                  {cat?.emoji ?? '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{sale.product}</p>
                    {sale.autoDetected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#d946ef]/15 text-[#d946ef] flex-shrink-0">
                        Auto 🤖
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{PAYMENT_ICONS[sale.paymentMethod]} {PAYMENT_LABELS[sale.paymentMethod]}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs text-muted-foreground">{LOCATION_ICONS[sale.location]}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#10b981] flex-shrink-0">
                  +{formatBs(sale.amount)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Category long-press modal */}
      <AnimatePresence>
        {longPressedCat && (
          <CategoryModal
            category={longPressedCat}
            onClose={() => setLongPressedCat(null)}
            onUpdateGoal={handleUpdateGoal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
