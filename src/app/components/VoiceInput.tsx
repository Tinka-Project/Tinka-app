import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { PaymentMethod, SaleLocation, useApp } from '../contexts/AppContext';
import { PrefilledSale } from './sales/SaleConfirmModal';

interface Props {
  onClose: () => void;
  onSaleDetected: (sale: PrefilledSale) => void;
}

export function VoiceInput({ onClose, onSaleDetected }: Props) {
  const { categories } = useApp();
  const [isListening, setIsListening] = useState(true);
  const [transcription, setTranscription] = useState('');

  const selectedCats = categories.filter(c => c.selected);
  const defaultCategoryId = selectedCats[0]?.id ?? '1';

  useEffect(() => {
    const listenTimer = setTimeout(() => {
      setIsListening(false);
      setTranscription('Venta de una laptop Lenovo a 7.000 Bs por transferencia');

      setTimeout(() => {
        // Buscar categoría coherente con "laptop" (Computadoras)
        const laptopCat = selectedCats.find(c =>
          c.name.toLowerCase().includes('comp') ||
          c.name.toLowerCase().includes('laptop') ||
          c.name.toLowerCase().includes('lap'),
        ) ?? selectedCats[0];

        onSaleDetected({
          product: 'Laptop Lenovo',
          amount: 7000,
          paymentMethod: 'transfer' as PaymentMethod,
          location: 'store' as SaleLocation,
          categoryId: laptopCat?.id ?? defaultCategoryId,
        });
      }, 1000);
    }, 5000);

    return () => clearTimeout(listenTimer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #6d28d9 0%, #9333ea 40%, #d946ef 100%)' }}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/70 text-sm mb-2 font-medium tracking-wide uppercase"
            >
              Registra tu venta
            </motion.p>
            <motion.div className="text-white text-2xl font-semibold mb-12">
              Con la voz
            </motion.div>

            {/* Waveform / pulse rings */}
            <div className="relative mb-14">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  className="absolute inset-0 -m-10 rounded-full border-2 border-white/50"
                />
              ))}
              <div className="relative w-32 h-32 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center gap-1">
                {[1, 1.6, 0.9, 1.4, 1, 1.5, 0.8].map((scale, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, scale, 1, scale * 0.7, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                    className="w-1 rounded-full bg-white"
                    style={{ height: `${20 + i * 4}px` }}
                  />
                ))}
              </div>
            </div>

           

            <div className="flex gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <X size={24} className="text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center"
              >
                <Check size={24} style={{ color: '#9333ea' }} />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white"
            />
            <p className="text-white text-center text-base font-medium">
              Procesando tu venta...
            </p>
            {transcription && (
              <p className="text-white/70 text-sm text-center italic max-w-xs">
                "{transcription}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
