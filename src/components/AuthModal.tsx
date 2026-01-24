import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Home, User, Loader2, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'owner' | 'tenant' | ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue sur Domia !`,
      });
      onOpenChange(false);
      setLoginData({ email: '', password: '' });
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
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès !',
      });
      onOpenChange(false);
      setRegisterData({ fullname: '', email: '', password: '', confirmPassword: '', role: '' });
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <img src={logo} alt="Domia" className="h-8 w-8" />
            <span>Domia</span>
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
                <Label htmlFor="register-name">Nom complet</Label>
                <Input
                  id="register-name"
                  value={registerData.fullname}
                  onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
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

              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe</Label>
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
                <Label htmlFor="register-confirm">Confirmer le mot de passe</Label>
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
