import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Button } from '@/components/ui/button';
import { Plus, Home, Eye, MessageSquare, Bell, Loader2, Settings, Trash2, TrendingUp, DollarSign, Pencil, BarChart3 } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }
  if (!isAuthenticated || role !== 'owner') return <Navigate to="/" replace />;

  const handleDelete = async (id: string) => {
    try { await deleteProperty.mutateAsync(id); toast({ title: 'Annonce supprimée' }); }
    catch { toast({ title: 'Erreur', variant: 'destructive' }); }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try { await updateProperty.mutateAsync({ id, is_published: !currentStatus }); toast({ title: currentStatus ? 'Annonce désactivée' : 'Annonce publiée' }); }
    catch { toast({ title: 'Erreur', variant: 'destructive' }); }
  };

  const statsData = [
    { label: 'Annonces actives', value: stats?.activeListings || 0, icon: Home, gradient: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-600' },
    { label: 'Vues totales', value: stats?.totalViews || 0, icon: Eye, gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-600' },
    { label: 'Messages', value: unreadMessages, icon: MessageSquare, gradient: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-600', href: '/messages' },
    { label: 'Notifications', value: unreadNotifications, icon: Bell, gradient: 'from-orange-500/10 to-orange-600/5', iconColor: 'text-orange-600', href: '/notifications' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="container py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Bonjour, {profile?.fullname?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Voici un aperçu de votre activité</p>
          </div>
          <Button className="gradient-gold rounded-xl h-12 px-6 font-semibold" asChild>
            <Link to="/property/new">
              <Plus className="mr-2 h-5 w-5" /> Nouvelle annonce
            </Link>
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
            return stat.href ? <Link key={stat.label} to={stat.href}>{inner}</Link> : <div key={stat.label}>{inner}</div>;
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {[
            { label: 'Messages', icon: MessageSquare, href: '/messages', badge: unreadMessages },
            { label: 'Notifications', icon: Bell, href: '/notifications', badge: unreadNotifications },
            { label: 'Paramètres', icon: Settings, href: '/settings' },
            { label: 'Statistiques', icon: BarChart3, href: '#' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.label} variant="outline" className="h-auto py-3 px-5 rounded-xl flex-col gap-1.5 relative shrink-0" asChild>
                <Link to={action.href}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                  {action.badge && action.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                      {action.badge}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Liste annonces */}
        <div className="rounded-2xl border border-border/50 bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-xl font-bold">Mes annonces</h2>
              <p className="text-sm text-muted-foreground">Gérez vos propriétés</p>
            </div>
            <Badge variant="secondary" className="rounded-full">{properties.length}</Badge>
          </div>

          <div className="p-4">
            {propertiesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Home className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aucune annonce</h3>
                <p className="text-muted-foreground mb-6">Créez votre première annonce</p>
                <Button className="gradient-gold rounded-xl" asChild>
                  <Link to="/property/new"><Plus className="mr-2 h-5 w-5" /> Créer une annonce</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {properties.map((property) => (
                  <div key={property.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-xl p-4 hover:bg-muted/50 transition-all gap-4 group border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {property.images?.[0]?.url ? (
                          <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Home className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold truncate">{property.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{property.views || 0}</span>
                          <span>•</span>
                          <span>{property.price.toLocaleString()} CFA</span>
                          <span>•</span>
                          <span>{property.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Badge
                        variant={property.is_published ? 'default' : 'secondary'}
                        className="cursor-pointer rounded-full"
                        onClick={() => handleTogglePublish(property.id, property.is_published || false)}
                      >
                        {property.is_published ? 'Active' : 'Brouillon'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                        <Link to={`/property/${property.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                        <Link to={`/property/edit/${property.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'annonce ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(property.id)} className="bg-destructive text-destructive-foreground rounded-xl">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
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

export default OwnerDashboard;
