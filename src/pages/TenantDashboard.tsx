import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Search, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { mockProperties } from '@/data/mockData';

const TenantDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'tenant') {
    return <Navigate to="/" replace />;
  }

  const stats = [
    { label: 'Favoris', value: '8', icon: Heart, color: 'text-red-600' },
    { label: 'Recherches sauvegardées', value: '3', icon: Search, color: 'text-blue-600' },
    { label: 'Notifications', value: '5', icon: Bell, color: 'text-yellow-600' },
    { label: 'Messages', value: '4', icon: MessageSquare, color: 'text-green-600' },
  ];

  const favoriteProperties = mockProperties.slice(0, 3);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord Locataire</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.fullname}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
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

        {/* Saved Searches */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recherches sauvegardées</CardTitle>
            <CardDescription>Vos critères de recherche enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Appartement T2 - Libreville', 'Villa avec jardin - Port Gentil', 'Studio meublé - Franceville'].map((search, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-gold" />
                    <span className="font-medium">{search}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir résultats
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle>Mes favoris</CardTitle>
            <CardDescription>Les propriétés que vous avez aimées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default TenantDashboard;
