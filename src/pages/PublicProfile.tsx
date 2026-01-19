import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePublicProfile, useUserProperties } from '@/hooks/usePublicProfile';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, MessageCircle, Home, Calendar, ArrowLeft } from 'lucide-react';

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, isAuthenticated } = useAuth();
  
  const { data: profile, isLoading: profileLoading } = usePublicProfile(userId || '');
  const { data: properties = [], isLoading: propertiesLoading } = useUserProperties(userId || '');

  const isOwnProfile = user?.id === userId;

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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux annonces
          </Link>
        </Button>

        {/* Profile header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.fullname?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">{profile.fullname}</h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membre depuis {formatDistanceToNow(new Date(profile.created_at), { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    {properties.length} annonce{properties.length > 1 ? 's' : ''}
                  </div>
                </div>

                {!isOwnProfile && isAuthenticated && (
                  <Button asChild>
                    <Link to={`/messages?user=${userId}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contacter
                    </Link>
                  </Button>
                )}
                
                {isOwnProfile && (
                  <Badge variant="outline">Votre profil</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Annonces de {profile.fullname}
          </h2>

          {propertiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune annonce publiée pour le moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
