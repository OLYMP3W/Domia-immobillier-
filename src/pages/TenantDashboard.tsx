import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated || role !== 'tenant') {
    return <Navigate to="/" replace />;
  }

  const statsData = [
    { 
      label: 'Favoris', 
      value: stats?.favorites || 0, 
      icon: Heart, 
      color: 'bg-red-500/10 text-red-600',
      href: '#favorites'
    },
    { 
      label: 'Recherches sauvées', 
      value: stats?.savedSearches || 0, 
      icon: Search, 
      color: 'bg-blue-500/10 text-blue-600',
      href: '#searches'
    },
    { 
      label: 'Messages', 
      value: stats?.messages || 0, 
      icon: MessageSquare, 
      color: 'bg-purple-500/10 text-purple-600',
      href: '/messages'
    },
    { 
      label: 'Notifications', 
      value: stats?.notifications || 0, 
      icon: Bell, 
      color: 'bg-orange-500/10 text-orange-600',
      href: '/notifications'
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navbar />
      
      <div className="container py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bonjour, {profile?.fullname?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Trouvez votre futur logement
            </p>
          </div>
          <Button className="gradient-gold w-full lg:w-auto" size="lg" asChild>
            <Link to="/properties">
              <Search className="mr-2 h-5 w-5" />
              Explorer les annonces
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <Card className="relative overflow-hidden hover-lift cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 to-accent/20 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              </Card>
            );

            return stat.href.startsWith('#') ? (
              <a key={stat.label} href={stat.href}>
                {content}
              </a>
            ) : (
              <Link key={stat.label} to={stat.href}>
                {content}
              </Link>
            );
          })}
        </div>

        {/* Saved Searches */}
        <Card className="mb-8" id="searches">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gold" />
                Recherches sauvegardées
              </CardTitle>
              <CardDescription>Vos critères de recherche enregistrés</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {savedSearches.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">Aucune recherche sauvegardée</p>
                <Button variant="outline" asChild>
                  <Link to="/properties">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Explorer les propriétés
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {savedSearches.map((search) => (
                  <Link
                    key={search.id}
                    to={`/properties?city=${search.city || ''}&type=${search.type || ''}`}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{search.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {search.city || 'Toutes villes'} • {search.type || 'Tous types'}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card id="favorites">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mes favoris
              </CardTitle>
              <CardDescription>Les propriétés que vous avez aimées</CardDescription>
            </div>
            <Badge variant="secondary">{favorites.length} favori{favorites.length > 1 ? 's' : ''}</Badge>
          </CardHeader>
          <CardContent>
            {favoritesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Heart className="h-10 w-10 text-red-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  Ajoutez des propriétés à vos favoris pour les retrouver facilement
                </p>
                <Button variant="outline" asChild>
                  <Link to="/properties">Découvrir les propriétés</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((favorite) => (
                  favorite.property && <PropertyCard key={favorite.id} property={favorite.property} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
      <MobileNavbar onOpenAuth={(type) => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default TenantDashboard;
