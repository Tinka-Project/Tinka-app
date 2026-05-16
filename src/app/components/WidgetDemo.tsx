import { motion } from 'motion/react';
import { LockScreenWidget } from './LockScreenWidget';
import { X } from 'lucide-react';

interface Props {
  categories: any[];
  onClose: () => void;
}

export function WidgetDemo({ categories, onClose }: Props) {
  const handleAddTransaction = (categoryId: string, amount: number) => {
    console.log('Transaction added:', { categoryId, amount });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-white text-2xl font-medium mb-1">Widget de Pantalla</h2>
            <p className="text-white/60 text-sm">Registro en 2 taps sin abrir la app</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <LockScreenWidget
          categories={categories}
          onAddTransaction={handleAddTransaction}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ff9f43] flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-background text-sm font-medium">1</span>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Acceso desde pantalla de bloqueo</div>
              <div className="text-white/60 text-sm">
                Agrega el widget a tu pantalla de bloqueo para acceso instantáneo
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ff9f43] flex items-center justify-center flex-shrink-0 mt-1">
              <span className="background text-sm font-medium">2</span>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Categorías inteligentes</div>
              <div className="text-white/60 text-sm">
                El widget sugiere categorías según la hora del día
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ff9f43] flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-background text-sm font-medium">3</span>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Zero friction</div>
              <div className="text-white/60 text-sm">
                Solo ingresa el monto y toca la categoría. Listo.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
