import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, Eye, MessageSquare, Bell, Loader2, Settings, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useMyProperties, useDeleteProperty, useUpdateProperty } from '@/hooks/useProperties';
import { useOwnerStats } from '@/hooks/useStats';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { useUnreadNotificationsCount } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';
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
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

  const totalViews = stats?.totalViews || 0;
  const activeListings = stats?.activeListings || 0;

  const statsData = [
    { 
      label: 'Annonces actives', 
      value: activeListings, 
      icon: Home, 
      color: 'bg-blue-500/10 text-blue-600',
      trend: '+12%'
    },
    { 
      label: 'Vues totales', 
      value: totalViews, 
      icon: Eye, 
      color: 'bg-green-500/10 text-green-600',
      trend: '+28%'
    },
    { 
      label: 'Messages', 
      value: unreadMessages, 
      icon: MessageSquare, 
      color: 'bg-purple-500/10 text-purple-600',
      href: '/messages'
    },
    { 
      label: 'Notifications', 
      value: unreadNotifications, 
      icon: Bell, 
      color: 'bg-orange-500/10 text-orange-600',
      href: '/notifications'
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navbar />
      
      <div className="container py-6 md:py-8">
        {/* Header with welcome and CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bonjour, {profile?.fullname?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici un aperçu de votre activité
            </p>
          </div>
          <Button className="gradient-gold w-full lg:w-auto" size="lg" asChild>
            <Link to="/property/new">
              <Plus className="mr-2 h-5 w-5" />
              Nouvelle annonce
            </Link>
          </Button>
        </div>

        {/* Stats Grid - Pro Design */}
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
                      {stat.trend && (
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 to-accent/20 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              </Card>
            );

            return stat.href ? (
              <Link key={stat.label} to={stat.href}>
                {content}
              </Link>
            ) : (
              <div key={stat.label}>{content}</div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 grid-cols-3 md:grid-cols-5 mb-8">
          {[
            { label: 'Messages', icon: MessageSquare, href: '/messages', badge: unreadMessages },
            { label: 'Notifications', icon: Bell, href: '/notifications', badge: unreadNotifications },
            { label: 'Mon profil', icon: Settings, href: '/settings' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex-col gap-2 relative"
                asChild
              >
                <Link to={action.href}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                  {action.badge && action.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Properties List - Modern Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes annonces</CardTitle>
              <CardDescription>Gérez vos propriétés publiées</CardDescription>
            </div>
            <Badge variant="secondary">{properties.length} annonce{properties.length > 1 ? 's' : ''}</Badge>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Home className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucune annonce</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Commencez par créer votre première annonce pour attirer des locataires
                </p>
                <Button className="gradient-gold" size="lg" asChild>
                  <Link to="/property/new">
                    <Plus className="mr-2 h-5 w-5" />
                    Créer ma première annonce
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-all gap-4 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {property.images?.[0]?.url ? (
                          <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                        ) : (
                          <Home className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{property.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {property.views || 0}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {property.price.toLocaleString()} CFA
                          </span>
                          <span>•</span>
                          <span>{property.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Badge 
                        variant={property.is_published ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleTogglePublish(property.id, property.is_published || false)}
                      >
                        {property.is_published ? 'Active' : 'Brouillon'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/property/${property.id}`}>
                          <Eye className="h-4 w-4" />
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
      <MobileNavbar onOpenAuth={(type) => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default OwnerDashboard;
