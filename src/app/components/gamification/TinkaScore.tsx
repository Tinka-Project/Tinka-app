import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { formatBs } from '../../utils/currency';
import confetti from 'canvas-confetti';

const BADGES = [
  { id: 'first_sale', icon: '🎯', label: 'Primera Venta', desc: 'Registraste tu primera venta' },
  { id: 'streak_7', icon: '🔥', label: 'Racha de 7 Días', desc: '7 días consecutivos registrando' },
  { id: 'sales_100', icon: '💯', label: '100 Ventas', desc: 'Alcanzaste 100 transacciones' },
  { id: 'digital_pay', icon: '📱', label: 'Pago Digital', desc: 'Usas QR o transferencia' },
  { id: 'monthly_goal', icon: '🏆', label: 'Meta Mensual', desc: 'Alcanzaste tu meta de ventas' },
  { id: 'supplier_eval', icon: '📝', label: 'Evaluador', desc: 'Evaluaste a un proveedor' },
];

function ScoreRing({ score }: { score: number }) {
  const r = 72;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={170} height={170} className="drop-shadow-2xl">
      {/* Background ring */}
      <circle cx={85} cy={85} r={r} fill="none" stroke="#27272a" strokeWidth={12} />
      {/* Score ring */}
      <motion.circle
        cx={85}
        cy={85}
        r={r}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        transform="rotate(-90 85 85)"
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      {/* Score text */}
      <text x={85} y={80} textAnchor="middle" fontSize={36} fontWeight="bold" fill="white" fontFamily="sans-serif">
        {score}
      </text>
      <text x={85} y={102} textAnchor="middle" fontSize={12} fill="#a1a1aa" fontFamily="sans-serif">
        / 100
      </text>
    </svg>
  );
}

function getLevelInfo(score: number) {
  if (score >= 90) return { label: 'Diamante', icon: '💎', color: '#06b6d4', next: null };
  if (score >= 70) return { label: 'Oro', icon: '🥇', color: '#f59e0b', next: 90 };
  if (score >= 50) return { label: 'Plata', icon: '🥈', color: '#a1a1aa', next: 70 };
  return { label: 'Bronce', icon: '🥉', color: '#d97706', next: 50 };
}

const SCORE_FACTORS = [
  { label: 'Consistencia en registros', value: 85, icon: '📋' },
  { label: 'Métodos de pago digitales', value: 70, icon: '📱' },
  { label: 'Metas de venta alcanzadas', value: 60, icon: '🎯' },
  { label: 'Perfil completo', value: 100, icon: '👤' },
];

export function TinkaScore() {
  const { user, sales } = useApp();
  const score = user?.tinkaScore ?? 78;
  const level = getLevelInfo(score);
  const [showCredit, setShowCredit] = useState(false);

  // Unlocked badges based on actual data
  const unlockedBadges = new Set<string>();
  if (sales.length >= 1) unlockedBadges.add('first_sale');
  if (sales.length >= 10) unlockedBadges.add('streak_7');
  if (sales.length >= 20) unlockedBadges.add('sales_100');
  if (sales.some(s => s.paymentMethod === 'qr' || s.paymentMethod === 'transfer')) unlockedBadges.add('digital_pay');
  if (score >= 70) unlockedBadges.add('monthly_goal');

  useEffect(() => {
    if (score >= 75) {
      const t = setTimeout(() => setShowCredit(true), 800);
      return () => clearTimeout(t);
    }
  }, [score]);

  const fireConfetti = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#d946ef', '#9333ea', '#f59e0b'] });
  };

  return (
    <div className="flex flex-col bg-background min-h-screen pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h2 className="text-2xl font-bold mb-1">Perfil Tinka</h2>
        <p className="text-sm text-muted-foreground">Tu nivel de formalidad digital</p>
      </div>

      {/* Score ring */}
      <div className="flex flex-col items-center py-6">
        <ScoreRing score={score} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 mt-4"
        >
          <span className="text-2xl">{level.icon}</span>
          <span className="text-xl font-bold" style={{ color: level.color }}>Nivel {level.label}</span>
        </motion.div>
        {level.next && (
          <p className="text-sm text-muted-foreground mt-1">
            {level.next - score} puntos para {getLevelInfo(level.next).label} {getLevelInfo(level.next).icon}
          </p>
        )}
      </div>

      {/* Score factors */}
      <div className="px-5 mb-6">
        <p className="text-sm font-semibold mb-4">¿Cómo se calcula tu score?</p>
        <div className="space-y-3">
          {SCORE_FACTORS.map((factor, i) => (
            <motion.div
              key={factor.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{factor.icon}</span>
                  <span className="text-sm font-medium">{factor.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#d946ef' }}>{factor.value}%</span>
              </div>
              <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #9333ea, #d946ef)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.value}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Microcredit card */}
      <AnimatePresence>
        {showCredit && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="px-5 mb-6"
          >
            <div
              className="rounded-3xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1055 50%, #4c1d8a 100%)' }}
            >
              {/* Shine effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-y-0 w-1/3 opacity-10"
                style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
              />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-purple-300 mb-1">🎉 Pre-aprobado</p>
                  <p className="text-lg font-bold text-white">Microcrédito Tinka</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}>
                  <span className="text-white font-bold">T</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{formatBs(5000)}</p>
              <p className="text-sm text-purple-200 mb-5">Capital de trabajo para tu negocio</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={fireConfetti}
                className="w-full py-3.5 rounded-2xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
              >
                Solicitar Ahora
              </motion.button>
              <p className="text-xs text-purple-300 text-center mt-3">Banco FIE · Sin papeleos adicionales</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges */}
      <div className="px-5">
        <p className="text-sm font-semibold mb-4">Logros y Badges</p>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = unlockedBadges.has(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex flex-col items-center p-4 rounded-2xl border text-center"
                style={{
                  backgroundColor: unlocked ? '#d946ef11' : '#18181b',
                  borderColor: unlocked ? '#d946ef44' : '#3f3f46',
                }}
              >
                <span className="text-3xl mb-2" style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.35)' }}>
                  {badge.icon}
                </span>
                <p className="text-xs font-semibold leading-tight" style={{ color: unlocked ? '#d946ef' : '#a1a1aa' }}>
                  {badge.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{badge.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
