import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageSquare, User, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { useNotifications } from '@/hooks/useNotifications';
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
  const { data: notifications = [] } = useNotifications();
  const { isInstalled } = usePWAInstall();
  const unreadNotifs = notifications.filter((n: any) => !n.is_read).length;

  const isActive = (path: string) => location.pathname === path;

  if (!isInstalled) return null;

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/properties', label: 'Explorer', icon: Search },
    ...(isAuthenticated && role === 'owner' ? [{
      href: '/property/new', label: 'Publier', icon: Plus, isCenter: true,
    }] : []),
    {
      href: '/messages', label: 'Messages', icon: MessageSquare,
      badge: unreadMessages, requireAuth: true,
    },
    {
      href: isAuthenticated
        ? (role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant')
        : '/',
      label: 'Profil', icon: User,
      onClick: !isAuthenticated ? () => onOpenAuth?.('login') : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/30 safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-[68px] px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isCenter) {
            return (
              <Link key={item.href} to={item.href} className="flex flex-col items-center justify-center -mt-7">
                <div className="w-[52px] h-[52px] rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-accent/30 rotate-0 transition-transform active:scale-95">
                  <Icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <span className="text-[9px] font-semibold mt-1 text-accent">Publier</span>
              </Link>
            );
          }

          const content = (
            <div className="flex flex-col items-center justify-center gap-0.5 relative py-1">
              <div className="relative">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  active && "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "h-[22px] w-[22px] transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[9px] font-bold px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button key={item.label} onClick={item.onClick} className="flex-1 flex items-center justify-center active:scale-95 transition-transform">
                {content}
              </button>
            );
          }

          if (item.requireAuth && !isAuthenticated) {
            return (
              <button key={item.label} onClick={() => onOpenAuth?.('login')} className="flex-1 flex items-center justify-center active:scale-95 transition-transform">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.href} to={item.href} className="flex-1 flex items-center justify-center active:scale-95 transition-transform">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
