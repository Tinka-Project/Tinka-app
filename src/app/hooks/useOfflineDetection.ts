import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión restaurada', {
        description: 'Sincronizando datos guardados localmente...',
        duration: 3500,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sin conexión a internet', {
        description: 'Tus ventas se guardan localmente y se sincronizan al reconectar.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
