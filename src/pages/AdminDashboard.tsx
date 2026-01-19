import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  TrendingUp,
  Shield,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Mail,
  Lock,
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
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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
      }
      setIsVerifying(false);
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  const handleAdminLogin = async () => {
    if (adminEmail !== 'infodomia7@gmail.com') {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'êtes pas autorisé à accéder à cette section',
        variant: 'destructive',
      });
      return;
    }

    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) throw error;
      
      setIsAdmin(true);
      loadAdminData();
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans le tableau de bord admin',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Get stats
      const [usersRes, propertiesRes, installsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('views', { count: 'exact' }),
        supabase.from('app_installs').select('*', { count: 'exact', head: true }),
      ]);

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role');

      const totalViews = propertiesRes.data?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;
      const owners = rolesData?.filter(r => r.role === 'owner').length || 0;
      const tenants = rolesData?.filter(r => r.role === 'tenant').length || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalOwners: owners,
        totalTenants: tenants,
        totalProperties: propertiesRes.count || 0,
        totalInstalls: installsRes.count || 0,
        totalViews,
      });

      // Get users with roles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, fullname, email, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesData) {
        const { data: rolesMap } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const roleMap = new Map(rolesMap?.map(r => [r.user_id, r.role]) || []);

        setUsers(profilesData.map(p => ({
          ...p,
          role: roleMap.get(p.user_id) || 'unknown',
        })));
      }

      // Get properties with owners
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title, city, owner_id, views, is_published, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (propertiesData) {
        const ownerIds = [...new Set(propertiesData.map(p => p.owner_id))];
        const { data: ownersData } = await supabase
          .from('profiles')
          .select('user_id, fullname, email')
          .in('user_id', ownerIds);

        const ownerMap = new Map(ownersData?.map(o => [o.user_id, o]) || []);

        setProperties(propertiesData.map(p => ({
          ...p,
          owner_name: ownerMap.get(p.owner_id)?.fullname || 'Inconnu',
          owner_email: ownerMap.get(p.owner_id)?.email || '',
        })));
      }

      // Get reports
      const { data: reportsData } = await supabase
        .from('reported_properties')
        .select('id, property_id, reason, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportsData) {
        const propertyIds = reportsData.map(r => r.property_id);
        const { data: reportedProperties } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds);

        const propMap = new Map(reportedProperties?.map(p => [p.id, p.title]) || []);

        setReports(reportsData.map(r => ({
          ...r,
          property_title: propMap.get(r.property_id) || 'Supprimée',
        })));
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: 'Annonce supprimée',
        description: 'L\'annonce a été supprimée avec succès',
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
      const { error } = await supabase
        .from('reported_properties')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status } : r
      ));

      toast({
        title: 'Signalement mis à jour',
      });
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

  // Admin login form
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Administration Domia</CardTitle>
              <CardDescription>
                Connectez-vous avec vos identifiants administrateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email administrateur</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="pl-10"
                    placeholder="admin@domia.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleAdminLogin}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Accéder au tableau de bord
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Admin dashboard
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualiser'}
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

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="properties">Annonces</TabsTrigger>
            <TabsTrigger value="reports">Signalements</TabsTrigger>
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
                        <TableHead>Inscrit le</TableHead>
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
                  Gérez les annonces publiées sur la plateforme
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
                          <TableCell>
                            <div>
                              <p className="font-medium">{property.owner_name}</p>
                              <p className="text-xs text-muted-foreground">{property.owner_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{property.views}</TableCell>
                          <TableCell>
                            <Badge variant={property.is_published ? 'default' : 'secondary'}>
                              {property.is_published ? 'Publié' : 'Brouillon'}
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
                                    Cette action est irréversible. L'annonce sera définitivement supprimée.
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
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Signalements
                </CardTitle>
                <CardDescription>
                  Annonces signalées par les utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Aucun signalement en attente</p>
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
                            <TableCell className="font-medium">{report.property_title}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  report.status === 'pending' ? 'outline' :
                                  report.status === 'removed' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {report.status === 'pending' ? 'En attente' :
                                 report.status === 'reviewed' ? 'Examiné' :
                                 report.status === 'removed' ? 'Supprimé' :
                                 'Rejeté'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: fr })}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUpdateReportStatus(report.id, 'removed')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
