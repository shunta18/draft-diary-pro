import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes

export const useConnectionMonitor = () => {
  const { toast } = useToast();
  const lastActiveTimeRef = useRef(Date.now());
  const hasShownWarning = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const inactiveDuration = Date.now() - lastActiveTimeRef.current;
        
        if (inactiveDuration > INACTIVITY_THRESHOLD) {
          if (!hasShownWarning.current) {
            toast({
              title: "接続を再確立しています...",
              description: "ページを更新します",
            });
            hasShownWarning.current = true;
          }
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        lastActiveTimeRef.current = Date.now();
        hasShownWarning.current = false;
      }
    };

    const handleFocus = () => {
      const inactiveDuration = Date.now() - lastActiveTimeRef.current;
      
      if (inactiveDuration > INACTIVITY_THRESHOLD) {
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [toast]);
};
