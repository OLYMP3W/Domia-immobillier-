import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileNavbarProps {
  onOpenAuth?: (type: 'login' | 'register') => void;
}

export const MobileNavbar = ({ onOpenAuth }: MobileNavbarProps) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const { data: unreadMessages = 0 } = useUnreadMessagesCount();
  const { isInstalled } = usePWAInstall();

  const isActive = (path: string) => location.pathname === path;

  // Navbar mobile uniquement visible quand l'app est installée (PWA)
  if (!isInstalled) {
    return null;
  }

  // Navigation items dynamiques selon le rôle
  const navItems = [
    {
      href: '/',
      label: 'Accueil',
      icon: Home,
    },
    {
      href: '/properties',
      label: 'Recherche',
      icon: Search,
    },
    // Bouton central + (seulement pour owners)
    ...(isAuthenticated && role === 'owner' ? [{
      href: '/property/new',
      label: 'Publier',
      icon: Plus,
      isCenter: true,
    }] : []),
    {
      href: '/messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessages,
      requireAuth: true,
    },
    {
      href: isAuthenticated 
        ? (role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant') 
        : '/',
      label: 'Profil',
      icon: User,
      onClick: !isAuthenticated ? () => onOpenAuth?.('login') : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          // Bouton central stylisé pour publier
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-lg">
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </Link>
            );
          }
          
          // Items normaux
          const content = (
            <div className="flex flex-col items-center justify-center gap-0.5 relative">
              <div className="relative">
                <Icon className={cn(
                  "h-6 w-6 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )} />
                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-accent">
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex-1 flex items-center justify-center py-2"
              >
                {content}
              </button>
            );
          }

          if (item.requireAuth && !isAuthenticated) {
            return (
              <button
                key={item.label}
                onClick={() => onOpenAuth?.('login')}
                className="flex-1 flex items-center justify-center py-2"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex-1 flex items-center justify-center py-2"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
