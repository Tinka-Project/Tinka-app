import { motion } from 'motion/react';
import { Bell } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export function OnboardingNotifications({ onComplete }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        Añade automáticamente tus notificaciones bancarias a Tinka
      </motion.h1>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="relative rounded-3xl bg-card border border-border p-6 mb-8">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ff9f43] flex items-center justify-center">
                <Bell size={24} className="text-background" />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Banco Fie</div>
                <div className="text-sm text-muted-foreground mb-2">Tu pago de Bs 39.50 se ha procesado</div>
                <div className="text-xs text-muted-foreground">09:41</div>
              </div>
            </motion.div>
          </div>

          <div className="relative rounded-3xl bg-card border border-border p-6">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ec4899] flex items-center justify-center">
                <Bell size={24} className="text-background" />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Banco Fie</div>
                <div className="text-sm text-muted-foreground mb-2">Nueva transacción añadida</div>
                <div className="text-xs text-muted-foreground">13:35</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-muted-foreground mb-6"
      >
        La forma más conveniente de añadir tus transacciones.
      </motion.p>

      <div className="flex gap-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onComplete}
          className="flex-1 p-4 rounded-2xl bg-secondary text-secondary-foreground"
        >
          Omitir
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onComplete}
          className="flex-1 p-4 rounded-2xl bg-[#ff9f43] text-background"
        >
          Configurar
        </motion.button>
      </div>
    </div>
  );
}
