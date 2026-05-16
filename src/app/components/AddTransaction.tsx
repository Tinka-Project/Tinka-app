import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface Props {
  categories: any[];
  selectedCategoryId: string | null;
  onClose: () => void;
  onAddTransaction: (categoryId: string, amount: number, description: string) => void;
}

export function AddTransaction({ categories, selectedCategoryId, onClose, onAddTransaction }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(selectedCategoryId || categories[0]?.id || '');

  const handleSubmit = () => {
    if (amount && categoryId) {
      onAddTransaction(categoryId, parseFloat(amount), description || 'Gasto');
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <h2>Nueva transacción</h2>
        <button onClick={onClose} className="text-muted-foreground">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Almuerzo, Café, etc."
            className="w-full p-4 rounded-2xl bg-card border border-border text-foreground"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Monto
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">Bs</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 pl-12 rounded-2xl bg-card border border-border text-foreground text-2xl"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Categoría
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = categoryId === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setCategoryId(category.id)}
                  className={`aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : 'bg-card'
                  }`}
                  style={{
                    backgroundColor: isSelected ? category.color + '33' : undefined,
                    ringColor: isSelected ? category.color : undefined,
                  }}
                >
                  <Icon size={24} style={{ color: category.color }} />
                  <span className="text-xs text-center">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={!amount || !categoryId}
        className="w-full p-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check size={20} />
        Guardar
      </motion.button>
    </motion.div>
  );
}
