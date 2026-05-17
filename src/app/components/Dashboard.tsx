import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Settings, ChevronDown, TrendingUp, TrendingDown, X, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useApp, Sale, PaymentMethod } from '../contexts/AppContext';
import { MovementType } from './AddTransaction';
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

function filterByPeriod<T extends { date: string }>(items: T[], period: Period): T[] {
  if (period === 'today') return items.filter(s => isToday(s.date));
  if (period === 'week') return items.filter(s => isThisWeek(s.date));
  return items.filter(s => isThisMonth(s.date));
}

function formatCompactBs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toFixed(0);
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
  availableCategories,
  onClose,
  onUpdateGoal,
  onRegisterMovement,
}: {
  category: CatWithTotal | null;
  availableCategories: CatWithTotal[];
  onClose: () => void;
  onUpdateGoal: (catId: string, newGoal: number) => void;
  onRegisterMovement: (
    type: MovementType,
    categoryId: string,
    amount: number,
    description: string,
    paymentMethod: PaymentMethod,
  ) => void;
}) {
  // Si no llega categoría preseleccionada (modo botón "+"), el usuario primero la elige.
  const [picked, setPicked] = useState<CatWithTotal | null>(category);
  const [tab, setTab] = useState<'transaction' | 'goal'>('transaction');
  const [movementType, setMovementType] = useState<MovementType>('transaccion');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const isEntrada = movementType === 'entrada';
  const accentColor = isEntrada ? '#10b981' : '#ef4444';

  const handleSaveTransaction = () => {
    if (!amount || !picked) return;
    onRegisterMovement(
      movementType,
      picked.id,
      parseFloat(amount),
      description || (isEntrada ? 'Entrada' : 'Transacción'),
      paymentMethod,
    );
    toast.success(
      `${isEntrada ? '💰 Entrada registrada: +' : '💸 Transacción registrada: -'}${formatBs(parseFloat(amount))}`,
      {
        description: `${picked.emoji} ${picked.name}${description ? ' · ' + description : ''}`,
        duration: 5000,
      },
    );
    onClose();
  };

  const handleSaveGoal = () => {
    if (!amount || !picked) return;
    onUpdateGoal(picked.id, parseFloat(amount));
    toast.success(`🎯 Presupuesto actualizado: ${formatBs(parseFloat(amount))}`, {
      description: `${picked.emoji} ${picked.name}`,
      duration: 5000,
    });
    onClose();
  };

  const PAYMENT_OPTS: { id: PaymentMethod; icon: string; label: string }[] = [
    { id: 'cash',     icon: '💵', label: 'Efectivo' },
    { id: 'qr',       icon: '📱', label: 'QR' },
    { id: 'transfer', icon: '🏦', label: 'Transfer.' },
    { id: 'card',     icon: '💳', label: 'Tarjeta' },
  ];

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
            {picked ? (
              <>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: picked.color + '22' }}
                >
                  {picked.emoji}
                </div>
                <div>
                  <h3 className="font-semibold">{picked.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Presupuesto: {formatBs(picked.salesGoal)} · Gastado: {formatBs(picked.total)}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-semibold">Nuevo movimiento</h3>
                <p className="text-xs text-muted-foreground">Elige una categoría</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <X size={20} />
          </button>
        </div>

        {/* Category picker — sólo cuando no hay categoría preseleccionada */}
        {!picked && (
          <div className="px-5 pb-5">
            <div className="grid grid-cols-4 gap-2">
              {availableCategories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPicked(c)}
                  className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: 'transparent',
                    backgroundColor: c.color + '14',
                  }}
                >
                  <span className="text-2xl leading-none">{c.emoji}</span>
                  <span className="text-[10px] text-center text-muted-foreground leading-tight px-1 truncate w-full">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {picked && (
        <div className="flex gap-2 px-5 mb-5">
          <button
            onClick={() => setTab('transaction')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === 'transaction' ? accentColor : '#27272a',
              color: tab === 'transaction' ? 'white' : '#a1a1aa',
            }}
          >
            💸 Transacción
          </button>
          <button
            onClick={() => setTab('goal')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === 'goal' ? picked.color : '#27272a',
              color: tab === 'goal' ? 'white' : '#a1a1aa',
            }}
          >
            🎯 Presupuesto
          </button>
        </div>
        )}

        {picked && (
        <div className="px-5 pb-8 space-y-4">
          {/* Ingreso / Egreso toggle (sólo en pestaña de transacción) */}
          {tab === 'transaction' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMovementType('entrada')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: isEntrada ? '#10b981' : 'transparent',
                  backgroundColor: isEntrada ? '#10b9811f' : '#27272a',
                  color: isEntrada ? '#10b981' : '#a1a1aa',
                }}
              >
                <ArrowDownCircle size={16} />
                Ingreso
              </button>
              <button
                onClick={() => setMovementType('transaccion')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: !isEntrada ? '#ef4444' : 'transparent',
                  backgroundColor: !isEntrada ? '#ef44441f' : '#27272a',
                  color: !isEntrada ? '#ef4444' : '#a1a1aa',
                }}
              >
                <ArrowUpCircle size={16} />
                Egreso
              </button>
            </div>
          )}

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

          {tab === 'transaction' && (
            <>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                className="w-full px-4 py-3 rounded-2xl bg-[#27272a] border border-border text-foreground text-sm outline-none focus:border-[#d946ef]"
              />

              {/* Método de pago */}
              <div className="grid grid-cols-4 gap-2">
                {PAYMENT_OPTS.map(opt => {
                  const sel = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className="flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 text-[11px] font-medium transition-all"
                      style={{
                        borderColor: sel ? accentColor : 'transparent',
                        backgroundColor: sel ? accentColor + '1f' : '#27272a',
                        color: sel ? accentColor : '#a1a1aa',
                      }}
                    >
                      <span className="text-base leading-none">{opt.icon}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="grid grid-cols-4 gap-2">
            {(tab === 'transaction' ? [100, 300, 500, 1000] : [1000, 2000, 3000, 5000]).map(v => (
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
            onClick={tab === 'transaction' ? handleSaveTransaction : handleSaveGoal}
            disabled={!amount}
            className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
            style={{
              background: tab === 'transaction'
                ? `linear-gradient(135deg, ${accentColor}, ${isEntrada ? '#059669' : '#dc2626'})`
                : `linear-gradient(135deg, ${picked.color}, #9333ea)`,
            }}
          >
            {tab === 'transaction'
              ? (isEntrada ? 'Registrar Ingreso' : 'Registrar Egreso')
              : 'Actualizar Presupuesto'}
          </motion.button>
        </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard({ onOpenSettings }: Props) {
  const { user, sales, expenses, categories, setCategories, addSale, addExpense } = useApp();
  const [period, setPeriod] = useState<Period>('today');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [longPressedCat, setLongPressedCat] = useState<CatWithTotal | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useOfflineDetection();

  const selectedCategories = useMemo(() => categories.filter(c => c.selected), [categories]);

  // Entradas (ingresos)
  const periodSales = useMemo(() => filterByPeriod(sales, period), [sales, period]);
  const prevPeriodSales = useMemo(() => filterByPrevPeriod(sales, period), [sales, period]);
  const totalRevenue = useMemo(() => periodSales.reduce((s, t) => s + t.amount, 0), [periodSales]);
  const prevRevenue = useMemo(() => prevPeriodSales.reduce((s, t) => s + t.amount, 0), [prevPeriodSales]);
  const percentChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const isUp = percentChange >= 0;

  // Transacciones (egresos) — alimentan las barras de presupuesto
  const periodExpenses = useMemo(() => filterByPeriod(expenses, period), [expenses, period]);
  const totalExpenses = useMemo(() => periodExpenses.reduce((s, e) => s + e.amount, 0), [periodExpenses]);

  const expensesByCategory = useMemo(() => {
    return selectedCategories
      .map(cat => {
        const catExp = periodExpenses.filter(e => e.categoryId === cat.id);
        const total = catExp.reduce((s, e) => s + e.amount, 0);
        return { ...cat, total, count: catExp.length };
      })
      // Mostrar TODAS las categorías seleccionadas como columnas (scroll horizontal).
      // Las que aún no tengan egresos muestran su placeholder vacío con el emoji.
      .sort((a, b) => b.total - a.total);
  }, [selectedCategories, periodExpenses]);

  const categoryBarsMax = useMemo(() => {
    if (expensesByCategory.length === 0) return 1;
    return Math.max(
      1,
      ...expensesByCategory.map(c => Math.max(c.total, c.salesGoal || 0)),
    );
  }, [expensesByCategory]);

  // Presupuesto global y Monto Disponible General
  const totalBudget = useMemo(
    () => selectedCategories.reduce((s, c) => s + (c.salesGoal || 0), 0),
    [selectedCategories],
  );
  const montoDisponibleGeneral = totalBudget - totalExpenses;
  const disponiblePct = totalBudget > 0
    ? Math.max(0, Math.min(100, (montoDisponibleGeneral / totalBudget) * 100))
    : 0;

  // Métodos de pago combinan Entradas y Transacciones (spec: ambos se asocian visualmente)
  const paymentTotals = useMemo(() => {
    const map: Record<string, { in: number; out: number }> = {};
    periodSales.forEach(s => {
      const slot = (map[s.paymentMethod] ??= { in: 0, out: 0 });
      slot.in += s.amount;
    });
    periodExpenses.forEach(e => {
      const slot = (map[e.paymentMethod] ??= { in: 0, out: 0 });
      slot.out += e.amount;
    });
    return Object.entries(map)
      .map(([method, v]) => ({ method, ...v, net: v.in - v.out }))
      .sort((a, b) => (b.in + b.out) - (a.in + a.out));
  }, [periodSales, periodExpenses]);

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

  const handleRegisterMovement = (
    type: MovementType,
    categoryId: string,
    movementAmount: number,
    movementDescription: string,
    movementPaymentMethod: PaymentMethod,
  ) => {
    if (type === 'entrada') {
      addSale({
        product: movementDescription,
        amount: movementAmount,
        paymentMethod: movementPaymentMethod,
        location: 'store',
        categoryId,
      });
    } else {
      addExpense({
        description: movementDescription,
        amount: movementAmount,
        paymentMethod: movementPaymentMethod,
        categoryId,
      });
    }
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

        {/* Total Ventas (Entradas) — pulsa cuando entra una nueva venta */}
        <motion.div
          key={`rev-${period}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total Ventas</p>
          <div className="flex items-end gap-3">
            <motion.span
              key={totalRevenue}
              initial={{ scale: 1.08, color: '#10b981' }}
              animate={{ scale: 1, color: '#fafafa' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="text-5xl font-bold leading-none origin-left"
            >
              {formatBs(totalRevenue)}
            </motion.span>
            {prevRevenue > 0 && (
              <div className={`flex items-center gap-1 mb-1 text-sm font-medium ${isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(percentChange).toFixed(0)}% vs anterior
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {periodSales.length} entrada{periodSales.length !== 1 ? 's' : ''} registrada{periodSales.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

      </div>

      {/* ── Egresos por categoría (Barras presupuesto) ───────────────────────────────── */}
      {expensesByCategory.length > 0 && (
        <div className="mb-6 relative">
          {/* Plus button (alternative to long-press category) — minimal icon, no
              background pill so it reads as a quick affordance rather than a FAB. */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowQuickAdd(true)}
            aria-label="Registrar movimiento"
            className="absolute top-3 right-4 z-10 w-9 h-9 flex items-center justify-center"
          >
            <Plus size={26} className="text-white" strokeWidth={2.4} />
          </motion.button>

          {/* Outer dark canvas: full-bleed horizontally (sin margen lateral) para que
              quede al tope con los bordes del celular. Mantiene el padding interno
              generoso para que el glow de las barras no se vea cortado. */}
          <div
            className="rounded-none pt-10 pb-7 px-7"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            <LayoutGroup>
            <div
              className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x proximity',
              }}
            >
            {expensesByCategory.map(cat => {
              const SLOT_HEIGHT = 240;
              const MIN_BAR_HEIGHT = 78;

              const pctOfBudget = cat.salesGoal > 0 ? (cat.total / cat.salesGoal) * 100 : 0;
              const showDashed = cat.salesGoal > 0 && pctOfBudget >= 60;
              const exceededGoal = cat.salesGoal > 0 && pctOfBudget > 100;

              // Tier-based luminous pastel color — cambia en vivo según % presupuesto
              const tierColor = exceededGoal
                ? '#f8b1bf'
                : pctOfBudget >= 60
                  ? '#f9b988'
                  : '#cce868';

              // Alturas proporcionales al máximo global (egreso o presupuesto más alto)
              const rawBarPx = (cat.total / categoryBarsMax) * SLOT_HEIGHT;
              const barHeightPx = cat.total > 0 ? Math.max(MIN_BAR_HEIGHT, rawBarPx) : 0;
              const dashedHeightPx = Math.min(
                SLOT_HEIGHT,
                (cat.salesGoal / categoryBarsMax) * SLOT_HEIGHT,
              );

              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 220, damping: 26 },
                    opacity: { duration: 0.3 },
                    y: { duration: 0.3 },
                  }}
                  onMouseDown={() => handlePressStart(cat)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(cat)}
                  onTouchEnd={handlePressEnd}
                  onTouchCancel={handlePressEnd}
                  className="flex-shrink-0 relative cursor-pointer select-none"
                  style={{
                    width: '28%',
                    minWidth: 92,
                    height: SLOT_HEIGHT,
                    scrollSnapAlign: 'start',
                  }}
                >
                  {/* Dashed budget outline — animado: aparece/desaparece al cruzar 60%,
                      crece/encoge al actualizar presupuesto. */}
                  <AnimatePresence>
                    {showDashed && (
                      <motion.div
                        key="dashed"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: dashedHeightPx, opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                        className="absolute inset-x-0 bottom-0 rounded-2xl border-2 border-dashed pointer-events-none"
                        style={{ borderColor: 'rgba(255,255,255,0.42)' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Filled glowing bar — altura y color de tier animados al instante
                      cuando se registra un nuevo egreso o se cambia el presupuesto. */}
                  {cat.total > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: barHeightPx,
                        backgroundColor: tierColor,
                      }}
                      transition={{
                        height: { type: 'spring', stiffness: 140, damping: 20 },
                        backgroundColor: { duration: 0.45, ease: 'easeOut' },
                      }}
                      className="absolute bottom-0 inset-x-0 rounded-2xl flex flex-col items-center justify-end pb-3 pt-2"
                      style={{
                        boxShadow: `0 0 26px ${tierColor}99, 0 0 50px ${tierColor}44`,
                        transition: 'box-shadow 0.45s ease',
                      }}
                    >
                      <span className="text-2xl leading-none mb-1">{cat.emoji}</span>
                      <p className="text-[11px] font-bold text-black/85 leading-tight">
                        {formatCompactBs(cat.total)}
                      </p>
                      {cat.salesGoal > 0 && (
                        <p className="text-[10px] text-black/65 leading-tight mt-0.5">
                          {Math.round(pctOfBudget)}%
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Empty state placeholder when no spending yet */}
                  {cat.total === 0 && (
                    <div className="absolute inset-x-0 bottom-0 h-[78px] rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                      <span className="text-2xl opacity-50 mb-0.5">{cat.emoji}</span>
                      <span className="text-[10px] text-white/40">—</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
            </div>
            </LayoutGroup>
          </div>
        </div>
      )}

      {/* Payment methods (Entradas + Egresos combinadas) */}
      {paymentTotals.length > 0 && (
        <div className="px-5 mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Métodos de pago
          </p>
          <div className="flex gap-2 flex-wrap">
            {paymentTotals.map(({ method, in: incoming, out: outgoing }) => (
              <div
                key={method}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium"
              >
                <span>{PAYMENT_ICONS[method]}</span>
                <span className="text-muted-foreground">{PAYMENT_LABELS[method]}</span>
                {incoming > 0 && (
                  <span className="text-[#10b981] font-semibold">+{formatBs(incoming)}</span>
                )}
                {outgoing > 0 && (
                  <span className="text-[#ef4444] font-semibold">-{formatBs(outgoing)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monto Disponible General (Presupuesto Restante Global) */}
      {totalBudget > 0 && (
        <motion.div
          key={`disp-${period}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-5 mb-6 p-4 rounded-2xl border"
          style={{
            borderColor: montoDisponibleGeneral >= 0 ? '#10b98155' : '#ef444466',
            backgroundColor: montoDisponibleGeneral >= 0 ? '#10b9811a' : '#ef44441a',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Monto disponible general
            </p>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: montoDisponibleGeneral >= 0 ? '#10b981' : '#ef4444',
                backgroundColor: montoDisponibleGeneral >= 0 ? '#10b98122' : '#ef444422',
              }}
            >
              {Math.round(disponiblePct)}% libre
            </span>
          </div>
          <div className="flex items-end gap-2">
            <motion.span
              key={montoDisponibleGeneral}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="text-3xl font-bold leading-none origin-left"
              style={{ color: montoDisponibleGeneral >= 0 ? '#10b981' : '#ef4444' }}
            >
              {formatBs(Math.max(0, montoDisponibleGeneral))}
            </motion.span>
            <motion.span
              key={`bud-${totalBudget}`}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-muted-foreground mb-1"
            >
              de {formatBs(totalBudget)}
            </motion.span>
          </div>
          {montoDisponibleGeneral < 0 && (
            <p className="text-[11px] text-[#ef4444] mt-1">
              Te pasaste del presupuesto en {formatBs(Math.abs(montoDisponibleGeneral))}
            </p>
          )}
          <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              animate={{
                width: `${disponiblePct}%`,
                backgroundColor: montoDisponibleGeneral >= 0 ? '#10b981' : '#ef4444',
              }}
              transition={{
                width: { type: 'spring', stiffness: 140, damping: 22 },
                backgroundColor: { duration: 0.4, ease: 'easeOut' },
              }}
            />
          </div>
        </motion.div>
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

      {/* Bottom-sheet modal compartido:
          - Long-press 2s en una categoría → category preseleccionada.
          - Botón "+" del header de barras → category = null (muestra picker). */}
      <AnimatePresence>
        {(longPressedCat || showQuickAdd) && (
          <CategoryModal
            category={longPressedCat}
            availableCategories={expensesByCategory}
            onClose={() => {
              setLongPressedCat(null);
              setShowQuickAdd(false);
            }}
            onUpdateGoal={handleUpdateGoal}
            onRegisterMovement={handleRegisterMovement}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
