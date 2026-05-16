import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, PanInfo } from 'motion/react';
import { Plus, Mic, Settings, ChevronDown, Smartphone } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { AddTransaction } from './AddTransaction';
import { SettingsPanel } from './SettingsPanel';
import { WidgetDemo } from './WidgetDemo';
import { AgentProfile, OnChainAgentPanel, WalletProfile } from './OnChainAgentPanel';
import { formatBs, roundToCurrencyStep } from '../utils/currency';

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  spent: number;
  budget: number;
}

interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'necessary' | 'impulse' | 'unknown';
}

type PeriodFilter = 'current' | 'previous' | 'last30' | 'all';
type ExpenseFilter = 'all' | 'necessary' | 'impulse';

interface Props {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

function getBudgetRangeByCategory(name: string) {
  const normalized = name.toLowerCase();
  if (/hogar|alquiler|casa|vivienda/.test(normalized)) return [900, 2400];
  if (/comida|super|mercado|restaur|almuerzo|desayuno/.test(normalized)) return [400, 1200];
  if (/transporte|gasolina|movilidad|taxi|pasaje/.test(normalized)) return [180, 700];
  if (/salud|farmacia|m[eé]dico/.test(normalized)) return [140, 550];
  if (/educaci[oó]n|curso|estudio/.test(normalized)) return [180, 800];
  if (/ocio|entretenimiento|salidas|fiesta|cine/.test(normalized)) return [130, 600];
  return [180, 900];
}

function generateRealisticBudget(categoryName: string) {
  const [min, max] = getBudgetRangeByCategory(categoryName);
  const randomValue = min + Math.random() * (max - min);
  return roundToCurrencyStep(randomValue, 10);
}

function generateRealisticSpent(budget: number) {
  const regularSpent = budget * (0.42 + Math.random() * 0.38);
  const occasionalOverrun = budget * (1.03 + Math.random() * 0.18);
  const spent = Math.random() < 0.17 ? occasionalOverrun : regularSpent;
  return roundToCurrencyStep(spent, 5);
}

function shiftDateMonths(baseDate: Date, monthDelta: number, dayOffset = 0) {
  const shifted = new Date(baseDate);
  shifted.setMonth(shifted.getMonth() + monthDelta);
  shifted.setDate(shifted.getDate() + dayOffset);
  return shifted;
}

function createSampleTransactions(categories: Category[]): Transaction[] {
  const now = new Date();
  const findCategory = (pattern: RegExp, fallbackIndex: number) =>
    categories.find((category) => pattern.test(category.name.toLowerCase())) || categories[fallbackIndex] || categories[0];

  const food = findCategory(/comida|mercado|super|almuerzo|desayuno/, 0);
  const clothing = findCategory(/ropa|vest/, 1);
  const transport = findCategory(/transporte|movilidad|taxi|pasaje|gasolina/, 2);
  const ocio = findCategory(/ocio|salidas|cine|fiesta|entretenimiento/, 3);

  return [
    food && { id: 'sample-1', categoryId: food.id, amount: 86, description: 'Almuerzo semanal', date: shiftDateMonths(now, 0, -3), type: 'necessary' as const },
    clothing && { id: 'sample-2', categoryId: clothing.id, amount: 200, description: 'Ropa', date: shiftDateMonths(now, 0, -8), type: 'impulse' as const },
    transport && { id: 'sample-3', categoryId: transport.id, amount: 45, description: 'Taxi nocturno', date: shiftDateMonths(now, -1, -5), type: 'impulse' as const },
    ocio && { id: 'sample-4', categoryId: ocio.id, amount: 120, description: 'Salida con amigos', date: shiftDateMonths(now, -1, -12), type: 'impulse' as const },
  ].filter(Boolean) as Transaction[];
}

function isSameMonth(dateA: Date, dateB: Date) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
}

function isPreviousMonth(date: Date, referenceDate: Date) {
  const previousMonth = new Date(referenceDate);
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  return isSameMonth(date, previousMonth);
}

