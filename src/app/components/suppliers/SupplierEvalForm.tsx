import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Supplier } from './SupplierList';

interface Props {
  supplier: Supplier;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.85 }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          <Star
            size={32}
            fill={i <= display ? '#f59e0b' : 'none'}
            stroke={i <= display ? '#f59e0b' : '#3f3f46'}
            strokeWidth={1.5}
          />
        </motion.button>
      ))}
    </div>
  );
}

const COST_OPTIONS = [
  { value: 'expensive', label: 'Muy caro', icon: '💸', color: '#ef4444' },
  { value: 'fair', label: 'Justo', icon: '✅', color: '#10b981' },
  { value: 'cheap', label: 'Económico', icon: '🏷️', color: '#3b82f6' },
];

const DELIVERY_OPTIONS = [
  { value: 'late', label: 'Retraso', icon: '⏰', color: '#ef4444' },
  { value: 'ontime', label: 'A tiempo', icon: '✅', color: '#10b981' },
  { value: 'early', label: 'Anticipado', icon: '🚀', color: '#3b82f6' },
];

export function SupplierEvalForm({ supplier, onClose, onSubmit }: Props) {
  const [generalRating, setGeneralRating] = useState(0);
  const [deliveryOption, setDeliveryOption] = useState('');
  const [costOption, setCostOption] = useState('');
  const [qualityRating, setQualityRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const filledCount = [
    generalRating > 0,
    deliveryOption !== '',
    costOption !== '',
    qualityRating > 0,
    serviceRating > 0,
  ].filter(Boolean).length;

  const progress = (filledCount / 5) * 100;

  const canSubmit = generalRating > 0 && qualityRating > 0 && serviceRating > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(generalRating);
      toast.success('✅ Evaluación enviada', {
        description: `Gracias por evaluar a ${supplier.name}`,
        duration: 3500,
      });
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26 }}
        className="w-full bg-[#18181b] rounded-t-3xl max-h-[90vh] flex flex-col"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3"><div className="w-10 h-1 rounded-full bg-border" /></div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div>
            <h3 className="font-semibold">Evaluar Proveedor</h3>
            <p className="text-sm text-muted-foreground">{supplier.emoji} {supplier.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground p-1"><X size={20} /></button>
        </div>

        {/* Progress bar */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Completitud</span>
            <span className="text-xs font-medium" style={{ color: '#d946ef' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #9333ea, #d946ef)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Check size={36} className="text-white" strokeWidth={3} />
              </div>
              <h3 className="text-xl font-bold mb-2">¡Evaluación enviada!</h3>
              <p className="text-sm text-muted-foreground">Tu feedback mejora el Tinka Score de {supplier.name}</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex-1 overflow-y-auto px-5 space-y-6 pb-6">
              {/* General rating */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>⭐</span>
                  <span className="text-sm font-medium">Satisfacción General</span>
                </div>
                <StarInput value={generalRating} onChange={setGeneralRating} />
              </div>

              {/* Delivery */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>⏱️</span>
                  <span className="text-sm font-medium">Satisfacción de entrega</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DELIVERY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDeliveryOption(opt.value)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-medium transition-all"
                      style={{
                        backgroundColor: deliveryOption === opt.value ? opt.color + '22' : '#27272a',
                        borderColor: deliveryOption === opt.value ? opt.color : '#3f3f46',
                        color: deliveryOption === opt.value ? opt.color : '#a1a1aa',
                      }}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>💰</span>
                  <span className="text-sm font-medium">Costo de productos</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {COST_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCostOption(opt.value)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-medium transition-all"
                      style={{
                        backgroundColor: costOption === opt.value ? opt.color + '22' : '#27272a',
                        borderColor: costOption === opt.value ? opt.color : '#3f3f46',
                        color: costOption === opt.value ? opt.color : '#a1a1aa',
                      }}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>📦</span>
                  <span className="text-sm font-medium">Calidad del producto</span>
                </div>
                <StarInput value={qualityRating} onChange={setQualityRating} />
              </div>

              {/* Service */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>🤝</span>
                  <span className="text-sm font-medium">Atención al cliente</span>
                </div>
                <StarInput value={serviceRating} onChange={setServiceRating} />
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>📝</span>
                  <span className="text-sm font-medium">Notas adicionales</span>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observaciones sobre el proveedor..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-[#27272a] border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-[#d946ef] resize-none"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
              >
                <Check size={18} />
                Enviar Evaluación
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
