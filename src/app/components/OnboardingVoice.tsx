import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mic } from 'lucide-react';

interface Props {
  onNext: (language: string) => void;
}

export function OnboardingVoice({ onNext }: Props) {
  const [language, setLanguage] = useState('es-BO');
  const [showLanguages, setShowLanguages] = useState(false);

  const languages = [
    { code: 'es-BO', name: 'español (Bolivia)', flag: '🇧🇴' },
    { code: 'es-ES', name: 'español (España)', flag: '🇪🇸' },
    { code: 'es-419', name: 'español (Latinoamérica)', flag: '🌎' },
    { code: 'es-CL', name: 'español (Chile)', flag: '🇨🇱' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        Entrada de voz
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-12"
      >
        Agrega transacciones con tu voz automáticamente
      </motion.p>

      <div className="flex-1 flex items-center justify-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff9f43] to-[#ff6b6b] blur-3xl"
          />
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#ff9f43] to-[#ff6b6b] flex items-center justify-center">
            <Mic size={64} className="text-background" />
          </div>

          <motion.div
            animate={{
              scaleY: [1, 1.5, 0.8, 1.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#ff9f43] to-transparent rounded-full"
          />
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setShowLanguages(true)}
        className="w-full p-4 rounded-2xl bg-card border border-border mb-6 flex items-center justify-between"
      >
        <span className="text-muted-foreground">Idioma de entrada de voz</span>
        <span>
          {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.code.split('-')[0].toUpperCase()}
        </span>
      </motion.button>

      {showLanguages && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-background z-50 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2>Idioma de entrada de voz</h2>
            <button
              onClick={() => setShowLanguages(false)}
              className="text-muted-foreground"
            >
              ✕
            </button>
          </div>

          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowLanguages(false);
              }}
              className="w-full p-4 rounded-2xl bg-card border border-border mb-3 flex items-center gap-3"
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <div>{lang.name}</div>
                <div className="text-sm text-muted-foreground">{lang.code}</div>
              </div>
              {language === lang.code && (
                <span className="text-success">✓</span>
              )}
            </button>
          ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => onNext(language)}
        className="w-full p-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
      >
        Siguiente
        <ArrowRight size={20} />
      </motion.button>
    </div>
  );
}
