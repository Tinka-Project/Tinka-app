import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Star, Phone, ChevronRight, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SupplierEvalForm } from './SupplierEvalForm';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  emoji: string;
  phone: string;
  rating: number;
  tinkaScore: number;
  totalOrders: number;
  products: string[];
  lastEval?: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: '1', name: 'TechDistrib Bolivia', category: 'Tecnología', emoji: '📱',
    phone: '+591 70112233', rating: 4.8, tinkaScore: 92, totalOrders: 18,
    products: ['Samsung', 'Xiaomi', 'Motorola', 'Tecno'],
  },
  {
    id: '2', name: 'GlobalCell S.A.', category: 'Tecnología', emoji: '🌐',
    phone: '+591 70445566', rating: 4.3, tinkaScore: 87, totalOrders: 12,
    products: ['iPhone', 'iPad', 'Apple Watch'],
    lastEval: '2026-04-15',
  },
  {
    id: '3', name: 'AccesTech Cochabamba', category: 'Accesorios', emoji: '🎧',
    phone: '+591 70778899', rating: 3.9, tinkaScore: 75, totalOrders: 24,
    products: ['Audífonos JBL', 'Cables USB-C', 'Fundas', 'Cargadores'],
  },
  {
    id: '4', name: 'RepuTech Bolivia', category: 'Reparación', emoji: '🔧',
    phone: '+591 70001122', rating: 4.6, tinkaScore: 88, totalOrders: 9,
    products: ['Pantallas LCD/AMOLED', 'Baterías', 'Placas madre', 'Conectores'],
    lastEval: '2026-05-01',
  },
  {
    id: '5', name: 'Gaming Zone Bolivia', category: 'Gaming', emoji: '🎮',
    phone: '+591 70334455', rating: 3.7, tinkaScore: 70, totalOrders: 15,
    products: ['Controles Xbox/PS', 'Auriculares Gaming', 'Mouse Gamer', 'Mousepad'],
  },
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.round(value) ? '#f59e0b' : 'none'}
          stroke={i <= Math.round(value) ? '#f59e0b' : '#3f3f46'}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #27272a 0deg)` }}
      >
        <div className="w-7 h-7 rounded-full bg-[#18181b] flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground mt-0.5">Score</span>
    </div>
  );
}

