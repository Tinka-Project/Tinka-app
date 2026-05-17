import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  amount: number;
  product: string;
  onClose: () => void;
}

function QRGrid() {
  // Visually convincing QR pattern (static for demo)
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [0,1,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
    [1,1,1,0,1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,1,1],
    [0,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0],
    [1,0,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,1,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,0,1,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,0,1,1,0,1,0,0,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,1,0,1,1,0],
  ];

  return (
    <div className="inline-grid gap-0.5 p-3 bg-white rounded-2xl"
      style={{ gridTemplateColumns: `repeat(${pattern[0].length}, 1fr)` }}>
      {pattern.flat().map((cell, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-[1px]"
          style={{ backgroundColor: cell ? '#09090b' : 'transparent' }}
        />
      ))}
    </div>
  );
}

function formatBs(n: number) {
  return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(n);
}

export function QRPaymentModal({ amount, product, onClose }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 min
  const [paid, setPaid] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // Simulate payment received after 8 seconds
    const payTimer = setTimeout(() => {
      setPaid(true);
    }, 8000);

    return () => {
      clearInterval(timerRef.current!);
      clearTimeout(payTimer);
    };
  }, []);

  useEffect(() => {
    if (paid && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#d946ef', '#9333ea', '#10b981', '#ffffff'],
      });
      setTimeout(onClose, 3000);
    }
  }, [paid, onClose]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timerColor = secondsLeft < 60 ? '#ef4444' : secondsLeft < 120 ? '#f59e0b' : '#10b981';

  const handleShare = async () => {
    const text = `Pago Tinka Digital\nProducto: ${product}\nMonto: Bs ${formatBs(amount)}\nBanco FIE Bolivia`;
    if (navigator.share) {
      await navigator.share({ title: 'Cobro QR Tinka', text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#09090b] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="text-muted-foreground p-2 -ml-2">
          <X size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}>
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Cobrar con QR · FIE</span>
        </div>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {paid ? (
          /* Success screen */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Check size={44} className="text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-2">¡Pago recibido!</h2>
            <p className="text-muted-foreground mb-4">{product}</p>
            <div className="text-5xl font-bold text-[#10b981]">Bs {formatBs(amount)}</div>
          </motion.div>
        ) : (
          /* QR screen */
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-between px-5 pb-10"
          >
            {/* Amount */}
            <div className="text-center mb-6 mt-2">
              <p className="text-sm text-muted-foreground mb-1">{product}</p>
              <div className="text-5xl font-bold text-foreground">
                Bs <span className="text-[#d946ef]">{formatBs(amount)}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <motion.div
                animate={{ boxShadow: ['0 0 0px #d946ef44', '0 0 30px #d946ef44', '0 0 0px #d946ef44'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="rounded-3xl overflow-hidden"
              >
                <QRGrid />
              </motion.div>

              {/* FIE badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <div className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}>
                  <span className="text-white text-[10px] font-bold">T</span>
                </div>
                <span className="text-xs text-muted-foreground">Banco FIE · Bolivia</span>
              </div>
            </div>

            {/* Timer & actions */}
            <div className="w-full space-y-4">
              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: timerColor }} />
                <span className="text-sm font-mono" style={{ color: timerColor }}>
                  {secondsLeft === 0 ? 'QR expirado' : `Válido por ${timerStr}`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: timerColor }}
                  animate={{ width: `${(secondsLeft / 300) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              {/* Share button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
              >
                <Share2 size={18} />
                Enviar QR por WhatsApp
              </motion.button>

              <p className="text-center text-xs text-muted-foreground">
                Esperando confirmación de pago...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
