import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  const stats = [
    { label: 'Annonces actives', value: '3', icon: Home, color: 'text-gold' },
    { label: 'Vues ce mois', value: '247', icon: Eye, color: 'text-blue-600' },
    { label: 'Messages', value: '12', icon: MessageSquare, color: 'text-green-600' },
    { label: 'Taux de conversion', value: '8%', icon: TrendingUp, color: 'text-purple-600' },
  ];

  const myListings = [
    { id: 1, title: 'Appartement T3 Spacieux', status: 'active', views: 89, messages: 5 },
    { id: 2, title: 'Villa avec Piscine', status: 'active', views: 142, messages: 7 },
    { id: 3, title: 'Studio Centre-Ville', status: 'pending', views: 16, messages: 0 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord Propriétaire</h1>
            <p className="text-muted-foreground">Bienvenue, {user?.fullname}</p>
          </div>
          <Button className="gradient-gold">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
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

        {/* Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Mes annonces</CardTitle>
            <CardDescription>Gérez vos propriétés publiées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Home className="h-8 w-8 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {listing.views} vues
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {listing.messages} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                      {listing.status === 'active' ? 'Active' : 'En attente'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OwnerDashboard;
