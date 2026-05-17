import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowRight, Check } from 'lucide-react';
import { ProductCategory, DEFAULT_CATEGORIES } from '../contexts/AppContext';

interface Props {
  onNext: (categories: ProductCategory[]) => void;
}

const EMOJI_OPTIONS = ['🧶', '👗', '🍽️', '💄', '🔧', '📱', '🏠', '🌿', '🎨', '👟', '🧁', '📦'];
const COLOR_OPTIONS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#ef4444', '#f97316'];

export function OnboardingCategories({ onNext }: Props) {
  const [categories, setCategories] = useState<ProductCategory[]>(DEFAULT_CATEGORIES);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🧶');
  const [newColor, setNewColor] = useState('#8b5cf6');

  const toggle = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const addCategory = () => {
    if (!newName.trim()) return;
    const cat: ProductCategory = {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      selected: true,
      salesGoal: 1500,
    };
    setCategories(prev => [...prev, cat]);
    setNewName('');
    setNewEmoji('🧶');
    setNewColor('#8b5cf6');
    setShowNewCategory(false);
  };

  const selectedCount = categories.filter(c => c.selected).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col px-5 pt-10 pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}>
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Tinka Digital</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">¿Qué vendes?</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Selecciona las categorías de productos de tu negocio.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5 flex-1">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => toggle(cat.id)}
            className="relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: cat.selected ? cat.color + '22' : '#18181b',
              border: `2px solid ${cat.selected ? cat.color : '#3f3f46'}`,
            }}
          >
            <span className="text-3xl">{cat.emoji}</span>
            <span className="text-xs text-center font-medium leading-tight px-1">{cat.name}</span>
            {cat.selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: cat.color }}
              >
                <Check size={11} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Add category */}
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: categories.length * 0.04 }}
          onClick={() => setShowNewCategory(true)}
          className="aspect-square rounded-2xl bg-card flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border"
        >
          <Plus size={28} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center">Añadir</span>
        </motion.button>
      </div>

      {selectedCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mb-4"
        >
          {selectedCount} categoría{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
        </motion.p>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNext(categories)}
        className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
      >
        {selectedCount === 0 ? 'Continuar sin seleccionar' : 'Siguiente'}
        <ArrowRight size={20} />
      </motion.button>

      {/* New category modal */}
      <AnimatePresence>
        {showNewCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-card rounded-t-3xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Nueva categoría</h3>
                <button onClick={() => setShowNewCategory(false)} className="text-muted-foreground">✕</button>
              </div>

              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ej: Joyería, Cuero, Cerámica..."
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-[#d946ef]"
              />

              <div>
                <p className="text-sm text-muted-foreground mb-3">Ícono</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newEmoji === e ? 'bg-[#d946ef]/20 ring-2 ring-[#d946ef]' : 'bg-background'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Color</p>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-offset-card ring-white' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={addCategory}
                disabled={!newName.trim()}
                className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
              >
                Agregar categoría
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
