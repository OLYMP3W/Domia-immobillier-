import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Button } from '@/components/ui/button';
import { Heart, Search, Bell, MessageSquare, Loader2, Home, TrendingUp, MapPin, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useTenantStats } from '@/hooks/useStats';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

const TenantDashboard = () => {
  const { profile, role, isAuthenticated, isLoading } = useAuth();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites();
  const { data: savedSearches = [] } = useSavedSearches();
  const { data: stats } = useTenantStats();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (!isAuthenticated || role !== 'tenant') return <Navigate to="/" replace />;

  const statsData = [
    { label: 'Favoris', value: stats?.favorites || 0, icon: Heart, gradient: 'from-red-500/10 to-red-600/5', iconColor: 'text-red-600', href: '#favorites' },
    { label: 'Recherches', value: stats?.savedSearches || 0, icon: Search, gradient: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-600', href: '#searches' },
    { label: 'Messages', value: stats?.messages || 0, icon: MessageSquare, gradient: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-600', href: '/messages' },
    { label: 'Notifications', value: stats?.notifications || 0, icon: Bell, gradient: 'from-orange-500/10 to-orange-600/5', iconColor: 'text-orange-600', href: '/notifications' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="container py-6 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Bonjour, {profile?.fullname?.split(' ')[0]} 👋</h1>
            <p className="text-muted-foreground mt-1">Trouvez votre futur logement</p>
          </div>
          <Button className="gradient-gold rounded-xl h-12 px-6 font-semibold" asChild>
            <Link to="/properties"><Search className="mr-2 h-5 w-5" /> Explorer les annonces</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            const inner = (
              <div className={`rounded-2xl border border-border/50 bg-gradient-to-br ${stat.gradient} p-5 transition-all hover:shadow-lg hover:-translate-y-0.5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-black mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-card/80 ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
            return stat.href.startsWith('#') ? <a key={stat.label} href={stat.href}>{inner}</a> : <Link key={stat.label} to={stat.href}>{inner}</Link>;
          })}
        </div>

        {/* Recherches sauvées */}
        <div className="rounded-2xl border border-border/50 bg-card mb-8" id="searches">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Search className="h-5 w-5 text-accent" /> Recherches sauvegardées</h2>
              <p className="text-sm text-muted-foreground mt-1">Vos critères enregistrés</p>
            </div>
          </div>
          <div className="p-4">
            {savedSearches.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">Aucune recherche sauvegardée</p>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link to="/properties"><TrendingUp className="mr-2 h-4 w-4" /> Explorer</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {savedSearches.map((search) => (
                  <Link key={search.id} to={`/properties?city=${search.city || ''}&type=${search.type || ''}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{search.name}</p>
                      <p className="text-sm text-muted-foreground">{search.city || 'Toutes villes'} • {search.type || 'Tous'}</p>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Favoris */}
        <div className="rounded-2xl border border-border/50 bg-card" id="favorites">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Mes favoris</h2>
              <p className="text-sm text-muted-foreground mt-1">Les propriétés que vous aimez</p>
            </div>
            <Badge variant="secondary" className="rounded-full">{favorites.length}</Badge>
          </div>
          <div className="p-4">
            {favoritesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                  <Heart className="h-10 w-10 text-red-300" />
                </div>
                <h3 className="text-lg font-bold mb-2">Aucun favori</h3>
                <p className="text-muted-foreground mb-4">Ajoutez des propriétés à vos favoris</p>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link to="/properties">Découvrir les propriétés</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((fav) => fav.property && <PropertyCard key={fav.id} property={fav.property} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <MobileNavbar onOpenAuth={() => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default TenantDashboard;
