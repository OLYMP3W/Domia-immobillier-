import { Link } from 'react-router-dom';
import { Heart, MapPin, Home as HomeIcon, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Property } from '@/types/database';
import { useToggleFavorite, useIsFavorite } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatPropertyDate } from '@/lib/dateUtils';

interface PropertyCardProps {
  property: Property;
}

// Détermine si un fichier est une vidéo
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const { isAuthenticated } = useAuth();
  const { data: isFavorite = false } = useIsFavorite(property.id);
  const toggleFavorite = useToggleFavorite();
  const { toast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: 'Connexion requise',
        description: 'Connectez-vous pour ajouter aux favoris',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await toggleFavorite.mutateAsync(property.id);
      toast({
        title: result.action === 'added' ? 'Ajouté aux favoris' : 'Retiré des favoris',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  // Get all media (images + check for videos)
  const allMedia = property.images?.map(img => ({
    url: img.url,
    is_primary: img.is_primary,
    isVideo: isVideoUrl(img.url),
  })) || [];
  
  const primaryMedia = allMedia.find(m => m.is_primary) || allMedia[0];
  const mediaCount = allMedia.length;
  const hasVideo = allMedia.some(m => m.isVideo);

  const formatPrice = (price: number, type: string) => {
    const formatted = price.toLocaleString('fr-FR');
    return type === 'rent' ? `${formatted} CFA/mois` : `${formatted} CFA`;
  };

  return (
    <Card className="group overflow-hidden hover-lift animate-fade-in">
      {/* Media Grid - Style collage si plusieurs médias */}
      {mediaCount >= 3 ? (
        <div className="relative grid grid-rows-2 gap-0.5 aspect-[4/3] overflow-hidden bg-muted">
          {/* Row 1: 2 images */}
          <div className="grid grid-cols-2 gap-0.5">
            {allMedia.slice(0, 2).map((media, index) => (
              <div key={index} className="relative overflow-hidden">
                {media.isVideo ? (
                  <div className="relative h-full w-full">
                    <video src={media.url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <img src={media.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
          
          {/* Row 2: 3 images */}
          <div className="grid grid-cols-3 gap-0.5">
            {allMedia.slice(2, 5).map((media, index) => (
              <div key={index} className="relative overflow-hidden">
                {media.isVideo ? (
                  <div className="relative h-full w-full">
                    <video src={media.url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <img src={media.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
                {/* Overlay +X sur la dernière image */}
                {index === 2 && mediaCount > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{mediaCount - 5}</span>
                  </div>
                )}
              </div>
            ))}
            {/* Fill empty slots */}
            {allMedia.length < 5 && Array.from({ length: Math.max(0, 3 - (allMedia.length - 2)) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-muted" />
            ))}
          </div>
          
          {/* Badges */}
          {property.is_premium && (
            <Badge className="absolute top-3 left-3 gradient-gold border-0 z-10">
              Premium
            </Badge>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm bg-white/90 z-10"
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      ) : (
        /* Single image layout */
        <div className="relative aspect-video overflow-hidden bg-muted">
          {primaryMedia ? (
            primaryMedia.isVideo ? (
              <div className="relative h-full w-full">
                <video src={primaryMedia.url} className="h-full w-full object-cover" muted />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
            ) : (
              <img
                src={primaryMedia.url}
                alt={property.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <HomeIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {property.is_premium && (
            <Badge className="absolute top-3 left-3 gradient-gold border-0">
              Premium
            </Badge>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm bg-white/90"
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      )}

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
            <Badge variant="outline" className="ml-2">
              {property.type === 'rent' ? 'Location' : 'Vente'}
            </Badge>
          </div>

          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</span>
          </div>

          <div className="flex items-center text-muted-foreground text-sm">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
          </div>

          <p className="text-2xl font-bold text-gold">{formatPrice(property.price, property.type)}</p>

          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <Link 
            to={`/profile/${property.owner_id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={property.owner?.avatar_url || ''} />
              <AvatarFallback>{property.owner?.fullname?.charAt(0) || 'P'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{property.owner?.fullname || 'Propriétaire'}</span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatPropertyDate(property.created_at)}</span>
          </div>
        </div>

        <Button asChild size="sm" className="gradient-gold w-full">
          <Link to={`/property/${property.id}`}>
            Voir détails
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
