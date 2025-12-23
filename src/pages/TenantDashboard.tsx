import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Search, Bell, MessageSquare, Loader2, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useTenantStats } from '@/hooks/useStats';

const TenantDashboard = () => {
  const { profile, role, isAuthenticated, isLoading } = useAuth();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites();
  const { data: savedSearches = [] } = useSavedSearches();
  const { data: stats } = useTenantStats();

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
    { label: 'Favoris', value: stats?.favorites || 0, icon: Heart, color: 'text-red-600' },
    { label: 'Recherches sauvegardées', value: stats?.savedSearches || 0, icon: Search, color: 'text-blue-600' },
    { label: 'Notifications', value: stats?.notifications || 0, icon: Bell, color: 'text-yellow-600' },
    { label: 'Messages', value: stats?.messages || 0, icon: MessageSquare, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord Locataire</h1>
          <p className="text-muted-foreground">Bienvenue, {profile?.fullname}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover-lift cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recherches sauvegardées</CardTitle>
            <CardDescription>Vos critères de recherche enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            {savedSearches.length === 0 ? (
              <div className="text-center py-6">
                <Search className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucune recherche sauvegardée</p>
                <Button variant="outline" className="mt-3" asChild>
                  <Link to="/properties">Explorer les propriétés</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-gold" />
                      <span className="font-medium">{search.name}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/properties?city=${search.city || ''}&type=${search.type || ''}`}>
                        Voir résultats
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes favoris</CardTitle>
            <CardDescription>Les propriétés que vous avez aimées</CardDescription>
          </CardHeader>
          <CardContent>
            {favoritesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun favori pour le moment</p>
                <Button className="mt-4" variant="outline" asChild>
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
    </div>
  );
};

export default TenantDashboard;
