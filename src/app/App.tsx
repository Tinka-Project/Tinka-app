import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'sonner';
import { AppProvider, useApp, ProductCategory } from './contexts/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { OnboardingCategories } from './components/OnboardingCategories';
import { OnboardingVoice } from './components/OnboardingVoice';
import { OnboardingNotifications } from './components/OnboardingNotifications';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { VoiceInput } from './components/VoiceInput';
import { SaleConfirmModal, PrefilledSale } from './components/sales/SaleConfirmModal';
import { QRPaymentModal } from './components/qr/QRPaymentModal';
import { ReportsView } from './components/reports/ReportsView';
import { BIInsights } from './components/bi/BIInsights';
import { TinkaScore } from './components/gamification/TinkaScore';
import { SupplierList } from './components/suppliers/SupplierList';
import { BottomNav, AppTab } from './components/layout/BottomNav';

type AppScreen = 'login' | 'onboarding-categories' | 'onboarding-voice' | 'onboarding-notifications' | 'app';

function AppInner() {
  const { setCategories, addSale, categories } = useApp();
  const [screen, setScreen] = useState<AppScreen>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // Overlays
  const [showVoice, setShowVoice] = useState(false);
  const [showSaleConfirm, setShowSaleConfirm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingSale, setPendingSale] = useState<PrefilledSale | null>(null);
  const [qrData, setQrData] = useState<{ amount: number; product: string } | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // ── Onboarding handlers ──────────────────────────────────────────────────
  const handleLogin = () => setScreen('onboarding-categories');

  const handleCategoriesDone = (cats: ProductCategory[]) => {
    setCategories(cats);
    setScreen('onboarding-voice');
  };

  const handleVoiceDone = () => setScreen('onboarding-notifications');
  const handleNotificationsDone = () => setScreen('app');

  // ── Sale flow handlers ───────────────────────────────────────────────────
  const handleVoiceSaleDetected = (sale: PrefilledSale) => {
    setShowVoice(false);
    setPendingSale(sale);
    setShowSaleConfirm(true);
  };

  const handleSaleConfirmed = (sale: PrefilledSale) => {
    addSale({
      product: sale.product,
      amount: sale.amount,
      paymentMethod: sale.paymentMethod,
      location: sale.location,
      categoryId: sale.categoryId,
    });
    setShowSaleConfirm(false);
    setPendingSale(null);
  };

  const handleQRRequested = (amount: number, product: string) => {
    setQrData({ amount, product });
    setShowQR(true);
  };

  // ── Tab content ──────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onOpenSettings={() => setShowSettings(true)} />;
      case 'reports':
        return (
          <div>
            <ReportsView />
            <BIInsights />
          </div>
        );
      case 'suppliers':
        return <SupplierList />;
      case 'profile':
        return <TinkaScore />;
    }
  };

  // ── Pre-app screens ──────────────────────────────────────────────────────
  if (screen === 'login')                    return <LoginScreen onLogin={handleLogin} />;
  if (screen === 'onboarding-categories')    return <OnboardingCategories onNext={handleCategoriesDone} />;
  if (screen === 'onboarding-voice')         return <OnboardingVoice onNext={handleVoiceDone} />;
  if (screen === 'onboarding-notifications') return <OnboardingNotifications onComplete={handleNotificationsDone} />;

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-background text-foreground">

      {/* Tab content with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMicPress={() => setShowVoice(true)}
      />

      {/* ── Overlays ── */}

      <AnimatePresence>
        {showVoice && (
          <VoiceInput
            onClose={() => setShowVoice(false)}
            onSaleDetected={handleVoiceSaleDetected}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaleConfirm && pendingSale && (
          <SaleConfirmModal
            prefilled={pendingSale}
            onClose={() => { setShowSaleConfirm(false); setPendingSale(null); }}
            onConfirm={handleSaleConfirmed}
            onQRRequested={handleQRRequested}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQR && qrData && (
          <QRPaymentModal
            amount={qrData.amount}
            product={qrData.product}
            onClose={() => { setShowQR(false); setQrData(null); }}
          />
        )}
      </AnimatePresence>

      {showSettings && (
        <SettingsPanel
          categories={categories}
          onClose={() => setShowSettings(false)}
          onUpdateCategories={setCategories}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #3f3f46',
            color: '#fafafa',
            borderRadius: '16px',
          },
        }}
      />
    </AppProvider>
  );
}
