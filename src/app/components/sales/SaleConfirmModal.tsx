import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MapPin, CreditCard } from 'lucide-react';
import { PaymentMethod, SaleLocation, useApp } from '../../contexts/AppContext';

export interface PrefilledSale {
  product: string;
  amount: number;
  paymentMethod: PaymentMethod;
  location: SaleLocation;
  categoryId: string;
}

interface Props {
  prefilled: PrefilledSale;
  onClose: () => void;
  onConfirm: (sale: PrefilledSale) => void;
  onQRRequested: (amount: number, product: string) => void;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Efectivo', icon: '💵' },
  { id: 'qr', label: 'QR', icon: '📱' },
  { id: 'transfer', label: 'Transfer.', icon: '🏦' },
  { id: 'card', label: 'Tarjeta', icon: '💳' },
];

const LOCATION_OPTIONS: { id: SaleLocation; label: string; icon: string }[] = [
  { id: 'store', label: 'Tienda', icon: '🏪' },
  { id: 'fair', label: 'Feria', icon: '🏕️' },
  { id: 'delivery', label: 'Delivery', icon: '🛵' },
  { id: 'online', label: 'Online', icon: '💻' },
];

export function SaleConfirmModal({ prefilled, onClose, onConfirm, onQRRequested }: Props) {
  const { categories } = useApp();
  const [product, setProduct] = useState(prefilled.product);
  const [amount, setAmount] = useState(prefilled.amount.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(prefilled.paymentMethod);
  const [location, setLocation] = useState<SaleLocation>(prefilled.location);
  const [categoryId, setCategoryId] = useState(prefilled.categoryId);

  const selectedCategories = categories.filter(c => c.selected);

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (!product || !parsedAmount) return;

    const sale: PrefilledSale = { product, amount: parsedAmount, paymentMethod, location, categoryId };

    if (paymentMethod === 'qr') {
      onQRRequested(parsedAmount, product);
    }
    onConfirm(sale);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full bg-[#18181b] rounded-t-3xl pb-10"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="px-5 pt-3 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Nueva Venta</h2>
            <button onClick={onClose} className="text-muted-foreground p-1">
              <X size={20} />
            </button>
          </div>

          <div className="px-5 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Product */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Producto / Servicio</label>
              <input
                type="text"
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder="Ej: Billetera de cuero"
                className="w-full px-4 py-3 rounded-2xl bg-[#27272a] border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-[#d946ef] focus:ring-1 focus:ring-[#d946ef]/30"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">Bs</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 pl-14 py-3.5 rounded-2xl bg-[#27272a] border border-border text-foreground text-2xl font-bold outline-none focus:border-[#d946ef] focus:ring-1 focus:ring-[#d946ef]/30"
                />
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 block">
                <CreditCard size={12} /> Método de pago
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all text-xs font-medium"
                    style={{
                      backgroundColor: paymentMethod === opt.id ? '#d946ef22' : '#27272a',
                      borderColor: paymentMethod === opt.id ? '#d946ef' : '#3f3f46',
                      color: paymentMethod === opt.id ? '#d946ef' : '#a1a1aa',
                    }}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 block">
                <MapPin size={12} /> Ubicación
              </label>
              <div className="grid grid-cols-4 gap-2">
                {LOCATION_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLocation(opt.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all text-xs font-medium"
                    style={{
                      backgroundColor: location === opt.id ? '#d946ef22' : '#27272a',
                      borderColor: location === opt.id ? '#d946ef' : '#3f3f46',
                      color: location === opt.id ? '#d946ef' : '#a1a1aa',
                    }}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            {selectedCategories.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Categoría de producto</label>
                <div className="flex gap-2 flex-wrap">
                  {selectedCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all"
                      style={{
                        backgroundColor: categoryId === cat.id ? cat.color + '22' : '#27272a',
                        borderColor: categoryId === cat.id ? cat.color : '#3f3f46',
                        color: categoryId === cat.id ? cat.color : '#a1a1aa',
                      }}
                    >
                      <span>{cat.emoji}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QR hint */}
            {paymentMethod === 'qr' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#d946ef]/10 border border-[#d946ef]/30"
              >
                <span className="text-lg">📱</span>
                <p className="text-sm text-[#d946ef]">Se generará el QR de cobro al confirmar</p>
              </motion.div>
            )}

            {/* Confirm button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={!product || !amount}
              className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 mb-2"
              style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
            >
              <Check size={20} />
              Confirmar y Registrar Venta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
