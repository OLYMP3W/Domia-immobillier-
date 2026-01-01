import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, Eye, MessageSquare, TrendingUp, Loader2, Settings, Bell, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useMyProperties, useDeleteProperty, useUpdateProperty } from '@/hooks/useProperties';
import { useOwnerStats } from '@/hooks/useStats';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { useUnreadNotificationsCount } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const OwnerDashboard = () => {
  const { profile, role, isAuthenticated, isLoading } = useAuth();
  const { data: properties = [], isLoading: propertiesLoading } = useMyProperties();
  const { data: stats } = useOwnerStats();
  const { data: unreadMessages = 0 } = useUnreadMessagesCount();
  const { data: unreadNotifications = 0 } = useUnreadNotificationsCount();
  const deleteProperty = useDeleteProperty();
  const updateProperty = useUpdateProperty();
  const { toast } = useToast();

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

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty.mutateAsync(id);
      toast({
        title: 'Succès',
        description: 'Annonce supprimée avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'annonce',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateProperty.mutateAsync({
        id,
        is_published: !currentStatus,
      });
      toast({
        title: 'Succès',
        description: currentStatus ? 'Annonce désactivée' : 'Annonce publiée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const statsData = [
    { label: 'Annonces actives', value: stats?.activeListings || 0, icon: Home, color: 'text-gold' },
    { label: 'Vues totales', value: stats?.totalViews || 0, icon: Eye, color: 'text-blue-600' },
    { label: 'Messages', value: unreadMessages, icon: MessageSquare, color: 'text-green-600' },
    { label: 'Notifications', value: unreadNotifications, icon: Bell, color: 'text-purple-600' },
  ];

  const quickActions = [
    { label: 'Accueil', icon: Home, href: '/' },
    { label: 'Nouvelle annonce', icon: Plus, href: '/property/new', primary: true },
    { label: 'Messages', icon: MessageSquare, href: '/messages', badge: unreadMessages },
    { label: 'Notifications', icon: Bell, href: '/notifications', badge: unreadNotifications },
    { label: 'Paramètres', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue, {profile?.fullname}</p>
          </div>
          <Button className="gradient-gold" asChild>
            <Link to="/property/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle annonce
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.primary ? 'default' : 'outline'}
                className={`h-auto py-4 flex-col gap-2 relative ${action.primary ? 'gradient-gold' : ''}`}
                asChild
              >
                <Link to={action.href}>
                  <Icon className="h-6 w-6" />
                  <span>{action.label}</span>
                  {action.badge && action.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {action.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Properties List */}
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
              <div className="text-center py-12">
                <Home className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune annonce</h3>
                <p className="text-muted-foreground mb-6">Commencez par créer votre première annonce</p>
                <Button className="gradient-gold" asChild>
                  <Link to="/property/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer ma première annonce
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {property.images?.[0]?.url ? (
                          <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                        ) : (
                          <Home className="h-8 w-8 text-gold" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{property.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {property.views || 0} vues
                          </span>
                          <span>•</span>
                          <span>{property.price.toLocaleString()} CFA</span>
                          <span>•</span>
                          <span>{property.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={property.is_published ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleTogglePublish(property.id, property.is_published || false)}
                      >
                        {property.is_published ? 'Active' : 'Brouillon'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/property/${property.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'annonce ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. L'annonce sera définitivement supprimée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(property.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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