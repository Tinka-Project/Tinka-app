import { useState } from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight, Plus, Palette } from 'lucide-react';
import { formatBs } from '../utils/currency';

interface Props {
  categories: any[];
  onClose: () => void;
  onUpdateCategories: (categories: any[]) => void;
}

export function SettingsPanel({ categories, onClose, onUpdateCategories }: Props) {
  const [view, setView] = useState<'main' | 'budgets' | 'categories' | 'budget-detail'>('main');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleSaveBudget = () => {
    if (selectedCategoryId && budgetAmount) {
      const updated = categories.map(cat =>
        cat.id === selectedCategoryId
          ? { ...cat, budget: parseFloat(budgetAmount) }
          : cat
      );
      onUpdateCategories(updated);
      setView('budgets');
      setSelectedCategoryId(null);
      setBudgetAmount('');
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="h-full flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-border">
          <h2>
            {view === 'main' && 'Configuración'}
            {view === 'budgets' && 'Presupuestos'}
            {view === 'categories' && 'Editar categorías'}
            {view === 'budget-detail' && selectedCategory?.name}
          </h2>
          <button
            onClick={() => {
              if (view === 'main') {
                onClose();
              } else if (view === 'budget-detail') {
                setView('budgets');
                setSelectedCategoryId(null);
              } else {
                setView('main');
              }
            }}
            className="text-muted-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'main' && (
            <div className="space-y-2">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setView('categories')}
                className="w-full p-4 rounded-2xl bg-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
                    <Palette size={20} className="text-[#10b981]" />
                  </div>
                  <div className="text-left">
                    <div>Editar categorías</div>
                    <div className="text-sm text-muted-foreground">Añade o modifica categorías</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => setView('budgets')}
                className="w-full p-4 rounded-2xl bg-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff9f43]/20 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="text-left">
                    <div>Presupuestos</div>
                    <div className="text-sm text-muted-foreground">Establece límites mensuales</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </motion.button>
            </div>
          )}

          {view === 'budgets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2">
                  <span className="text-sm">⚠️ Alertas de presupuesto</span>
                </label>
                <button className="w-12 h-6 rounded-full bg-[#ff9f43] relative">
                  <motion.div
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white"
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-card/50 mb-6">
                <div className="text-sm text-muted-foreground mb-2">Umbral de alerta</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff9f43]" style={{ width: '90%' }} />
                  </div>
                  <span className="text-sm font-medium">90%</span>
                </div>
              </div>

              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setBudgetAmount(category.budget?.toString() || '');
                      setView('budget-detail');
                    }}
                    className="w-full p-4 rounded-2xl bg-card flex items-center gap-3"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color + '33' }}
                    >
                      <Icon size={24} style={{ color: category.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div>{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.budget ? formatBs(category.budget) : 'Sin presupuesto'}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </motion.button>
                );
              })}
            </div>
          )}

          {view === 'budget-detail' && selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: selectedCategory.color + '33' }}
                >
                  {selectedCategory.icon && (
                    <selectedCategory.icon size={40} style={{ color: selectedCategory.color }} />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Cambiar color del presupuesto
                </label>
                <div className="flex gap-2">
                  {['#10b981', '#3b82f6', '#ff9f43', '#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        const updated = categories.map(cat =>
                          cat.id === selectedCategoryId ? { ...cat, color } : cat
                        );
                        onUpdateCategories(updated);
                      }}
                      className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-offset-background"
                      style={{
                        backgroundColor: color,
                        ringColor: selectedCategory.color === color ? color : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Presupuesto mensual
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">Bs</span>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="0"
                    className="w-full p-4 pl-12 rounded-2xl bg-card border border-border text-foreground text-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[200, 400, 700, 1200, 1800, 2500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBudgetAmount(amount.toString())}
                    className="py-2 rounded-xl bg-card border border-border text-sm"
                  >
                    {formatBs(amount)}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSaveBudget}
                disabled={!budgetAmount}
                className="w-full p-4 rounded-2xl bg-primary text-primary-foreground disabled:opacity-50"
              >
                Guardar presupuesto
              </button>
            </motion.div>
          )}

          {view === 'categories' && (
            <div className="grid grid-cols-3 gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square rounded-3xl bg-card p-4 flex flex-col items-center justify-center gap-2"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Icon size={32} style={{ color: category.color }} />
                    <span className="text-xs text-center">{category.name}</span>
                  </motion.div>
                );
              })}

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: categories.length * 0.05 }}
                className="aspect-square rounded-3xl bg-card flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border"
              >
                <Plus size={32} className="text-muted-foreground" />
                <span className="text-xs text-center text-muted-foreground">Añadir</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
