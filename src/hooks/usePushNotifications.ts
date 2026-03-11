import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Fetch VAPID public key dynamically from edge function
let cachedVapidKey: string | null = null;

const getVapidPublicKey = async (): Promise<string | null> => {
  if (cachedVapidKey) return cachedVapidKey;
  try {
    const { data, error } = await supabase.functions.invoke('generate-vapid-keys', {
      body: { action: 'get_public_key' },
    });
    if (data?.publicKey) {
      cachedVapidKey = data.publicKey;
      return data.publicKey;
    }
  } catch {}
  // Fallback hardcoded key
  return 'BLNGIPFo5HRAKcHI5L_aX3PPXKqDyIZYCYZvDfjFOBi0CcvSGzFVXPs0o-_3h-75X8RzHkSN-33uh5s_c5somTM';
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (e) {
      console.error('Erreur vérification abonnement push:', e);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return registration;
    } catch (e) {
      console.error('Erreur enregistrement SW:', e);
      return null;
    }
  };

  const subscribe = async () => {
    if (!user || !isSupported) return false;

    try {
      // Demander la permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        toast({
          title: 'Notifications bloquées',
          description: 'Activez les notifications dans les paramètres de votre navigateur',
          variant: 'destructive',
        });
        return false;
      }

      // Enregistrer le service worker
      const registration = await registerServiceWorker();
      if (!registration) return false;

      await navigator.serviceWorker.ready;

      // S'abonner aux push
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const keys = subscription.toJSON();

      // Sauvegarder en base
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.keys?.p256dh || '',
        auth: keys.keys?.auth || '',
      }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Notifications activées',
        description: 'Vous recevrez des notifications pour les messages et nouvelles annonces',
      });
      return true;
    } catch (e) {
      console.error('Erreur abonnement push:', e);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer les notifications push',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Supprimer de la base
        if (user) {
          await supabase.from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }
      
      setIsSubscribed(false);
      toast({ title: 'Notifications désactivées' });
    } catch (e) {
      console.error('Erreur désabonnement push:', e);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  };
};
