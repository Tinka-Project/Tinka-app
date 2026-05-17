import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { PaymentMethod } from '../contexts/AppContext';

export type MovementType = 'entrada' | 'transaccion';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash',     label: 'Efectivo',      icon: '💵' },
  { id: 'qr',       label: 'QR',            icon: '📱' },
  { id: 'transfer', label: 'Transferencia', icon: '🏦' },
  { id: 'card',     label: 'Tarjeta',       icon: '💳' },
];

interface Props {
  categories: any[];
  selectedCategoryId: string | null;
  onClose: () => void;
  onAddTransaction: (
    type: MovementType,
    categoryId: string,
    amount: number,
    description: string,
    paymentMethod: PaymentMethod,
  ) => void;
}

export function AddTransaction({ categories, selectedCategoryId, onClose, onAddTransaction }: Props) {
  const [type, setType] = useState<MovementType | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(selectedCategoryId || categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const canSubmit = type !== null && !!amount && !!categoryId && paymentMethod !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAddTransaction(
      type as MovementType,
      categoryId,
      parseFloat(amount),
      description || (type === 'entrada' ? 'Entrada' : 'Gasto'),
      paymentMethod as PaymentMethod,
    );
  };

  const isEntrada = type === 'entrada';
  const accentColor = isEntrada ? '#10b981' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-6 flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Nuevo movimiento</h2>
        <button onClick={onClose} className="text-muted-foreground" aria-label="Cerrar">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 space-y-5">
        {/* Step 1 — Movement type (obligatorio) */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Tipo de movimiento *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType('entrada')}
              className="p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all"
              style={{
                borderColor: type === 'entrada' ? '#10b981' : 'transparent',
                backgroundColor: type === 'entrada' ? '#10b9811f' : 'var(--card)',
              }}
            >
              <ArrowDownCircle size={22} style={{ color: '#10b981' }} />
              <span className="text-sm font-medium">Entrada</span>
              <span className="text-[10px] text-muted-foreground">Ingreso / venta</span>
            </button>
            <button
              onClick={() => setType('transaccion')}
              className="p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all"
              style={{
                borderColor: type === 'transaccion' ? '#ef4444' : 'transparent',
                backgroundColor: type === 'transaccion' ? '#ef44441f' : 'var(--card)',
              }}
            >
              <ArrowUpCircle size={22} style={{ color: '#ef4444' }} />
              <span className="text-sm font-medium">Transacción</span>
              <span className="text-[10px] text-muted-foreground">Egreso / gasto</span>
            </button>
          </div>
        </div>

        {/* Steps 2-5 reveal once a type is chosen */}
        {type && (
          <>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isEntrada ? 'Ej: Venta Samsung A54' : 'Ej: Compra de stock'}
                className="w-full p-4 rounded-2xl bg-card border border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Monto *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">Bs</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 pl-12 rounded-2xl bg-card border border-border text-foreground text-2xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Categoría *</label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(category => {
                  const Icon = category.icon;
                  const isSelected = categoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setCategoryId(category.id)}
                      className="aspect-square rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all border-2"
                      style={{
                        borderColor: isSelected ? category.color : 'transparent',
                        backgroundColor: isSelected ? category.color + '22' : 'var(--card)',
                      }}
                    >
                      {Icon
                        ? <Icon size={22} style={{ color: category.color }} />
                        : <span className="text-xl">{category.emoji ?? '📦'}</span>}
                      <span className="text-[11px] text-center leading-tight">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Método de pago *</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_OPTIONS.map(opt => {
                  const isSel = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 text-sm"
                      style={{
                        borderColor: isSel ? accentColor : 'transparent',
                        backgroundColor: isSel ? accentColor + '1f' : 'var(--card)',
                      }}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full p-4 mt-6 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
        style={{ backgroundColor: type ? accentColor : '#52525b' }}
      >
        <Check size={20} />
        {isEntrada ? 'Registrar entrada' : type === 'transaccion' ? 'Registrar transacción' : 'Guardar'}
      </motion.button>
    </motion.div>
  );
}
