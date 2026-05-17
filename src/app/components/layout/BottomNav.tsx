import { motion } from 'motion/react';
import { Home, BarChart2, Users, User, Mic } from 'lucide-react';

export type AppTab = 'home' | 'reports' | 'suppliers' | 'profile';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onMicPress: () => void;
}

const LEFT_TABS = [
  { id: 'home' as AppTab, icon: Home, label: 'Inicio' },
  { id: 'reports' as AppTab, icon: BarChart2, label: 'Reportes' },
];

const RIGHT_TABS = [
  { id: 'suppliers' as AppTab, icon: Users, label: 'Proveed.' },
  { id: 'profile' as AppTab, icon: User, label: 'Perfil' },
];

export function BottomNav({ activeTab, onTabChange, onMicPress }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-[#18181b]/96 backdrop-blur-xl border-t border-border">
        <div className="flex items-end justify-around px-2 pt-1 pb-5 relative">
          {LEFT_TABS.map(tab => (
            <NavTab key={tab.id} tab={tab} isActive={activeTab === tab.id} onPress={() => onTabChange(tab.id)} />
          ))}

          {/* FAB spacer */}
          <div className="w-20" />

          {RIGHT_TABS.map(tab => (
            <NavTab key={tab.id} tab={tab} isActive={activeTab === tab.id} onPress={() => onTabChange(tab.id)} />
          ))}
        </div>
      </div>

      {/* FAB — centered, floats above bar */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMicPress}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl relative"
          style={{ background: 'linear-gradient(135deg, #d946ef 0%, #9333ea 100%)' }}
          aria-label="Registrar venta por voz"
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-[#d946ef]"
          />
          <Mic size={27} className="text-white relative z-10" strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}

type TabItem = { id: AppTab; icon: React.ElementType; label: string };

function NavTab({ tab, isActive, onPress }: { tab: TabItem; isActive: boolean; onPress: () => void }) {
  const Icon = tab.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onPress}
      className="flex flex-col items-center gap-1 px-3 py-1 min-w-[60px]"
    >
      <div className="relative">
        <Icon
          size={22}
          strokeWidth={isActive ? 2.3 : 1.7}
          className="transition-colors"
          style={{ color: isActive ? '#d946ef' : '#71717a' }}
        />
        {isActive && (
          <motion.div
            layoutId="nav-dot"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d946ef]"
          />
        )}
      </div>
      <span
        className="text-[10px] font-medium transition-colors"
        style={{ color: isActive ? '#d946ef' : '#71717a' }}
      >
        {tab.label}
      </span>
    </motion.button>
  );
}
