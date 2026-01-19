import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
      return;
    }

    // Check local storage
    if (localStorage.getItem('pwa-installed') === 'true') {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show banner after 3 seconds if not dismissed before
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      localStorage.setItem('pwa-installed', 'true');
      
      // Track installation
      trackInstall();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const trackInstall = async () => {
    try {
      const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;
      await supabase.from('app_installs').insert({
        user_id: user?.id || null,
        device_info: deviceInfo,
      });
    } catch (error) {
      console.error('Failed to track install:', error);
    }
  };

  const promptInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Installation',
        description: 'Utilisez le menu de votre navigateur pour installer l\'app',
      });
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: 'Installation réussie !',
          description: 'Domia a été ajouté à votre écran d\'accueil',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  return {
    isInstalled,
    canInstall: !!deferredPrompt,
    showInstallBanner,
    promptInstall,
    dismissBanner,
  };
};

export const PWAInstallBanner = () => {
  const { showInstallBanner, promptInstall, dismissBanner, isInstalled } = usePWAInstall();

  if (isInstalled || !showInstallBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg animate-slide-up">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Installez Domia</p>
            <p className="text-sm opacity-90">Accès rapide depuis votre écran d'accueil</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={promptInstall}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Installer
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={dismissBanner}
            className="text-primary-foreground hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton = () => {
  const { isInstalled, canInstall, promptInstall } = usePWAInstall();

  if (isInstalled) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Smartphone className="h-4 w-4" />
        App installée
      </Button>
    );
  }

  return (
    <Button 
      onClick={promptInstall} 
      disabled={!canInstall}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Installer l'app
    </Button>
  );
};