const CATEGORIES = ['Todos', 'Tecnología', 'Accesorios', 'Reparación', 'Gaming', 'Software'];
const ADD_CATEGORIES = ['Tecnología', 'Accesorios', 'Reparación', 'Gaming', 'Software', 'Electrónica'];

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [evalTarget, setEvalTarget] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Tecnología');
  const [addSuccess, setAddSuccess] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const filtered = suppliers
    .filter(s => {
      const matchesCat = filter === 'Todos' || s.category === filter;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => b.tinkaScore - a.tinkaScore);

  const handleEvalDone = (supplierId: string, rating: number) => {
    setSuppliers(prev => prev.map(s =>
      s.id === supplierId
        ? { ...s, rating, tinkaScore: Math.min(100, s.tinkaScore + 3), lastEval: new Date().toISOString().slice(0, 10) }
        : s
    ));
    setEvalTarget(null);
  };

  const handleAddSupplier = () => {
    if (!newName.trim()) return;
    const newS: Supplier = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      emoji: newCategory === 'Gaming' ? '🎮' : newCategory === 'Accesorios' ? '🎧' : newCategory === 'Reparación' ? '🔧' : '📱',
      phone: '+591 7XXXXXXX',
      rating: 0,
      tinkaScore: 60,
      totalOrders: 0,
      products: [],
    };
    setSuppliers(prev => [newS, ...prev]);
    setAddSuccess(true);
    setTimeout(() => {
      toast.success('✅ Proveedor registrado', {
        description: `${newS.name} · ${newS.category} fue agregado exitosamente`,
        duration: 6000,
      });
      setNewName('');
      setAddSuccess(false);
      setShowAddModal(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col bg-background min-h-screen pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold">Proveedores</h2>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
          >
            <Plus size={18} className="text-white" />
          </motion.button>
        </div>
        <p className="text-sm text-muted-foreground">Gestiona tus proveedores de tecnología</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proveedor..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: filter === cat ? '#d946ef' : '#27272a',
                color: filter === cat ? 'white' : '#a1a1aa',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* IA Recommendation */}
      {filter === 'Todos' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-5 p-4 rounded-2xl border border-[#d946ef]/30 bg-[#d946ef]/8"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🤖</span>
            <div>
              <p className="text-sm font-semibold text-[#d946ef] mb-1">Análisis IA · Recomendación</p>
              <p className="text-sm text-foreground">
                <span className="font-medium">TechDistrib Bolivia</span> ofrece la mejor relación
                costo-calidad para tu próximo pedido de celulares y accesorios (Score: 92/100).
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Supplier cards */}
      <div className="px-5 space-y-3">
        {filtered.map((supplier, index) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#27272a] flex items-center justify-center text-2xl flex-shrink-0">
                {supplier.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm">{supplier.name}</p>
                  {supplier.lastEval && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981]">Evaluado</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{supplier.category} · {supplier.totalOrders} pedidos</p>
                <StarRating value={supplier.rating} />
                <div className="flex gap-1 flex-wrap mt-2">
                  {supplier.products.slice(0, 2).map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272a] text-muted-foreground">{p}</span>
                  ))}
                  {supplier.products.length > 2 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272a] text-muted-foreground">+{supplier.products.length - 2}</span>
                  )}
                </div>
              </div>
              <ScoreBadge score={supplier.tinkaScore} />
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-border">
              <a
                href={`tel:${supplier.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#27272a] text-xs text-muted-foreground"
              >
                <Phone size={12} />
                Llamar
              </a>
              <button
                onClick={() => setEvalTarget(supplier)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
              >
                <Star size={12} />
                Evaluar
                <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm">No se encontraron proveedores</p>
          </div>
        )}
      </div>

      {/* Evaluation form */}
      <AnimatePresence>
        {evalTarget && (
          <SupplierEvalForm
            supplier={evalTarget}
            onClose={() => setEvalTarget(null)}
            onSubmit={(rating) => handleEvalDone(evalTarget.id, rating)}
          />
        )}
      </AnimatePresence>

      {/* Add supplier modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget && !addSuccess) setShowAddModal(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-card rounded-t-3xl p-6"
            >
              <AnimatePresence mode="wait">
                {addSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <Check size={36} className="text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold mb-1">¡Proveedor registrado!</h3>
                    <p className="text-sm text-muted-foreground">{newName} fue agregado a tu red</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" className="space-y-4">
                    <h3 className="font-semibold text-lg">Nuevo Proveedor Tecnológico</h3>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Nombre del proveedor"
                      autoFocus
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground outline-none focus:border-[#d946ef]"
                    />
                    <div className="relative">
                      <p className="text-xs text-muted-foreground mb-2">Categoría de productos</p>
                      <button
                        type="button"
                        onClick={() => setShowCatDropdown(v => !v)}
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-left flex items-center justify-between"
                      >
                        <span>{newCategory}</span>
                        <motion.div animate={{ rotate: showCatDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight size={16} className="text-muted-foreground rotate-90" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {showCatDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                            className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
                          >
                            {ADD_CATEGORIES.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => { setNewCategory(c); setShowCatDropdown(false); }}
                                className="w-full px-4 py-3 text-sm text-left transition-colors flex items-center justify-between"
                                style={{
                                  backgroundColor: newCategory === c ? '#d946ef18' : 'transparent',
                                  color: newCategory === c ? '#d946ef' : '#fafafa',
                                }}
                              >
                                {c}
                                {newCategory === c && <Check size={14} />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={handleAddSupplier}
                      disabled={!newName.trim()}
                      className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
                    >
                      Agregar Proveedor
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
