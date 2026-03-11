import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicProfile, useUserProperties } from '@/hooks/usePublicProfile';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, MessageCircle, Home, Calendar, ArrowLeft, MapPin, Star, Eye, Info } from 'lucide-react';

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, isAuthenticated } = useAuth();
  
  const { data: profile, isLoading: profileLoading } = usePublicProfile(userId || '');
  const { data: properties = [], isLoading: propertiesLoading } = useUserProperties(userId || '');

  const isOwnProfile = user?.id === userId;

  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Profil non trouvé</h1>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/properties">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>

        {/* Profile Hero Card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-lg">
          <div className="h-24 gradient-navy" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl gradient-gold text-accent-foreground font-bold">
                  {profile.fullname?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-xl font-bold mt-3">{profile.fullname}</h1>
              
              {isOwnProfile && (
                <Badge variant="outline" className="mt-1 text-xs">Votre profil</Badge>
              )}

              {profile.bio && (
                <p className="text-sm text-muted-foreground text-center mt-2 max-w-md px-4">
                  {profile.bio}
                </p>
              )}
              
              {/* Stats row */}
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold">{properties.length}</p>
                  <p className="text-[11px] text-muted-foreground">Annonces</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold">{totalViews}</p>
                  <p className="text-[11px] text-muted-foreground">Vues</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {formatDistanceToNow(new Date(profile.created_at), { locale: fr })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Sur Domia</p>
                </div>
              </div>

              {/* Contact button */}
              {!isOwnProfile && isAuthenticated && (
                <Button asChild className="mt-4 gradient-gold">
                  <Link to={`/messages?user=${userId}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Link>
                </Button>
              )}

              {isOwnProfile && (
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link to="/settings">Modifier le profil</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-5 w-5 text-accent" />
              Annonces ({properties.length})
            </h2>
          </div>

          {propertiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">
                  Aucune annonce publiée
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Les annonces de cet utilisateur apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicProfile;
