import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Bell, MessageSquare, Settings, Menu, Download, Search, FileText, X, ChevronRight } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center animate-fade-in">
          <img src={logo} alt="Domia" className="h-16 sm:h-20" draggable="false" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/properties">Explorer</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blog">Blog</Link>
          </Button>
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
                    {unreadMessages > 0 && <Badge className="ml-auto" variant="secondary">{unreadMessages}</Badge>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    {unreadNotifications > 0 && <Badge className="ml-auto" variant="secondary">{unreadNotifications}</Badge>}
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
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 border-l border-border/30">
              <div className="flex flex-col h-full">
                {/* Header du menu */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                  <img src={logo} alt="Domia" className="h-12" draggable="false" />
                </div>

                {isAuthenticated ? (
                  <>
                    {/* Profile card */}
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5">
                        <Avatar className="h-12 w-12 ring-2 ring-accent/20">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                            {profile?.fullname?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{profile?.fullname}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                          <Badge variant="outline" className="mt-1 text-[10px] h-5">
                            {role === 'owner' ? '🏠 Propriétaire' : '🔍 Locataire'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Navigation items */}
                    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                      <MenuButton icon={Home} label="Accueil" onClick={() => handleMobileNavigation('/')} />
                      <MenuButton icon={Search} label="Explorer" onClick={() => handleMobileNavigation('/properties')} />
                      <MenuButton 
                        icon={User} 
                        label="Tableau de bord" 
                        onClick={() => handleMobileNavigation(role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant')} 
                      />
                      <MenuButton 
                        icon={MessageSquare} 
                        label="Messages" 
                        badge={unreadMessages > 0 ? unreadMessages : undefined}
                        onClick={() => handleMobileNavigation('/messages')} 
                      />
                      <MenuButton 
                        icon={Bell} 
                        label="Notifications" 
                        badge={unreadNotifications > 0 ? unreadNotifications : undefined}
                        onClick={() => handleMobileNavigation('/notifications')} 
                      />
                      <MenuButton icon={FileText} label="Blog" isNew onClick={() => handleMobileNavigation('/blog')} />
                      <MenuButton icon={Settings} label="Paramètres" onClick={() => handleMobileNavigation('/settings')} />
                      {showDownloadButton && (
                        <MenuButton icon={Download} label="Télécharger l'app" onClick={() => handleMobileNavigation('/install')} />
                      )}
                    </nav>

                    {/* Logout */}
                    <div className="px-5 py-4 border-t border-border/30">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col px-5 py-6 gap-3">
                    <MenuButton icon={Search} label="Explorer" onClick={() => handleMobileNavigation('/properties')} />
                    <MenuButton icon={FileText} label="Blog" isNew onClick={() => handleMobileNavigation('/blog')} />
                    {showDownloadButton && (
                      <MenuButton icon={Download} label="Télécharger l'app" onClick={() => handleMobileNavigation('/install')} />
                    )}
                    <div className="mt-4 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-11"
                        onClick={() => { onOpenAuth?.('register'); setMobileMenuOpen(false); }}
                      >
                        S'inscrire
                      </Button>
                      <Button
                        className="w-full gradient-gold rounded-xl h-11"
                        onClick={() => { onOpenAuth?.('login'); setMobileMenuOpen(false); }}
                      >
                        Se connecter
                      </Button>
                    </div>
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

// Composant bouton du menu
const MenuButton = ({ 
  icon: Icon, label, badge, isNew, onClick 
}: { 
  icon: any; label: string; badge?: number; isNew?: boolean; onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/80 active:scale-[0.98] transition-all text-left group"
  >
    <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
      <Icon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <span className="flex-1 text-sm font-medium">{label}</span>
    {isNew && (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
        NEW
      </span>
    )}
    {badge !== undefined && badge > 0 && (
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1.5">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
  </button>
);
