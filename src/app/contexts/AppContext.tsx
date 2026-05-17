import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PaymentMethod = 'cash' | 'qr' | 'transfer' | 'card';
export type SaleLocation = 'store' | 'fair' | 'delivery' | 'online';

export interface Sale {
  id: string;
  product: string;
  amount: number;
  paymentMethod: PaymentMethod;
  location: SaleLocation;
  categoryId: string;
  date: string;
  autoDetected?: boolean;
}

// Egreso / Transacción: consume el presupuesto de una categoría
export interface Expense {
  id: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  categoryId: string;
  date: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  selected: boolean;
  // Límite mensual de gasto/inversión para esta categoría (presupuesto de egresos).
  // Se sigue llamando salesGoal por compatibilidad con consumidores existentes.
  salesGoal: number;
}

export interface User {
  name: string;
  email: string;
  tinkaScore: number;
  monthlySalesGoal: number;
}

interface AppContextValue {
  user: User | null;
  isLoggedIn: boolean;
  sales: Sale[];           // Entradas (ingresos)
  expenses: Expense[];     // Transacciones (egresos)
  categories: ProductCategory[];
  login: (email: string) => void;
  logout: () => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  setCategories: (cats: ProductCategory[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// Catálogo por defecto. Las 4 categorías del mockup vienen pre-seleccionadas con sus
// presupuestos exactos para que el dashboard cargue con el estado de la imagen de referencia
// (Computadoras 62%, Accesorios 64%, Celulares 42%, Gaming sobrepasado).
// El color de cada categoría es una preferencia del emprendedor (no un indicador
// de tier ni de salud presupuestaria). Las 4 categorías del mockup llevan pastel
// luminoso por defecto para que las barras se vean bien sobre el fondo oscuro.
export const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: '1', name: 'Celulares',     emoji: '📱', color: '#cce868', selected: true,  salesGoal: 40000 },
  { id: '2', name: 'Accesorios',    emoji: '🎧', color: '#efe1c1', selected: true,  salesGoal: 50000 },
  { id: '3', name: 'Computadoras',  emoji: '💻', color: '#7dd3fc', selected: true,  salesGoal: 70000 },
  { id: '4', name: 'Periféricos',   emoji: '🖱️', color: '#f59e0b', selected: false, salesGoal: 1500 },
  { id: '5', name: 'Reparación TI', emoji: '🔧', color: '#ef4444', selected: false, salesGoal: 2500 },
  { id: '6', name: 'Gaming',        emoji: '🎮', color: '#f8b1bf', selected: true,  salesGoal: 15000 },
  { id: '7', name: 'Electrónica',   emoji: '⚡', color: '#06b6d4', selected: false, salesGoal: 1500 },
];

const DEMO_USER: User = {
  name: 'Hugo',
  email: 'hugo@tinka.bo',
  tinkaScore: 78,
  monthlySalesGoal: 15000,
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(8 + Math.random() * 10), Math.floor(Math.random() * 59));
  return d.toISOString();
}

