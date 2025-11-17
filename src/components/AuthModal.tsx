import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Home, User } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) => {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'tenant' as 'owner' | 'tenant'
  });

  const [registerData, setRegisterData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as 'owner' | 'tenant'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(loginData.email, loginData.password, loginData.role);
    
    if (success) {
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue sur Domia !`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'Erreur de connexion',
        description: 'Email ou mot de passe incorrect',
        variant: 'destructive'
      });
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    const success = await register(
      registerData.fullname,
      registerData.email,
      registerData.password,
      registerData.role
    );
    
    if (success) {
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès !',
      });
      onOpenChange(false);
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
                <Label>Type de compte</Label>
                <RadioGroup
                  value={loginData.role}
                  onValueChange={(value) => setLoginData({ ...loginData, role: value as 'owner' | 'tenant' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tenant" id="login-tenant" />
                    <Label htmlFor="login-tenant" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Locataire
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="login-owner" />
                    <Label htmlFor="login-owner" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4" />
                      Propriétaire
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
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
                />
              </div>

              <Button type="submit" className="w-full gradient-gold" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Compte démo: proprio@domia.ga / locataire@domia.ga (mot de passe: password)
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de compte</Label>
                <RadioGroup
                  value={registerData.role}
                  onValueChange={(value) => setRegisterData({ ...registerData, role: value as 'owner' | 'tenant' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tenant" id="register-tenant" />
                    <Label htmlFor="register-tenant" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Locataire
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="register-owner" />
                    <Label htmlFor="register-owner" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4" />
                      Propriétaire
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-name">Nom complet</Label>
                <Input
                  id="register-name"
                  value={registerData.fullname}
                  onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                  required
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
                />
              </div>

              <Button type="submit" className="w-full gradient-gold" disabled={loading}>
                {loading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
