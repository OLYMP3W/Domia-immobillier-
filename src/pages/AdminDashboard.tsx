import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users, Home, Eye, Download, Shield, Trash2, CheckCircle, XCircle,
  Loader2, RefreshCw, Send, Bell, Activity, TrendingUp, MessageSquare,
  BarChart3, Globe, Megaphone,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsVerifying(false); return; }
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === 'infodomia7@gmail.com') {
        setIsAdmin(true);
        loadAdminData();
      } else { navigate('/'); }
      setIsVerifying(false);
    };
    if (!authLoading) checkAdmin();
  }, [user, authLoading, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
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
      toast({ title: 'Erreur', description: 'Impossible de charger les données admin', variant: 'destructive' });
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
      toast({ title: 'Annonce supprimée' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await supabase.functions.invoke('admin-data', {
        body: { action: 'update-report', reportId, status },
      });
      if (response.error) throw response.error;
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      toast({ title: 'Signalement mis à jour' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast({ title: 'Veuillez remplir le titre et le message', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('admin-broadcast', {
        body: { title: broadcastTitle, message: broadcastMessage, type: broadcastType },
      });
      if (response.error) throw response.error;
      toast({ title: `Notification envoyée à ${response.data.sent} utilisateurs` });
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || isVerifying) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isAdmin) return null;

  // Derived analytics
  const recentUsers = users.filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  const publishedProperties = properties.filter(p => p.is_published);
  const pendingReports = reports.filter(r => r.status === 'pending');

  const statCards = [
    { icon: Users, label: 'Utilisateurs', value: stats?.totalUsers || 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Home, label: 'Propriétaires', value: stats?.totalOwners || 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Users, label: 'Locataires', value: stats?.totalTenants || 0, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Home, label: 'Annonces', value: stats?.totalProperties || 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Download, label: 'Installations', value: stats?.totalInstalls || 0, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { icon: Eye, label: 'Vues totales', value: stats?.totalViews || 0, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { icon: Activity, label: 'Nouveaux (7j)', value: recentUsers.length, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Globe, label: 'Publiées', value: publishedProperties.length, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <Shield className="h-7 w-7 text-accent" /> Administration
            </h1>
            <p className="text-muted-foreground text-sm">Centre de contrôle Domia</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAdminData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {!loading && 'Actualiser'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions bar */}
        {pendingReports.length > 0 && (
          <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium">{pendingReports.length} signalement(s) en attente</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="broadcast">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="broadcast" className="gap-1"><Megaphone className="h-3.5 w-3.5" /> Diffuser</TabsTrigger>
              <TabsTrigger value="users" className="gap-1"><Users className="h-3.5 w-3.5" /> Utilisateurs ({users.length})</TabsTrigger>
              <TabsTrigger value="properties" className="gap-1"><Home className="h-3.5 w-3.5" /> Annonces ({properties.length})</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1"><XCircle className="h-3.5 w-3.5" /> Signalements ({reports.length})</TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytique</TabsTrigger>
            </TabsList>

            {/* BROADCAST TAB */}
            <TabsContent value="broadcast">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-accent" /> Envoyer une notification
                  </CardTitle>
                  <CardDescription>
                    Envoyez un message à tous les utilisateurs de Domia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Type</label>
                    <Select value={broadcastType} onValueChange={setBroadcastType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">ℹ️ Information</SelectItem>
                        <SelectItem value="promo">🎉 Promotion</SelectItem>
                        <SelectItem value="update">🔄 Mise à jour</SelectItem>
                        <SelectItem value="alert">⚠️ Alerte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Titre</label>
                    <Input
                      placeholder="Ex: Nouvelle fonctionnalité disponible !"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message</label>
                    <Textarea
                      placeholder="Écrivez votre message ici..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                      Sera envoyé à <strong>{stats?.totalUsers || 0}</strong> utilisateurs
                    </p>
                    <Button
                      className="gradient-gold"
                      onClick={handleBroadcast}
                      disabled={isSending || !broadcastTitle.trim() || !broadcastMessage.trim()}
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Envoyer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs inscrits</CardTitle>
                  <CardDescription>Liste complète avec emails et rôles</CardDescription>
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
                        {users.map((u) => (
                          <TableRow key={u.user_id}>
                            <TableCell className="font-medium">{u.fullname}</TableCell>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'owner' ? 'default' : 'secondary'}>
                                {u.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(u.created_at), 'dd/MM/yyyy', { locale: fr })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PROPERTIES TAB */}
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les annonces</CardTitle>
                  <CardDescription>Gérez les annonces de la plateforme</CardDescription>
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
                            <TableCell className="font-medium max-w-[200px] truncate">{property.title}</TableCell>
                            <TableCell>{property.city}</TableCell>
                            <TableCell className="text-sm">{property.owner_name}</TableCell>
                            <TableCell>{property.views}</TableCell>
                            <TableCell>
                              <Badge variant={property.is_published ? 'default' : 'secondary'}>
                                {property.is_published ? 'Publiée' : 'Brouillon'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      L'annonce "{property.title}" sera définitivement supprimée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProperty(property.id)} className="bg-destructive text-destructive-foreground">
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

            {/* REPORTS TAB */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Signalements</CardTitle>
                  <CardDescription>Gérez les annonces signalées</CardDescription>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Aucun signalement</div>
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
                                <Badge variant={
                                  report.status === 'pending' ? 'secondary' :
                                  report.status === 'reviewed' ? 'default' :
                                  report.status === 'removed' ? 'destructive' : 'outline'
                                }>
                                  {report.status === 'pending' ? 'En attente' :
                                   report.status === 'reviewed' ? 'Examiné' :
                                   report.status === 'removed' ? 'Supprimé' : 'Rejeté'}
                                </Badge>
                              </TableCell>
                              <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}>
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}>
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

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-accent" /> Croissance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">Nouveaux utilisateurs (7 jours)</span>
                      <span className="font-bold text-lg">{recentUsers.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">Taux de publication</span>
                      <span className="font-bold text-lg">{stats?.totalProperties ? Math.round((publishedProperties.length / stats.totalProperties) * 100) : 0}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">Vues / Annonce</span>
                      <span className="font-bold text-lg">{publishedProperties.length ? Math.round((stats?.totalViews || 0) / publishedProperties.length) : 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-accent" /> Répartition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">Propriétaires</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats?.totalUsers ? (stats.totalOwners / stats.totalUsers) * 100 : 0}%` }} />
                        </div>
                        <span className="font-bold text-sm">{stats?.totalUsers ? Math.round((stats.totalOwners / stats.totalUsers) * 100) : 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">Locataires</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${stats?.totalUsers ? (stats.totalTenants / stats.totalUsers) * 100 : 0}%` }} />
                        </div>
                        <span className="font-bold text-sm">{stats?.totalUsers ? Math.round((stats.totalTenants / stats.totalUsers) * 100) : 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">Signalements en attente</span>
                      <Badge variant={pendingReports.length > 0 ? 'destructive' : 'secondary'}>
                        {pendingReports.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-accent" /> Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentUsers.slice(0, 10).map((u) => (
                        <div key={u.user_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                          <div>
                            <span className="font-medium text-sm">{u.fullname}</span>
                            <span className="text-xs text-muted-foreground ml-2">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {u.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(u.created_at), 'dd/MM', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      ))}
                      {recentUsers.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Aucune inscription récente</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