function buildMockExpenses(cats: ProductCategory[]): Expense[] {
  // Resolución de ids por nombre (fallback al primer seleccionado por si falta alguno).
  const findId = (name: string, fallbackIdx = 0) =>
    cats.find(c => c.name === name)?.id ?? cats[fallbackIdx]?.id ?? String(fallbackIdx + 1);

  const compId = findId('Computadoras', 0);
  const accId  = findId('Accesorios',   1);
  const celId  = findId('Celulares',    2);
  const gamId  = findId('Gaming',       3);

  return [
    // ── Computadoras — Presupuesto 70.000 / Gastado 43.400 (62%) — 5 registros ────
    { id: 'e-c1', description: 'Laptop Lenovo ThinkPad E14',  amount: 12000, paymentMethod: 'transfer', categoryId: compId, date: daysAgo(0) },
    { id: 'e-c2', description: 'Laptop HP Pavilion 15',        amount: 9500,  paymentMethod: 'transfer', categoryId: compId, date: daysAgo(0) },
    { id: 'e-c3', description: 'Laptop Dell Inspiron 3520',    amount: 8400,  paymentMethod: 'transfer', categoryId: compId, date: daysAgo(0) },
    { id: 'e-c4', description: 'Laptop Acer Aspire 5',         amount: 7000,  paymentMethod: 'card',     categoryId: compId, date: daysAgo(0) },
    { id: 'e-c5', description: 'Laptop Lenovo IdeaPad Slim 3', amount: 6500,  paymentMethod: 'transfer', categoryId: compId, date: daysAgo(0) },

    // ── Accesorios — Presupuesto 50.000 / Gastado 32.000 (64%) — 6 registros ──────
    { id: 'e-a1', description: 'Lote audífonos Bluetooth (x20)',  amount: 7500, paymentMethod: 'transfer', categoryId: accId, date: daysAgo(0) },
    { id: 'e-a2', description: 'Cargadores y cables al por mayor', amount: 5200, paymentMethod: 'cash',    categoryId: accId, date: daysAgo(0) },
    { id: 'e-a3', description: 'Fundas y vidrios templados (lote)', amount: 4800, paymentMethod: 'cash',   categoryId: accId, date: daysAgo(0) },
    { id: 'e-a4', description: 'Mouse y teclados gamer (x10)',     amount: 6000, paymentMethod: 'transfer', categoryId: accId, date: daysAgo(0) },
    { id: 'e-a5', description: 'Parlantes Bluetooth Sony (x6)',    amount: 4500, paymentMethod: 'transfer', categoryId: accId, date: daysAgo(0) },
    { id: 'e-a6', description: 'Hubs USB-C (x12)',                 amount: 4000, paymentMethod: 'qr',       categoryId: accId, date: daysAgo(0) },

    // ── Celulares — Presupuesto 40.000 / Gastado 16.800 (42%) — 3 registros ───────
    { id: 'e-p1', description: 'Samsung Galaxy A54 (x2)',  amount: 6400, paymentMethod: 'transfer', categoryId: celId, date: daysAgo(0) },
    { id: 'e-p2', description: 'Xiaomi Redmi Note 12 (x3)', amount: 6000, paymentMethod: 'transfer', categoryId: celId, date: daysAgo(0) },
    { id: 'e-p3', description: 'iPhone 12 reacondicionado',  amount: 4400, paymentMethod: 'card',    categoryId: celId, date: daysAgo(0) },

    // ── Gaming — Presupuesto 15.000 / Gastado 16.000 (107% — sobrepasado) — 12 ────
    { id: 'e-g1',  description: 'Mando PS5 DualSense',          amount: 1500, paymentMethod: 'card',     categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g2',  description: 'Volante gaming Logitech G29',  amount: 2000, paymentMethod: 'transfer', categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g3',  description: 'Auriculares HyperX Cloud',     amount: 1400, paymentMethod: 'qr',       categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g4',  description: 'Silla gaming económica',       amount: 2200, paymentMethod: 'transfer', categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g5',  description: 'Teclado mecánico RGB',         amount: 1200, paymentMethod: 'cash',     categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g6',  description: 'Mouse pad XL gamer',           amount: 700,  paymentMethod: 'cash',     categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g7',  description: 'Joystick Xbox Wireless',       amount: 1100, paymentMethod: 'qr',       categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g8',  description: 'Webcam streaming Logitech',    amount: 1100, paymentMethod: 'card',     categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g9',  description: 'Micrófono USB Fifine',         amount: 800,  paymentMethod: 'cash',     categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g10', description: 'Lámpara RGB ambiente gamer',   amount: 500,  paymentMethod: 'cash',     categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g11', description: 'Soporte VESA brazo monitor',   amount: 600,  paymentMethod: 'qr',       categoryId: gamId, date: daysAgo(0) },
    { id: 'e-g12', description: 'Capturadora HDMI Elgato',      amount: 2900, paymentMethod: 'transfer', categoryId: gamId, date: daysAgo(0) },
  ];
}

