import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Fingerprint, X, ChevronDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const handleLogin = () => {
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      login(email);
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleBiometric = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('maria@tinka.bo');
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* PWA Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-[#27272a] border-b border-border px-4 py-3 flex items-center gap-3 z-20 relative"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}>
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">Añadir Tinka a inicio</p>
              <p className="text-xs text-muted-foreground truncate">Acceso offline disponible</p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-muted-foreground flex-shrink-0 p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10">
        {/* Logo & Branding */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12 mt-4"
        >
          {/* FIE Logo Placeholder */}
          <div className="w-20 h-20 rounded-3xl mb-5 flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #d946ef 0%, #9333ea 60%, #6d28d9 100%)' }}>
            <span className="text-white text-3xl font-bold tracking-tight">T</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-3xl border-2 border-white/20"
            />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">Tinka Digital</h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card">
            <div className="w-2 h-2 rounded-full bg-[#d946ef]" />
            <span className="text-xs text-muted-foreground">Comunidad Tinka · Banco FIE</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-6"
        >
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-[#d946ef] focus:ring-2 focus:ring-[#d946ef]/20"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-[#d946ef] focus:ring-2 focus:ring-[#d946ef]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Biometric Toggle */}
          <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <Fingerprint size={20} className="text-[#d946ef]" />
              <div>
                <p className="text-sm font-medium">Acceso Biométrico</p>
                <p className="text-xs text-muted-foreground">Face ID / Huella dactilar</p>
              </div>
            </div>
            <button
              onClick={() => setBiometric(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${biometric ? 'bg-[#d946ef]' : 'bg-border'}`}
            >
              <motion.div
                animate={{ x: biometric ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              />
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
            style={{ background: 'linear-gradient(135deg, #d946ef, #9333ea)' }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              'Ingresar'
            )}
          </motion.button>

          {biometric && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBiometric}
              className="w-full py-4 rounded-2xl font-medium text-[#d946ef] bg-[#d946ef]/10 border border-[#d946ef]/30 flex items-center justify-center gap-2"
            >
              <Fingerprint size={20} />
              Usar biométrico
            </motion.button>
          )}

          {/* Demo quick access */}
          <button
            onClick={() => {
              setEmail('maria@tinka.bo');
              setPassword('tinka2026');
            }}
            className="w-full text-center text-xs text-muted-foreground py-2"
          >
            Demo: maria@tinka.bo / tinka2026
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-auto pt-8 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Tus datos son privados y seguros.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Banco FIE S.A. · Bolivia
          </p>
        </motion.div>
      </div>
    </div>
  );
}
