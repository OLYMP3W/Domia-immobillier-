import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users,
  Home,
  Eye,
  Download,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalTenants: number;
  totalProperties: number;
  totalInstalls: number;
  totalViews: number;
}

interface UserData {
  user_id: string;
  fullname: string;
  email: string;
  role: string;
  created_at: string;
}

interface PropertyData {
  id: string;
  title: string;
  city: string;
  owner_name: string;
  owner_email: string;
  views: number;
  is_published: boolean;
  created_at: string;
}

interface ReportData {
  id: string;
  property_id: string;
  property_title: string;
  reason: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  // Verify admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsVerifying(false);
        return;
      }

      // Check if user email is admin
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === 'infodomia7@gmail.com') {
        setIsAdmin(true);
        loadAdminData();
      } else {
        navigate('/');
      }
      setIsVerifying(false);
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('admin-data', {
        body: { action: 'get-stats' },
      });

      if (response.error) throw response.error;

      const data = response.data;
      setStats(data.stats);
      setUsers(data.users);
      setProperties(data.properties);
      setReports(data.reports);

    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données admin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const response = await supabase.functions.invoke('admin-data', {
        body: { action: 'delete-property', propertyId },
      });

      if (response.error) throw response.error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: 'Annonce supprimée',
        description: "L'annonce a été supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await supabase.functions.invoke('admin-data', {
        body: { action: 'update-report', reportId, status },
      });

      if (response.error) throw response.error;

      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status } : r
      ));

      toast({ title: 'Signalement mis à jour' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (authLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Tableau de bord Admin
            </h1>
            <p className="text-muted-foreground">
              Gérez votre plateforme Domia
            </p>
          </div>
          <Button variant="outline" onClick={loadAdminData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {!loading && 'Actualiser'}
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Utilisateurs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalOwners}</p>
                    <p className="text-xs text-muted-foreground">Propriétaires</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTenants}</p>
                    <p className="text-xs text-muted-foreground">Locataires</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalProperties}</p>
                    <p className="text-xs text-muted-foreground">Annonces</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-cyan-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalInstalls}</p>
                    <p className="text-xs text-muted-foreground">Installations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalViews}</p>
                    <p className="text-xs text-muted-foreground">Vues totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Utilisateurs ({users.length})</TabsTrigger>
              <TabsTrigger value="properties">Annonces ({properties.length})</TabsTrigger>
              <TabsTrigger value="reports">Signalements ({reports.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs inscrits</CardTitle>
                  <CardDescription>
                    Liste de tous les utilisateurs avec leurs emails et rôles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Inscription</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-medium">{user.fullname}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                                {user.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les annonces</CardTitle>
                  <CardDescription>
                    Gérez les annonces de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Ville</TableHead>
                          <TableHead>Propriétaire</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Vues</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {property.title}
                            </TableCell>
                            <TableCell>{property.city}</TableCell>
                            <TableCell>{property.owner_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {property.owner_email}
                            </TableCell>
                            <TableCell>{property.views}</TableCell>
                            <TableCell>
                              <Badge variant={property.is_published ? 'default' : 'secondary'}>
                                {property.is_published ? 'Publiée' : 'Brouillon'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. L'annonce "{property.title}" sera définitivement supprimée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProperty(property.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Signalements</CardTitle>
                  <CardDescription>
                    Gérez les annonces signalées par les utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Aucun signalement
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Annonce</TableHead>
                            <TableHead>Raison</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">
                                {report.property_title}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {report.reason}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    report.status === 'pending' ? 'secondary' :
                                    report.status === 'reviewed' ? 'default' :
                                    report.status === 'removed' ? 'destructive' : 'outline'
                                  }
                                >
                                  {report.status === 'pending' ? 'En attente' :
                                   report.status === 'reviewed' ? 'Examiné' :
                                   report.status === 'removed' ? 'Supprimé' : 'Rejeté'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: fr })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
