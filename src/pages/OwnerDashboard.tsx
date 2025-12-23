import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, Eye, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useMyProperties } from '@/hooks/useProperties';
import { useOwnerStats } from '@/hooks/useStats';

const OwnerDashboard = () => {
  const { profile, role, isAuthenticated, isLoading } = useAuth();
  const { data: properties = [], isLoading: propertiesLoading } = useMyProperties();
  const { data: stats } = useOwnerStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated || role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  const statsData = [
    { label: 'Annonces actives', value: stats?.activeListings || 0, icon: Home, color: 'text-gold' },
    { label: 'Vues ce mois', value: stats?.totalViews || 0, icon: Eye, color: 'text-blue-600' },
    { label: 'Messages', value: stats?.messages || 0, icon: MessageSquare, color: 'text-green-600' },
    { label: 'Taux de conversion', value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord Propriétaire</h1>
            <p className="text-muted-foreground">Bienvenue, {profile?.fullname}</p>
          </div>
          <Button className="gradient-gold" asChild>
            <Link to="/property/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle annonce
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover-lift">
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

        <Card>
          <CardHeader>
            <CardTitle>Mes annonces</CardTitle>
            <CardDescription>Gérez vos propriétés publiées</CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune annonce pour le moment</p>
                <Button className="mt-4 gradient-gold" asChild>
                  <Link to="/property/new">Créer ma première annonce</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {property.images?.[0]?.url ? (
                          <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                        ) : (
                          <Home className="h-8 w-8 text-gold" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{property.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {property.views} vues
                          </span>
                          <span>{property.price.toLocaleString()} CFA</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={property.is_published ? 'default' : 'secondary'}>
                        {property.is_published ? 'Active' : 'Brouillon'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/property/${property.id}/edit`}>Modifier</Link>
                      </Button>
                    </div>
                  </div>
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

export default OwnerDashboard;
