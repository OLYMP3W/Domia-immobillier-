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
import logo from '@/assets/logo.png';

interface NavbarProps {
  onOpenAuth?: (type: 'login' | 'register') => void;
}

export const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();

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
                    <AvatarImage src={user?.profilePic} alt={user?.fullname} />
                    <AvatarFallback className="bg-gold text-white">
                      {user?.fullname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullname}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}>
                    <Home className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
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
