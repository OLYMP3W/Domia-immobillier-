import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Apple, Play, Check, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const features = [
    'Accès hors ligne',
    'Notifications push',
    'Expérience native',
    'Chargement rapide',
    'Mises à jour automatiques',
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>

        <div className="text-center mb-8">
          <img src={logo} alt="Domia" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Télécharger Domia</h1>
          <p className="text-muted-foreground">
            Installez l'application pour une meilleure expérience
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Application installée !</h2>
              <p className="text-muted-foreground">
                Domia est déjà installée sur votre appareil
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Install Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-gold" />
                  Installation
                </CardTitle>
                <CardDescription>
                  Ajoutez Domia à votre écran d'accueil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isInstallable ? (
                  <Button 
                    className="w-full gradient-gold" 
                    size="lg"
                    onClick={handleInstall}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Installer l'application
                  </Button>
                ) : isIOS ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Pour installer sur iPhone/iPad :
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">1</span>
                        <span>Appuyez sur le bouton <strong>Partager</strong> en bas de Safari</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">2</span>
                        <span>Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">3</span>
                        <span>Appuyez sur <strong>Ajouter</strong></span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Pour installer sur Android :
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">1</span>
                        <span>Ouvrez le menu du navigateur (3 points)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">2</span>
                        <span>Appuyez sur <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></span>
                      </li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Avantages de l'application</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-gold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Store Links (for future native apps) */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4" disabled>
                <Apple className="mr-2 h-6 w-6" />
                <div className="text-left">
                  <div className="text-xs">Bientôt sur</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4" disabled>
                <Play className="mr-2 h-6 w-6" />
                <div className="text-left">
                  <div className="text-xs">Bientôt sur</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Install;
