import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Plus, Check, ArrowLeft } from 'lucide-react';
import { ProductCategory } from '../contexts/AppContext';
import { formatBs } from '../utils/currency';

interface Props {
  categories: ProductCategory[];
  onClose: () => void;
  onUpdateCategories: (categories: ProductCategory[]) => void;
}

const EMOJI_OPTIONS = [
  '📱', '💻', '🎧', '🖱️', '🔧', '🎮', '⚡', '📷',
  '🖨️', '🔌', '💾', '📡', '🖥️', '⌨️', '🎁', '🌐',
  '🧶', '👗', '🍽️', '💄', '🏠', '🌾', '🎨', '💍',
];

const COLOR_OPTIONS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#d946ef', '#06b6d4', '#f97316',
  '#84cc16', '#ec4899',
];

type View = 'main' | 'categories' | 'add-category' | 'presupuesto' | 'edit-goal';

export function SettingsPanel({ categories, onClose, onUpdateCategories }: Props) {
  const [view, setView] = useState<View>('main');
  const [goalTarget, setGoalTarget] = useState<ProductCategory | null>(null);

  // New category form
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📱');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [newGoal, setNewGoal] = useState('');

  // Edit goal
  const [editGoal, setEditGoal] = useState('');

  const handleAddCategory = () => {
    if (!newName.trim()) return;
    const newCat: ProductCategory = {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      selected: true,
      salesGoal: newGoal ? parseFloat(newGoal) : 1000,
    };
    onUpdateCategories([...categories, newCat]);
    setNewName('');
    setNewEmoji('📱');
    setNewColor('#3b82f6');
    setNewGoal('');
    setView('categories');
  };

  const handleSaveGoal = () => {
    if (!goalTarget || !editGoal) return;
    const updated = categories.map(c =>
      c.id === goalTarget.id ? { ...c, salesGoal: parseFloat(editGoal) } : c
    );
    onUpdateCategories(updated);
    setView('presupuesto');
    setGoalTarget(null);
    setEditGoal('');
  };

  const goBack = () => {
    if (view === 'add-category') setView('categories');
    else if (view === 'categories') setView('main');
    else if (view === 'edit-goal') setView('presupuesto');
    else if (view === 'presupuesto') setView('main');
  };

  const title: Record<View, string> = {
    main: 'Configuración',
    categories: 'Categorías',
    'add-category': 'Nueva Categoría',
    presupuesto: 'Presupuesto',
    'edit-goal': `Meta: ${goalTarget?.name ?? ''}`,
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-border">
          {view !== 'main' && (
            <button onClick={goBack} className="text-muted-foreground p-1">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-lg font-bold flex-1">{title[view]}</h2>
          {view === 'main' && (
            <button onClick={onClose} className="text-muted-foreground p-1">
              <X size={22} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── Main ─────────────────────────────────────────── */}
          {view === 'main' && (
            <div className="p-5 space-y-3">
              {/* Categorías */}
              <motion.button
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('categories')}
                className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: '#3b82f622' }}
                >
                  🏷️
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Categorías</p>
                  <p className="text-xs text-muted-foreground">
                    {categories.filter(c => c.selected).length} activas · gestionar y agregar
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </motion.button>

              {/* Presupuesto */}
              <motion.button
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('presupuesto')}
                className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: '#10b98122' }}
                >
                  💰
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Presupuesto</p>
                  <p className="text-xs text-muted-foreground">
                    Metas de ventas por categoría
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </motion.button>
            </div>
          )}

          {/* ── Categorías list ───────────────────────────────── */}
          {view === 'categories' && (
            <div className="p-5 space-y-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-3"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: cat.color + '22' }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">Meta: {formatBs(cat.salesGoal)}</p>
                  </div>
                  {cat.selected && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] flex-shrink-0">
                      Activa
                    </span>
                  )}
                </motion.div>
              ))}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: categories.length * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('add-category')}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Agregar categoría</span>
              </motion.button>
            </div>
          )}

          {/* ── Add category ───────────────────────────────────── */}
          {view === 'add-category' && (
            <div className="p-5 space-y-5 pb-10">
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Nombre</p>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej: Drones, Impresoras..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground outline-none focus:border-[#d946ef]"
                />
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Ícono</p>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      onClick={() => setNewEmoji(em)}
                      className="h-11 rounded-xl flex items-center justify-center text-xl transition-all"
                      style={{
                        backgroundColor: newEmoji === em ? newColor + '33' : '#27272a',
                        border: `2px solid ${newEmoji === em ? newColor : 'transparent'}`,
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      {newColor === color && <Check size={16} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: newColor + '22' }}
                >
                  {newEmoji}
                </div>
                <div>
                  <p className="font-medium">{newName || 'Nueva categoría'}</p>
                  <p className="text-xs text-muted-foreground">Vista previa</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                  Meta de ventas mensual (Bs.)
                </p>
                <input
                  type="number"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Ej: 3000"
                  className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground outline-none focus:border-[#d946ef]"
                />
                <div className="flex gap-2 mt-2">
                  {[1000, 2000, 3000, 5000].map(v => (
                    <button
                      key={v}
                      onClick={() => setNewGoal(v.toString())}
                      className="flex-1 py-2 rounded-xl bg-[#27272a] text-xs text-muted-foreground"
                    >
                      {formatBs(v)}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddCategory}
                disabled={!newName.trim()}
                className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${newColor}, #9333ea)` }}
              >
                Agregar Categoría
              </motion.button>
            </div>
          )}

          {/* ── Presupuesto list ──────────────────────────────── */}
          {view === 'presupuesto' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-muted-foreground mb-1">
                Toca una categoría para actualizar su meta de ventas mensual
              </p>
              {categories.map((cat, i) => {
                const goalWidth = cat.salesGoal > 0 ? Math.min(100, (cat.salesGoal / 10000) * 100) : 0;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setGoalTarget(cat);
                      setEditGoal(cat.salesGoal.toString());
                      setView('edit-goal');
                    }}
                    className="w-full p-4 rounded-2xl bg-card border border-border text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: cat.color + '22' }}
                      >
                        {cat.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs font-bold" style={{ color: cat.color }}>
                          Meta: {formatBs(cat.salesGoal)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${goalWidth}%`, backgroundColor: cat.color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatBs(cat.salesGoal)} / mes
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ── Edit goal ─────────────────────────────────────── */}
          {view === 'edit-goal' && goalTarget && (
            <div className="p-5 space-y-5 pb-10">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: goalTarget.color + '22' }}
                >
                  {goalTarget.emoji}
                </div>
                <div>
                  <p className="font-semibold text-lg">{goalTarget.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Meta actual: {formatBs(goalTarget.salesGoal)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                  Nueva meta mensual (Bs.)
                </p>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border focus-within:border-[#d946ef]">
                  <span className="text-muted-foreground text-sm">Bs.</span>
                  <input
                    type="number"
                    value={editGoal}
                    onChange={e => setEditGoal(e.target.value)}
                    placeholder={goalTarget.salesGoal.toString()}
                    autoFocus
                    className="flex-1 bg-transparent text-2xl font-bold text-foreground outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[1000, 2000, 3000, 5000].map(v => (
                    <button
                      key={v}
                      onClick={() => setEditGoal(v.toString())}
                      className="flex-1 py-2 rounded-xl bg-[#27272a] text-xs text-muted-foreground"
                    >
                      {formatBs(v)}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveGoal}
                disabled={!editGoal}
                className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${goalTarget.color}, #9333ea)` }}
              >
                Guardar Presupuesto
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