export function Dashboard({ categories: initialCategories, onUpdateCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.filter((c: any) => c.selected).map((c: any) => ({
      ...c,
      budget: generateRealisticBudget(c.name),
      spent: 0,
    })).map((c: any) => ({
      ...c,
      spent: generateRealisticSpent(c.budget),
    }))
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWidgetDemo, setShowWidgetDemo] = useState(false);
  const [showOnChainPanel, setShowOnChainPanel] = useState(false);
  const [isTargetFlashing, setIsTargetFlashing] = useState(false);
  const [syncEvent, setSyncEvent] = useState<{ hash: string; isImpulse: boolean } | null>(null);
  const [activeWalletId, setActiveWalletId] = useState('wallet-main');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('current');
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>('all');
  const [categoryFilterId, setCategoryFilterId] = useState<string | null>(null);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    onUpdateCategories(categories);
  }, [categories, onUpdateCategories]);

  useEffect(() => {
    if (transactions.length === 0 && categories.length > 0) {
      setTransactions(createSampleTransactions(categories));
    }
  }, [categories, transactions.length]);

  useEffect(() => {
    if (!syncEvent) return;
    const timer = window.setTimeout(() => setSyncEvent(null), 3200);
    return () => window.clearTimeout(timer);
  }, [syncEvent]);

  useEffect(() => {
    if (!isTargetFlashing) return;
    const timer = window.setTimeout(() => setIsTargetFlashing(false), 650);
    return () => window.clearTimeout(timer);
  }, [isTargetFlashing]);

  const buildMockHash = () => {
    const left = Math.random().toString(16).slice(2, 10);
    const right = Math.random().toString(16).slice(2, 10);
    return `0x${left}${right}`;
  };

  const referenceDate = new Date();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesPeriod =
      periodFilter === 'all'
        ? true
        : periodFilter === 'current'
          ? isSameMonth(transaction.date, referenceDate)
          : periodFilter === 'previous'
            ? isPreviousMonth(transaction.date, referenceDate)
            : transaction.date >= new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const matchesExpenseType = expenseFilter === 'all' ? true : transaction.type === expenseFilter;
    const matchesCategory = categoryFilterId ? transaction.categoryId === categoryFilterId : true;

    return matchesPeriod && matchesExpenseType && matchesCategory;
  });

  const visibleCategories = categories.map((category) => ({
    ...category,
    spent: filteredTransactions
      .filter((transaction) => transaction.categoryId === category.id)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  })).filter((category) => (categoryFilterId ? category.id === categoryFilterId : true));

  const totalSpent = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalBudget = visibleCategories.reduce((sum, category) => sum + category.budget, 0);

  const handleCategoryPress = (categoryId: string, deltaY: number) => {
    if (deltaY < -50) {
      setSelectedCategoryId(categoryId);
      setShowAddTransaction(true);
    } else if (deltaY > 50) {
      setSelectedCategoryId(categoryId);
    }
  };

  const addTransaction = (categoryId: string, amount: number, description: string) => {
    const lowerDescription = description.toLowerCase();
    const impulseKeywords = ['antojo', 'capricho', 'delivery', 'snack', 'postre', 'compra'];
    const transactionType: Transaction['type'] = impulseKeywords.some((keyword) => lowerDescription.includes(keyword))
      ? 'impulse'
      : 'necessary';

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      categoryId,
      amount,
      description,
      date: new Date(),
      type: transactionType,
    };

    const mockHash = buildMockHash();

    setTransactions(prev => [...prev, newTransaction]);
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, spent: cat.spent + amount } : cat
      )
    );
    setSyncEvent({ hash: mockHash, isImpulse: transactionType === 'impulse' });
    setIsTargetFlashing(true);
    setShowAddTransaction(false);
    setShowVoiceInput(false);
  };

  const agentId = '0x4ndf18...drs';
  const nightTransactions = transactions.filter(t => {
    const hour = t.date.getHours();
    return hour >= 21 || hour <= 5;
  }).length;
  const freelanceSignals = transactions.filter(t =>
    /cliente|factura|freelance|servicio/i.test(t.description)
  ).length;
  const impulseTransactions = transactions.filter(t => t.type === 'impulse').length;
  const savingsRatio = totalBudget > 0 ? (totalBudget - totalSpent) / totalBudget : 0;
  const isDisciplined = savingsRatio >= 0.2 && impulseTransactions <= 2;
  const savingsStreak = categories.filter(cat => cat.spent <= cat.budget * 0.75).length;
  const evolutionLevel = Math.min(8, Math.max(1, 1 + savingsStreak + Math.floor(Math.max(0, savingsRatio) * 3)));
  const agentProfile: AgentProfile =
    nightTransactions >= 3
      ? 'Gastador Nocturno'
      : freelanceSignals >= 2
        ? 'Freelancer'
        : savingsRatio >= 0.3 && impulseTransactions <= 1
          ? 'Ahorrador'
          : 'Balanceado';
  const wallets: WalletProfile[] = [
    {
      id: 'wallet-main',
      name: 'Arkive Vault Primary',
      address: '0x4ndf18c9a7b2e1f4',
      network: 'Sidechain Neural L2',
      balance: 4280.75,
      lastSync: 'Hace 3 min',
      status: 'Active',
    },
    {
      id: 'wallet-bond',
      name: 'Travel Reserve',
      address: '0xa9c71f2d4e8b92c0',
      network: 'Sidechain Neural L2',
      balance: 1260.2,
      lastSync: 'Hace 1 h',
      status: 'Standby',
    },
    {
      id: 'wallet-cold',
      name: 'Archive Wallet',
      address: '0xf4b2107c3e6d81aa',
      network: 'Cold Storage Vault',
      balance: 9850,
      lastSync: 'Ayer',
      status: 'Cold',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground mb-1"
            >
              {periodFilter === 'current' && 'Este mes'}
              {periodFilter === 'previous' && 'Mes anterior'}
              {periodFilter === 'last30' && 'Últimos 30 días'}
              {periodFilter === 'all' && 'Todo el historial'}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-medium"
            >
              {formatBs(totalSpent)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              de {formatBs(totalBudget)}
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                boxShadow: isTargetFlashing
                  ? ['0 0 0px rgba(34,211,238,0.25)', '0 0 24px rgba(34,211,238,0.5)', '0 0 0px rgba(34,211,238,0.25)']
                  : '0 0 0px rgba(34,211,238,0.18)',
              }}
              transition={{ delay: 0.25, duration: isTargetFlashing ? 0.6 : 0.3 }}
              onClick={() => setShowOnChainPanel(true)}
              className="relative h-12 w-12 rounded-full border border-cyan-300/35 bg-[radial-gradient(circle_at_35%_30%,rgba(165,243,252,0.22),rgba(14,116,144,0.25)_38%,rgba(6,10,18,0.9)_75%)] flex items-center justify-center"
              aria-label="Abrir The Neural Vault"
            >
              <motion.span
                animate={{ opacity: [0.25, 0.65, 0.25], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.1, repeat: Infinity }}
                className="pointer-events-none absolute inset-1 rounded-full border border-cyan-200/30"
              />
              <motion.span
                animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.95, 0.45] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="pointer-events-none h-4 w-4 rounded-full bg-cyan-100/85"
              />
              {isTargetFlashing && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute inset-0 rounded-full bg-cyan-300/30"
                />
              )}
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowSettings(true)}
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center"
              aria-label="Abrir ajustes"
            >
              <Settings size={20} className="text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 rounded-full bg-card text-sm flex items-center gap-2"
              onClick={() => {
                setIsMonthMenuOpen((value) => !value);
                setIsFilterMenuOpen(false);
              }}
            >
              <ChevronDown size={16} />
              {periodFilter === 'current' && 'Este mes'}
              {periodFilter === 'previous' && 'Mes anterior'}
              {periodFilter === 'last30' && '30 días'}
              {periodFilter === 'all' && 'Todo'}
            </motion.button>

            <AnimatePresence>
              {isMonthMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xl"
                >
                  {[
                    { id: 'current', label: 'Este mes' },
                    { id: 'previous', label: 'Mes anterior' },
                    { id: 'last30', label: 'Últimos 30 días' },
                    { id: 'all', label: 'Todo el historial' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setPeriodFilter(option.id as PeriodFilter);
                        setIsMonthMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${periodFilter === option.id ? 'bg-cyan-300/10 text-cyan-100' : 'hover:bg-white/5'}`}
                    >
                      <span>{option.label}</span>
                      {periodFilter === option.id && <span className="text-xs">Activo</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="px-4 py-2 rounded-full bg-card text-sm flex items-center gap-2"
              onClick={() => {
                setIsFilterMenuOpen((value) => !value);
                setIsMonthMenuOpen(false);
              }}
            >
              <ChevronDown size={16} />
              Filtrar
            </motion.button>

            <AnimatePresence>
              {isFilterMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xl"
                >
                  <div className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Tipo de gasto
                  </div>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'necessary', label: 'Necesarios' },
                    { id: 'impulse', label: 'Impulsivos' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setExpenseFilter(option.id as ExpenseFilter);
                        setIsFilterMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${expenseFilter === option.id ? 'bg-cyan-300/10 text-cyan-100' : 'hover:bg-white/5'}`}
                    >
                      <span>{option.label}</span>
                      {expenseFilter === option.id && <span className="text-xs">Activo</span>}
                    </button>
                  ))}

                  <div className="my-1 h-px bg-border" />

                  <div className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Categoría
                  </div>
                  <button
                    onClick={() => {
                      setCategoryFilterId(null);
                      setIsFilterMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${categoryFilterId === null ? 'bg-cyan-300/10 text-cyan-100' : 'hover:bg-white/5'}`}
                  >
                    <span>Todas</span>
                    {categoryFilterId === null && <span className="text-xs">Activo</span>}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setCategoryFilterId(category.id);
                        setIsFilterMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${categoryFilterId === category.id ? 'bg-cyan-300/10 text-cyan-100' : 'hover:bg-white/5'}`}
                    >
                      <span>{category.name}</span>
                      {categoryFilterId === category.id && <span className="text-xs">Activo</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {(periodFilter !== 'current' || expenseFilter !== 'all' || categoryFilterId) && (
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-cyan-100/80">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1">
              Periodo: {periodFilter === 'current' ? 'Este mes' : periodFilter === 'previous' ? 'Mes anterior' : periodFilter === 'last30' ? 'Últimos 30 días' : 'Todo'}
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1">
              Tipo: {expenseFilter === 'all' ? 'Todos' : expenseFilter === 'necessary' ? 'Necesarios' : 'Impulsivos'}
            </span>
            {categoryFilterId && (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1">
                Categoría: {categories.find((category) => category.id === categoryFilterId)?.name}
              </span>
            )}
            <button
              onClick={() => {
                setPeriodFilter('current');
                setExpenseFilter('all');
                setCategoryFilterId(null);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="mb-4 flex min-h-8 justify-end">
          {syncEvent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-cyan-300/30 bg-[#0d1520] px-3 py-2 text-right"
            >
              <div className="text-xs text-cyan-200">Sincronizando con Sidechain...</div>
              <div className="text-[11px] font-mono text-cyan-100/70">{syncEvent.hash}</div>
              {syncEvent.isImpulse && (
                <div className="mt-1 max-w-xs text-[11px] text-cyan-50/85">
                  Tu registro hist\u00f3rico on-chain sugiere que este gasto es emocional. \u00bfDeseas firmar esta transacci\u00f3n?
                </div>
              )}
            </motion.div>
          )}
        </div>

        {visibleCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-64 flex flex-col items-center justify-center text-muted-foreground"
          >
            <p className="mb-2">No hay datos para este filtro</p>
            <p className="text-sm">Prueba otro periodo o limpia los filtros.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 gap-4 h-96 mb-8">
            {visibleCategories.map((category, index) => {
              const Icon = category.icon;
              const percentage = (category.spent / category.budget) * 100;
              const isWarning = percentage > 60 && percentage <= 100;
              const isExceeded = percentage > 100;
              const excessAmount = isExceeded ? category.spent - category.budget : 0;

              return (
                <CategoryColumn
                  key={category.id}
                  category={category}
                  percentage={percentage}
                  isWarning={isWarning}
                  isExceeded={isExceeded}
                  excessAmount={excessAmount}
                  index={index}
                  onPress={handleCategoryPress}
                />
              );
            })}
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowHistory(!showHistory)}
          className="w-full text-center text-muted-foreground text-sm mb-6"
        >
          {showHistory ? 'Ocultar historial' : 'Ver historial'}
        </motion.button>

        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground">No hay transacciones aún</p>
            ) : (
              filteredTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                if (!category) return null;
                const Icon = category.icon;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color + '33' }}
                    >
                      <Icon size={24} style={{ color: category.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">{category.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatBs(transaction.amount, true)}</div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-6 flex items-center justify-center gap-4">
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setShowAddTransaction(true)}
          className="w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-lg"
        >
          <Plus size={24} className="text-foreground" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowVoiceInput(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff9f43] to-[#ff6b6b] flex items-center justify-center shadow-lg"
        >
          <Mic size={28} className="text-background" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowWidgetDemo(true)}
          className="w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-lg"
        >
          <Smartphone size={24} className="text-foreground" />
        </motion.button>
      </div>

      {showVoiceInput && (
        <VoiceInput
          categories={categories}
          onClose={() => setShowVoiceInput(false)}
          onAddTransaction={addTransaction}
        />
      )}

      {showAddTransaction && (
        <AddTransaction
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onClose={() => {
            setShowAddTransaction(false);
            setSelectedCategoryId(null);
          }}
          onAddTransaction={addTransaction}
        />
      )}

      {showSettings && (
        <SettingsPanel
          categories={categories}
          onClose={() => setShowSettings(false)}
          onUpdateCategories={setCategories}
        />
      )}

      {showWidgetDemo && (
        <WidgetDemo
          categories={categories}
          onClose={() => setShowWidgetDemo(false)}
        />
      )}

      <OnChainAgentPanel
        open={showOnChainPanel}
        onClose={() => setShowOnChainPanel(false)}
        profile={agentProfile}
        agentId={agentId}
        evolutionLevel={evolutionLevel}
        savingsStreak={savingsStreak}
        isDisciplined={isDisciplined}
        lastHash={syncEvent?.hash ?? null}
        wallets={wallets}
        activeWalletId={activeWalletId}
        onWalletChange={setActiveWalletId}
      />
    </div>
  );
}

function CategoryColumn({ category, percentage, isWarning, isExceeded, excessAmount, index, onPress }: any) {
  const Icon = category.icon;
  const y = useMotionValue(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    onPress(category.id, info.offset.y);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex flex-col"
    >
      {isExceeded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-0 right-0 text-center"
        >
          <div className="text-xs text-[#ff9f43] font-medium">
            +{formatBs(excessAmount)}
          </div>
        </motion.div>
      )}

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="flex-1 relative rounded-3xl bg-card p-3 flex flex-col items-center cursor-grab active:cursor-grabbing"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
          style={{ backgroundColor: category.color + '33' }}
        >
          <Icon size={20} style={{ color: category.color }} />
        </div>

        <div className="text-xs text-center mb-2 text-muted-foreground line-clamp-2">
          {category.name}
        </div>

        <div className="flex-1 w-full relative">
          {isWarning && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 border-t-2 border-dashed"
              style={{ borderColor: category.color }}
            />
          )}

          {isExceeded && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 border-t-2 border-dashed"
              style={{ borderColor: category.color }}
            />
          )}

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-full flex flex-col justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
              className="w-full rounded-full"
              style={{ backgroundColor: category.color }}
            />
          </div>
        </div>

        <div className="text-xs mt-2 font-medium">
          {percentage.toFixed(0)}%
        </div>
      </motion.div>
    </motion.div>
  );
}
