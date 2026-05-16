import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Shirt, UtensilsCrossed, Gem, Car, Dog, Home, Plus, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  selected: boolean;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Compras', icon: ShoppingBag, color: '#10b981', selected: false },
  { id: '2', name: 'Ropa', icon: Shirt, color: '#3b82f6', selected: false },
  { id: '3', name: 'Comer afuera', icon: UtensilsCrossed, color: '#ff9f43', selected: false },
  { id: '4', name: 'Lujo', icon: Gem, color: '#06b6d4', selected: false },
  { id: '5', name: 'Auto', icon: Car, color: '#ec4899', selected: false },
  { id: '6', name: 'Mascotas', icon: Dog, color: '#f59e0b', selected: false },
  { id: '7', name: 'Casa', icon: Home, color: '#8b5cf6', selected: false },
];

interface Props {
  onNext: (categories: Category[]) => void;
}

export function OnboardingCategories({ onNext }: Props) {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const toggleCategory = (id: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      )
    );
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName,
        icon: ShoppingBag,
        color: '#ff9f43',
        selected: true,
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="self-end mb-4 text-muted-foreground"
        onClick={() => onNext(categories)}
      >
        ✕
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        Elige tus categorías
      </motion.h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleCategory(category.id)}
              className={`relative aspect-square rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                category.selected
                  ? 'bg-opacity-20 ring-2 ring-offset-2 ring-offset-background'
                  : 'bg-card'
              }`}
              style={{
                backgroundColor: category.selected ? category.color + '33' : undefined,
                borderColor: category.selected ? category.color : undefined,
                ringColor: category.selected ? category.color : undefined,
              }}
            >
              <Icon size={32} style={{ color: category.color }} />
              <span className="text-xs text-center">{category.name}</span>
              {category.selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-success flex items-center justify-center"
                >
                  <span className="text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: categories.length * 0.05 }}
          onClick={() => setShowNewCategory(true)}
          className="aspect-square rounded-3xl bg-card flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border"
        >
          <Plus size={32} className="text-muted-foreground" />
          <span className="text-xs text-center text-muted-foreground">Añadir categoría</span>
        </motion.button>
      </div>

      {showNewCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-background z-50 p-6 flex flex-col"
        >
          <button
            onClick={() => setShowNewCategory(false)}
            className="self-end mb-4 text-muted-foreground"
          >
            ✕
          </button>

          <h2 className="mb-8">Categoría</h2>

          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nombre de la categoría"
            className="w-full p-4 rounded-2xl bg-card border border-border mb-6 text-foreground"
            autoFocus
          />

          <button
            onClick={addCategory}
            className="w-full p-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
          >
            <span>✓</span>
            Guardar
          </button>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => onNext(categories)}
        className="mt-auto w-full p-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
      >
        Siguiente
        <ArrowRight size={20} />
      </motion.button>
    </div>
  );
}
