import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Home, User, Loader2, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import logo from '@/assets/logo-domia.png';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) => {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: '',
    role: '' as 'owner' | 'tenant' | ''
  });

  // Connexion avec Google ou Apple
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: 'Erreur',
          description: `Impossible de se connecter avec ${provider === 'google' ? 'Google' : 'Apple'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      // Vérifier si c'est un admin
      const { data: isAdmin } = await supabase.rpc('is_admin_by_email', { _email: loginData.email });
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue sur Domia !`,
      });
      onOpenChange(false);
      setLoginData({ email: '', password: '' });
      
      if (isAdmin) {
        navigate('/admin');
      }
    } else {
      toast({
        title: 'Erreur de connexion',
        description: result.error || 'Email ou mot de passe incorrect',
        variant: 'destructive'
      });
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.role) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner votre type de compte',
        variant: 'destructive'
      });
      return;
    }

    // Propriétaire doit fournir phone
    if (registerData.role === 'owner' && !registerData.phone.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le numéro de téléphone est obligatoire pour les propriétaires',
        variant: 'destructive'
      });
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive'
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    const result = await register(
      registerData.fullname,
      registerData.email,
      registerData.password,
      registerData.role
    );
    
    if (result.success) {
      // Mettre à jour le profil avec phone et whatsapp si fournis
      if (registerData.phone || registerData.whatsapp) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const updateData: Record<string, string> = {};
          if (registerData.phone) updateData.phone = registerData.phone;
          if (registerData.whatsapp) updateData.whatsapp = registerData.whatsapp;
          
          await supabase.from('profiles').update(updateData).eq('user_id', user.id);
        }
      }

      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès !',
      });
      onOpenChange(false);
      setRegisterData({ fullname: '', email: '', password: '', confirmPassword: '', phone: '', whatsapp: '', role: '' });
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Une erreur est survenue',
        variant: 'destructive'
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <img src={logo} alt="Domia" className="h-8 w-8" />
            <span>omia</span>
          </DialogTitle>
          <DialogDescription>
            Connectez-vous ou créez un compte pour accéder à toutes les fonctionnalités
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={!!socialLoading || loading}
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('apple')}
                disabled={!!socialLoading || loading}
              >
                {socialLoading === 'apple' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                )}
                Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full gradient-gold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={!!socialLoading || loading}
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('apple')}
                disabled={!!socialLoading || loading}
              >
                {socialLoading === 'apple' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                )}
                Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Type de compte - VISIBLE ET OBLIGATOIRE */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Je suis un(e) <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, role: 'tenant' })}
                    disabled={loading}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      registerData.role === 'tenant' 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      registerData.role === 'tenant' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <User className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Locataire</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Je cherche un logement
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, role: 'owner' })}
                    disabled={loading}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      registerData.role === 'owner' 
                        ? "border-accent bg-accent/5 shadow-md" 
                        : "border-border hover:border-accent/50 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      registerData.role === 'owner' ? "gradient-gold" : "bg-muted"
                    )}>
                      <Building2 className={cn("h-6 w-6", registerData.role === 'owner' && "text-white")} />
                    </div>
                    <span className="font-medium">Propriétaire</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Je publie des annonces
                    </span>
                  </button>
                </div>
                {!registerData.role && (
                  <p className="text-xs text-muted-foreground text-center">
                    Sélectionnez votre type de compte pour continuer
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-name">Nom complet <span className="text-destructive">*</span></Label>
                <Input
                  id="register-name"
                  value={registerData.fullname}
                  onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              {/* Champs téléphone - obligatoire pour propriétaire */}
              <div className="space-y-2">
                <Label htmlFor="register-phone">
                  Téléphone {registerData.role === 'owner' && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="register-phone"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  placeholder="+241 XX XX XX XX"
                  required={registerData.role === 'owner'}
                  disabled={loading}
                />
              </div>

              {registerData.role === 'owner' && (
                <div className="space-y-2">
                  <Label htmlFor="register-whatsapp" className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.613.613l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.7-6.413-1.907l-.448-.278-2.99 1.003 1.003-2.99-.278-.448A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    WhatsApp
                  </Label>
                  <Input
                    id="register-whatsapp"
                    value={registerData.whatsapp}
                    onChange={(e) => setRegisterData({ ...registerData, whatsapp: e.target.value })}
                    placeholder="+241 XX XX XX XX"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe <span className="text-destructive">*</span></Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirmer le mot de passe <span className="text-destructive">*</span></Label>
                <Input
                  id="register-confirm"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full gradient-gold" disabled={loading || !registerData.role}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