function buildMockSales(cats: ProductCategory[]): Sale[] {
  const findId = (name: string, fallbackIdx = 0) =>
    cats.find(c => c.name === name)?.id ?? cats[fallbackIdx]?.id ?? String(fallbackIdx + 1);

  const compId = findId('Computadoras', 0);
  const accId  = findId('Accesorios',   1);
  const celId  = findId('Celulares',    2);
  const gamId  = findId('Gaming',       3);

  return [
    // Hoy — entradas reales que alimentan Total Ventas
    { id: 's1', product: 'Laptop HP Pavilion 15',    amount: 7500, paymentMethod: 'transfer', location: 'store',    categoryId: compId, date: daysAgo(0) },
    { id: 's2', product: 'Audífonos Bluetooth JBL',  amount: 280,  paymentMethod: 'cash',     location: 'store',    categoryId: accId,  date: daysAgo(0) },
    { id: 's3', product: 'Samsung Galaxy A54',       amount: 1800, paymentMethod: 'qr',       location: 'store',    categoryId: celId,  date: daysAgo(0) },
    { id: 's4', product: 'Mando PS5 DualSense',      amount: 650,  paymentMethod: 'cash',     location: 'fair',     categoryId: gamId,  date: daysAgo(0) },

    // Ayer
    { id: 's5', product: 'Laptop Lenovo IdeaPad',    amount: 6200, paymentMethod: 'transfer', location: 'delivery', categoryId: compId, date: daysAgo(1) },
    { id: 's6', product: 'Cargador inalámbrico Qi',  amount: 120,  paymentMethod: 'qr',       location: 'store',    categoryId: accId,  date: daysAgo(1) },
    { id: 's7', product: 'Xiaomi Redmi Note 12',     amount: 1450, paymentMethod: 'qr',       location: 'fair',     categoryId: celId,  date: daysAgo(1) },

    // Hace 2 días
    { id: 's8', product: 'iPhone 14 128GB',          amount: 4200, paymentMethod: 'transfer', location: 'delivery', categoryId: celId,  date: daysAgo(2) },
    { id: 's9', product: 'Teclado mecánico gamer',   amount: 450,  paymentMethod: 'qr',       location: 'store',    categoryId: gamId,  date: daysAgo(2), autoDetected: true },

    // Esta semana
    { id: 's10', product: 'Laptop Dell Inspiron',    amount: 5800, paymentMethod: 'transfer', location: 'store',    categoryId: compId, date: daysAgo(4) },
    { id: 's11', product: 'Parlante Bluetooth Sony', amount: 380,  paymentMethod: 'cash',     location: 'store',    categoryId: accId,  date: daysAgo(5) },
    { id: 's12', product: 'Motorola Moto G84',       amount: 1320, paymentMethod: 'qr',       location: 'store',    categoryId: celId,  date: daysAgo(7) },
    { id: 's13', product: 'Volante gaming Logitech', amount: 980,  paymentMethod: 'transfer', location: 'delivery', categoryId: gamId,  date: daysAgo(9), autoDetected: true },
  ];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const selected = categories.filter(c => c.selected);
    if (selected.length > 0 && sales.length === 0) {
      setSales(buildMockSales(selected));
    }
    if (selected.length > 0 && expenses.length === 0) {
      setExpenses(buildMockExpenses(selected));
    }
  }, [categories, sales.length, expenses.length]);

  const login = (email: string) => {
    setUser({ ...DEMO_USER, email });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setSales([]);
    setExpenses([]);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);
    setUser(prev => prev ? { ...prev, tinkaScore: Math.min(100, prev.tinkaScore + 1) } : prev);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e_${Date.now()}`,
      date: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        sales,
        expenses,
        categories,
        login,
        logout,
        addSale,
        addExpense,
        setCategories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
