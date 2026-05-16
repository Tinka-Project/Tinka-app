import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, TrendingDown } from 'lucide-react';
import { formatBs } from '../utils/currency';

interface Props {
  categories: any[];
  onClose: () => void;
  onAddTransaction: (categoryId: string, amount: number, description: string) => void;
}

export function VoiceInput({ categories, onClose, onAddTransaction }: Props) {
  const [isListening, setIsListening] = useState(true);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsListening(false);
      setTranscription('Gasté 200 bolivianos en ropa');

      setTimeout(() => {
        const clothingCategory = categories.find(c =>
          c.name.toLowerCase().includes('ropa') ||
          c.name.toLowerCase().includes('vest')
        ) || categories[0];

        setAnalysis({
          amount: 200,
          category: clothingCategory,
          description: 'Ropa',
          translation: 'Esto equivale a aproximadamente 25 pasajes de micro',
          projection: 'Tu registro histórico on-chain sugiere que este gasto puede ser emocional o impulsivo.',
        });
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [categories]);

  const handleConfirm = (type: 'necessary' | 'impulse') => {
    if (analysis) {
      onAddTransaction(analysis.category.id, analysis.amount, analysis.description);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#ff9f43] via-[#ff6b6b] to-[#ec4899] flex flex-col items-center justify-center p-6"
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.div className="text-white text-2xl font-medium mb-12">
              Con la voz
            </motion.div>

            <div className="relative mb-12">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="absolute inset-0 -m-8 rounded-full border-2 border-white"
                />
              ))}
              <div className="relative w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <motion.div
                  animate={{
                    scaleY: [1, 1.5, 0.8, 1.3, 1, 1.2, 0.9, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  className="w-1 h-16 bg-white rounded-full mr-1"
                />
                <motion.div
                  animate={{
                    scaleY: [1.2, 0.8, 1.5, 1, 1.3, 0.9, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  className="w-1 h-20 bg-white rounded-full mr-1"
                />
                <motion.div
                  animate={{
                    scaleY: [0.8, 1.3, 1, 1.5, 0.9, 1.2, 1, 1.1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  className="w-1 h-12 bg-white rounded-full"
                />
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
                <Check size={24} className="text-[#ff9f43]" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onClose}
              className="mb-6 text-white"
            >
              <X size={24} />
            </motion.button>

            {transcription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-xl mb-8 text-center"
              >
                "{transcription}"
              </motion.div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: analysis.category.color + '33' }}
                  >
                    {analysis.category.icon && (
                      <analysis.category.icon size={32} style={{ color: analysis.category.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-2xl font-medium">
                      {formatBs(analysis.amount, true)}
                    </div>
                    <div className="text-white/70">
                      {analysis.category.name}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/20" />

                <div>
                  <div className="text-white text-lg font-medium mb-2">
                    💡Ten Cuenta
                  </div>
                  <div className="text-white/90">
                    {analysis.translation}
                  </div>
                </div>

                <div>
                  <div className="text-white text-lg font-medium mb-2 flex items-center gap-2">
                    <TrendingDown size={20} />
                    Proyección
                  </div>
                  <div className="text-white/90">
                    {analysis.projection}
                  </div>
                </div>

                <div className="h-px bg-white/20" />

                <div>
                  <div className="text-white text-sm mb-3">
                    ¿Este gasto te acerca o te aleja de lo que quieres?
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirm('necessary')}
                      className="flex-1 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                      Necesario
                    </button>
                    <button
                      onClick={() => handleConfirm('impulse')}
                      className="flex-1 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                      Impulso
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
