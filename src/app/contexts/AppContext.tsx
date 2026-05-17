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

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: '1', name: 'Celulares', emoji: '📱', color: '#3b82f6', selected: false, salesGoal: 3000 },
  { id: '2', name: 'Accesorios', emoji: '🎧', color: '#8b5cf6', selected: false, salesGoal: 2000 },
  { id: '3', name: 'Computadoras', emoji: '💻', color: '#10b981', selected: false, salesGoal: 4000 },
  { id: '4', name: 'Periféricos', emoji: '🖱️', color: '#f59e0b', selected: false, salesGoal: 1500 },
  { id: '5', name: 'Reparación TI', emoji: '🔧', color: '#ef4444', selected: false, salesGoal: 2500 },
  { id: '6', name: 'Gaming', emoji: '🎮', color: '#d946ef', selected: false, salesGoal: 2000 },
  { id: '7', name: 'Electrónica', emoji: '⚡', color: '#06b6d4', selected: false, salesGoal: 1500 },
];

const DEMO_USER: User = {
  name: 'María',
  email: 'maria@tinka.bo',
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
  const celId = cats.find(c => c.name === 'Celulares')?.id ?? cats[0]?.id ?? '1';
  const accId = cats.find(c => c.name === 'Accesorios')?.id ?? cats[1]?.id ?? '2';
  const repId = cats.find(c => c.name === 'Reparación TI')?.id ?? cats[2]?.id ?? '3';

  return [
    { id: 'e1', description: 'Compra stock Samsung A54 (x2)', amount: 2200, paymentMethod: 'transfer', categoryId: celId, date: daysAgo(0) },
    { id: 'e2', description: 'Cargadores y cables al por mayor', amount: 380,  paymentMethod: 'cash',     categoryId: accId, date: daysAgo(0) },
    { id: 'e3', description: 'Pantallas iPhone (repuestos)',    amount: 1450, paymentMethod: 'transfer', categoryId: repId, date: daysAgo(1) },
    { id: 'e4', description: 'Audífonos JBL (lote)',            amount: 650,  paymentMethod: 'cash',     categoryId: accId, date: daysAgo(2) },
    { id: 'e5', description: 'Repuestos placas madre',          amount: 980,  paymentMethod: 'transfer', categoryId: repId, date: daysAgo(3) },
    { id: 'e6', description: 'Xiaomi Redmi mayorista (x3)',     amount: 3200, paymentMethod: 'transfer', categoryId: celId, date: daysAgo(5) },
    { id: 'e7', description: 'Stock fundas y vidrios',          amount: 420,  paymentMethod: 'cash',     categoryId: accId, date: daysAgo(8) },
  ];
}

