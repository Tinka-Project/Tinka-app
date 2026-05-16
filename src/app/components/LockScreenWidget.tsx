import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

interface Props {
  categories: any[];
  onAddTransaction: (categoryId: string, amount: number) => void;
}

export function LockScreenWidget({ categories, onAddTransaction }: Props) {
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const topCategories = categories.slice(0, 3);
  const currentHour = new Date().getHours();
  const suggestedCategories = currentHour >= 6 && currentHour <= 10
    ? topCategories.filter(c => c.name.toLowerCase().includes('comer'))
    : topCategories;

  const handleQuickAdd = () => {
    if (amount && selectedCategoryId) {
      onAddTransaction(selectedCategoryId, parseFloat(amount));
      setAmount('');
      setSelectedCategoryId('');
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-md mx-auto rounded-3xl bg-gradient-to-br from-[#1a1a22] to-[#0a0a0f] p-6 shadow-2xl border border-[#2a2a35]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#ff9f43]/20 flex items-center justify-center">
          <Lock size={20} className="text-[#ff9f43]" />
        </div>
        <div>
          <div className="text-white font-medium">Arkive</div>
          <div className="text-sm text-white/60">Registro rápido</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-white/75">Bs</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white text-2xl placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {suggestedCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                isSelected
                  ? 'ring-2'
                  : 'bg-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? category.color + '33' : undefined,
                ringColor: isSelected ? category.color : undefined,
              }}
            >
              <Icon size={24} style={{ color: category.color }} />
              <span className="text-xs text-white/90">{category.name}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleQuickAdd}
        disabled={!amount || !selectedCategoryId}
        className="w-full p-3 rounded-xl bg-[#ff9f43] text-background font-medium disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Agregar gasto
      </button>

      <div className="mt-4 text-center text-xs text-white/40">
        2 taps • Sin abrir la app
      </div>
    </motion.div>
  );
}
