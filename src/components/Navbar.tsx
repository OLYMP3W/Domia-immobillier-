import { Link } from 'react-router-dom';
import { Home, User, LogOut, Bell, MessageSquare, Settings } from 'lucide-react';
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
import logo from '@/assets/logo.png';

interface NavbarProps {
  onOpenAuth?: (type: 'login' | 'register') => void;
}

export const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const { profile, role, isAuthenticated, logout } = useAuth();
  const { data: unreadMessages = 0 } = useUnreadMessagesCount();
  const { data: unreadNotifications = 0 } = useUnreadNotificationsCount();
  
  const totalUnread = unreadMessages + unreadNotifications;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 animate-fade-in">
          <img src={logo} alt="Domia" className="h-10 w-10" />
          <span className="text-2xl font-black text-primary">Domia</span>
        </Link>

        <nav className="flex items-center gap-4">
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
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
};