function buildMockSales(cats: ProductCategory[]): Sale[] {
  const celId = cats.find(c => c.name === 'Celulares')?.id ?? cats[0]?.id ?? '1';
  const accId = cats.find(c => c.name === 'Accesorios')?.id ?? cats[1]?.id ?? '2';
  const repId = cats.find(c => c.name === 'Reparación TI')?.id ?? cats[2]?.id ?? '3';

  return [
    // Hoy
    { id: 's1',  product: 'Samsung Galaxy A54',         amount: 1800, paymentMethod: 'qr',       location: 'store',    categoryId: celId, date: daysAgo(0) },
    { id: 's2',  product: 'Funda + Vidrio templado',    amount: 85,   paymentMethod: 'cash',     location: 'store',    categoryId: accId, date: daysAgo(0) },
    { id: 's3',  product: 'Reparación pantalla iPhone', amount: 350,  paymentMethod: 'transfer', location: 'store',    categoryId: repId, date: daysAgo(0) },
    // Ayer
    { id: 's4',  product: 'Xiaomi Redmi Note 12',       amount: 1450, paymentMethod: 'qr',       location: 'fair',     categoryId: celId, date: daysAgo(1) },
    { id: 's5',  product: 'Audífonos Bluetooth JBL',    amount: 280,  paymentMethod: 'cash',     location: 'store',    categoryId: accId, date: daysAgo(1) },
    { id: 's6',  product: 'Cable USB-C 2m',             amount: 45,   paymentMethod: 'cash',     location: 'store',    categoryId: accId, date: daysAgo(1) },
    { id: 's7',  product: 'Cambio batería Samsung',     amount: 150,  paymentMethod: 'cash',     location: 'store',    categoryId: repId, date: daysAgo(1) },
    // Hace 2 días
    { id: 's8',  product: 'iPhone 14 128GB',            amount: 4200, paymentMethod: 'transfer', location: 'delivery', categoryId: celId, date: daysAgo(2) },
    { id: 's9',  product: 'Cargador inalámbrico Qi',    amount: 120,  paymentMethod: 'qr',       location: 'store',    categoryId: accId, date: daysAgo(2) },
    { id: 's10', product: 'Instalación Windows + Office', amount: 80, paymentMethod: 'cash',     location: 'online',   categoryId: repId, date: daysAgo(2) },
    // Hace 3–5 días
    { id: 's11', product: 'Samsung Galaxy A34 5G',      amount: 1650, paymentMethod: 'qr',       location: 'fair',     categoryId: celId, date: daysAgo(3) },
    { id: 's12', product: 'Parlante Bluetooth Sony',    amount: 380,  paymentMethod: 'cash',     location: 'store',    categoryId: accId, date: daysAgo(3) },
    { id: 's13', product: 'Reparación placa madre',     amount: 420,  paymentMethod: 'transfer', location: 'store',    categoryId: repId, date: daysAgo(4) },
    { id: 's14', product: 'Tecno Spark 20',             amount: 980,  paymentMethod: 'qr',       location: 'delivery', categoryId: celId, date: daysAgo(4), autoDetected: true },
    { id: 's15', product: 'Mouse Gamer + Alfombrilla',  amount: 220,  paymentMethod: 'cash',     location: 'store',    categoryId: accId, date: daysAgo(5) },
    // Semana pasada
    { id: 's16', product: 'Fundas silicona (x3)',       amount: 90,   paymentMethod: 'cash',     location: 'fair',     categoryId: accId, date: daysAgo(7) },
    { id: 's17', product: 'Motorola Moto G84',          amount: 1320, paymentMethod: 'qr',       location: 'store',    categoryId: celId, date: daysAgo(8) },
    { id: 's18', product: 'Configuración router WiFi',  amount: 70,   paymentMethod: 'cash',     location: 'online',   categoryId: repId, date: daysAgo(9) },
    { id: 's19', product: 'Laptop Lenovo IdeaPad',      amount: 3800, paymentMethod: 'transfer', location: 'delivery', categoryId: celId, date: daysAgo(10) },
    { id: 's20', product: 'Teclado mecánico RGB',       amount: 450,  paymentMethod: 'qr',       location: 'store',    categoryId: accId, date: daysAgo(11) },
    { id: 's21', product: 'Xiaomi 13 Lite',             amount: 2800, paymentMethod: 'transfer', location: 'delivery', categoryId: celId, date: daysAgo(12), autoDetected: true },
    { id: 's22', product: 'Protectores pantalla (x5)',  amount: 75,   paymentMethod: 'cash',     location: 'fair',     categoryId: accId, date: daysAgo(14) },
    { id: 's23', product: 'Formateo + antivirus',       amount: 60,   paymentMethod: 'cash',     location: 'store',    categoryId: repId, date: daysAgo(15) },
    { id: 's24', product: 'iPhone 12 Pro 256GB',        amount: 3500, paymentMethod: 'qr',       location: 'fair',     categoryId: celId, date: daysAgo(18) },
    { id: 's25', product: 'Cámara web Full HD Logitech', amount: 290, paymentMethod: 'transfer', location: 'delivery', categoryId: accId, date: daysAgo(20) },
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
