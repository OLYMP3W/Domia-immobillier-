import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Bell, MessageSquare, Settings, Menu, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { useUnreadNotificationsCount } from '@/hooks/useNotifications';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import logo from '@/assets/logo-domia.png';

interface NavbarProps {
  onOpenAuth?: (type: 'login' | 'register') => void;
}

export const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const { profile, role, isAuthenticated, logout } = useAuth();
  const { data: unreadMessages = 0 } = useUnreadMessagesCount();
  const { data: unreadNotifications = 0 } = useUnreadNotificationsCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isInstalled } = usePWAInstall();
  
  const totalUnread = unreadMessages + unreadNotifications;
  
  // Cacher le bouton télécharger si déjà installé
  const showDownloadButton = !isInstalled;

  const handleMobileNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-1 animate-fade-in">
          <img src={logo} alt="Domia" className="h-8 w-8 sm:h-10 sm:w-10" draggable="false" />
          <span className="text-xl sm:text-2xl font-black text-primary">omia</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {showDownloadButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/install">
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Link>
            </Button>
          )}
          
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <Button variant="ghost" onClick={() => onOpenAuth?.('register')}>
                S'inscrire
              </Button>
              <Button className="gradient-gold" onClick={() => onOpenAuth?.('login')}>
                Se connecter
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-gold">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.fullname} />
                    <AvatarFallback className="bg-gold text-white">
                      {profile?.fullname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {totalUnread > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent">
                      {totalUnread}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.fullname}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}>
                    <Home className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    {unreadMessages > 0 && (
                      <Badge className="ml-auto" variant="secondary">{unreadMessages}</Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    {unreadNotifications > 0 && (
                      <Badge className="ml-auto" variant="secondary">{unreadNotifications}</Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && totalUnread > 0 && (
            <Badge className="h-5 min-w-5 rounded-full p-0 flex items-center justify-center bg-accent">
              {totalUnread}
            </Badge>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-1 mb-6">
                  <img src={logo} alt="Domia" className="h-8 w-8" draggable="false" />
                  <span className="text-xl font-black text-primary">omia</span>
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-gold text-white">
                          {profile?.fullname?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile?.fullname}</p>
                        <p className="text-xs text-muted-foreground">{profile?.email}</p>
                      </div>
                    </div>

                    <nav className="flex flex-col gap-1 flex-1">
                      <button
                        onClick={() => handleMobileNavigation('/')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Home className="h-5 w-5" />
                        Accueil
                      </button>
                      <button
                        onClick={() => handleMobileNavigation(role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <User className="h-5 w-5" />
                        Tableau de bord
                      </button>
                      <button
                        onClick={() => handleMobileNavigation('/messages')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left w-full"
                      >
                        <MessageSquare className="h-5 w-5" />
                        Messages
                        {unreadMessages > 0 && (
                          <Badge className="ml-auto">{unreadMessages}</Badge>
                        )}
                      </button>
                      <button
                        onClick={() => handleMobileNavigation('/notifications')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left w-full"
                      >
                        <Bell className="h-5 w-5" />
                        Notifications
                        {unreadNotifications > 0 && (
                          <Badge className="ml-auto">{unreadNotifications}</Badge>
                        )}
                      </button>
                      <button
                        onClick={() => handleMobileNavigation('/settings')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Settings className="h-5 w-5" />
                        Paramètres
                      </button>
                      {showDownloadButton && (
                        <button
                          onClick={() => handleMobileNavigation('/install')}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Download className="h-5 w-5" />
                          Télécharger l'app
                        </button>
                      )}
                    </nav>

                    <Button
                      variant="destructive"
                      className="mt-auto"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    {showDownloadButton && (
                      <button
                        onClick={() => handleMobileNavigation('/install')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Download className="h-5 w-5" />
                        Télécharger l'app
                      </button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        onOpenAuth?.('register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      S'inscrire
                    </Button>
                    <Button
                      className="w-full gradient-gold"
                      onClick={() => {
                        onOpenAuth?.('login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Se connecter
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
