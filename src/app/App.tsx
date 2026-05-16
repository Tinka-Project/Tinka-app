import { useState, useEffect } from 'react';
import { OnboardingCategories } from './components/OnboardingCategories';
import { OnboardingVoice } from './components/OnboardingVoice';
import { OnboardingNotifications } from './components/OnboardingNotifications';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [onboardingStep, setOnboardingStep] = useState<'categories' | 'voice' | 'notifications' | 'complete'>('categories');
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [voiceLanguage, setVoiceLanguage] = useState('es-BO');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleCategoriesComplete = (categories: any[]) => {
    setSelectedCategories(categories);
    setOnboardingStep('voice');
  };

  const handleVoiceComplete = (language: string) => {
    setVoiceLanguage(language);
    setOnboardingStep('notifications');
  };

  const handleNotificationsComplete = () => {
    setOnboardingStep('complete');
  };

  const handleUpdateCategories = (categories: any[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="size-full bg-background text-foreground overflow-hidden">
      {onboardingStep === 'categories' && (
        <OnboardingCategories onNext={handleCategoriesComplete} />
      )}
      {onboardingStep === 'voice' && (
        <OnboardingVoice onNext={handleVoiceComplete} />
      )}
      {onboardingStep === 'notifications' && (
        <OnboardingNotifications onComplete={handleNotificationsComplete} />
      )}
      {onboardingStep === 'complete' && (
        <Dashboard
          categories={selectedCategories}
          onUpdateCategories={handleUpdateCategories}
        />
      )}
    </div>
  );
}