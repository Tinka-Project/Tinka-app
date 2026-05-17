import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Link2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatBs } from '../../utils/currency';

interface BankEvent {
  type: 'income' | 'expense';
  label: string;
  product?: string;
  amount: number;
  method?: 'transfer' | 'qr' | 'cash' | 'card';
}

const SIMULATED_EVENTS: BankEvent[] = [
  { type: 'income', label: 'Transferencia · Cliente Carlos R.', product: 'Venta Samsung Galaxy A54', amount: 1800, method: 'transfer' },
  { type: 'income', label: 'Cobro QR · Tienda', product: 'Cobro QR accesorios tech', amount: 280, method: 'qr' },
  { type: 'expense', label: 'Pago a TechDistrib Bolivia', amount: 5200 },
  { type: 'income', label: 'Depósito · Juan M.', product: 'Venta iPhone 14 128GB', amount: 4200, method: 'transfer' },
  { type: 'expense', label: 'Compra stock celulares Xiaomi', amount: 8500 },
];

interface DetectedMovement {
  id: string;
  type: 'income' | 'expense';
  label: string;
  amount: number;
  time: string;
}

export function BankSyncCard() {
  const { addSale, categories } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Hace 2 min');
  const [movements, setMovements] = useState<DetectedMovement[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const eventIdx = useRef(0);

  const selectedCats = categories.filter(c => c.selected);
  const defaultCatId = selectedCats[0]?.id ?? '1';

  // Simulate incoming bank events every ~12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const evt = SIMULATED_EVENTS[eventIdx.current % SIMULATED_EVENTS.length];
      eventIdx.current += 1;

      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

      const movement: DetectedMovement = {
        id: Date.now().toString(),
        type: evt.type as 'income' | 'expense',
        label: evt.label,
        amount: evt.amount,
        time: timeStr,
      };

      setMovements(prev => [movement, ...prev].slice(0, 5));
      setLastSync('Ahora mismo');

      if (evt.type === 'income') {
        // Auto-register income as a sale
        addSale({
          product: evt.product ?? evt.label,
          amount: evt.amount,
          paymentMethod: evt.method ?? 'transfer',
          location: 'store',
          categoryId: defaultCatId,
          autoDetected: true,
        });

        toast.success(`💰 Ingreso detectado: +${formatBs(evt.amount)}`, {
          description: evt.label,
          duration: 9000,
          action: {
            label: 'Ver',
            onClick: () => setIsExpanded(true),
          },
        });
      } else {
        toast.info(`💳 Gasto detectado: -${formatBs(evt.amount)}`, {
          description: `${evt.label} · ¿Clasificar gasto?`,
          duration: 9000,
          action: {
            label: 'Clasificar',
            onClick: () => setIsExpanded(true),
          },
        });
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [addSale, defaultCatId]);

  const handleResync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Ahora mismo');
      toast.success('✅ Sincronización completada', {
        description: 'BancaMovil FIE al día',
        duration: 3000,
      });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-6 rounded-2xl border border-border overflow-hidden"
      style={{ backgroundColor: '#18181b' }}
    >
      {/* Header row */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5"
      >
        {/* FIE icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}>
          <Link2 size={16} className="text-white" />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">BancaMovil FIE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs text-[#10b981] font-medium">Conectado</span>
          </div>
          <p className="text-xs text-muted-foreground">Última sincronización: {lastSync}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); handleResync(); }}
            className="p-2 rounded-xl bg-[#27272a]"
          >
            <motion.div animate={isSyncing ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: isSyncing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={14} className={isSyncing ? 'text-[#d946ef]' : 'text-muted-foreground'} />
            </motion.div>
          </button>
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} className="text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Stats row */}
      <div className="flex border-t border-border">
        {[
          { label: 'Detectados hoy', value: String(movements.filter(m => m.type === 'income').length) },
          { label: 'Auto-registrados', value: String(movements.filter(m => m.type === 'income').length), color: '#d946ef' },
          { label: 'Pendientes', value: String(movements.filter(m => m.type === 'expense').length), color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={stat.label} className={`flex-1 py-3 text-center ${i > 0 ? 'border-l border-border' : ''}`}>
            <p className="text-base font-bold" style={{ color: stat.color ?? '#fafafa' }}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Expanded movement list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border overflow-hidden"
          >
            {movements.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Esperando movimientos bancarios...
              </div>
            ) : (
              <div className="divide-y divide-border">
                {movements.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xl flex-shrink-0">{m.type === 'income' ? '💰' : '💳'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-muted-foreground">{m.time}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#d946ef]/15 text-[#d946ef]">
                          Auto 🤖
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold flex-shrink-0 ${m.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {m.type === 'income' ? '+' : '-'}{formatBs(m.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-3 bg-[#d946ef]/5 border-t border-border">
              <p className="text-xs text-[#d946ef] text-center">
                🔗 Sincronización automática activa · Banco FIE Bolivia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
