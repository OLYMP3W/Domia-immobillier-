import { Link } from 'react-router-dom';
import { Heart, MapPin, Home as HomeIcon, Clock, Play, Bed, Bath, Ruler } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Property } from '@/types/database';
import { useToggleFavorite, useIsFavorite } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatPropertyDate } from '@/lib/dateUtils';

interface PropertyCardProps {
  property: Property;
}

const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const urlLower = url.toLowerCase().split('?')[0];
  return videoExtensions.some(ext => urlLower.endsWith(ext));
};

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const { isAuthenticated } = useAuth();
  const { data: isFavorite = false } = useIsFavorite(property.id);
  const toggleFavorite = useToggleFavorite();
  const { toast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour ajouter aux favoris', variant: 'destructive' });
      return;
    }
    try {
      const result = await toggleFavorite.mutateAsync(property.id);
      toast({ title: result.action === 'added' ? 'Ajouté aux favoris' : 'Retiré des favoris' });
    } catch {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    }
  };

  const allMedia = property.images?.map(img => ({
    url: img.url,
    is_primary: img.is_primary,
    isVideo: (img as any).type === 'video' || isVideoUrl(img.url),
  })) || [];

  const primaryMedia = allMedia.find(m => m.is_primary) || allMedia[0];
  const mediaCount = allMedia.length;

  const formatPrice = (price: number, type: string) => {
    const formatted = price.toLocaleString('fr-FR');
    return type === 'rent' ? `${formatted} CFA/mois` : `${formatted} CFA`;
  };

  const renderMedia = (media: typeof allMedia[0], className = '') => {
    if (media.isVideo) {
      return (
        <div className={`relative h-full w-full ${className}`}>
          <video
            src={`${media.url}#t=0.5`}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onLoadedData={(e) => { e.currentTarget.currentTime = 0.5; }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-5 w-5 text-foreground ml-0.5" />
            </div>
          </div>
        </div>
      );
    }
    return <img src={media.url} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  };

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-card/90 backdrop-blur-xl border border-border/40 shadow-[var(--shadow-card)] transition-all duration-500 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2">
        {/* Media section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {mediaCount >= 3 ? (
            <div className="grid h-full grid-rows-2 gap-[2px]">
              <div className="grid grid-cols-2 gap-[2px]">
                {allMedia.slice(0, 2).map((media, i) => (
                  <div key={i} className="relative overflow-hidden">{renderMedia(media)}</div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-[2px]">
                {allMedia.slice(2, 5).map((media, i) => (
                  <div key={i} className="relative overflow-hidden">
                    {renderMedia(media)}
                    {i === 2 && mediaCount > 5 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">+{mediaCount - 5}</span>
                      </div>
                    )}
                  </div>
                ))}
                {allMedia.length < 5 && Array.from({ length: Math.max(0, 3 - (allMedia.length - 2)) }).map((_, i) => (
                  <div key={`e-${i}`} className="bg-muted" />
                ))}
              </div>
            </div>
          ) : primaryMedia ? (
            renderMedia(primaryMedia, 'transition-transform duration-700 group-hover:scale-105')
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <HomeIcon className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}

          {/* Badges overlay - top left */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.is_premium && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-md">
                Premium
              </span>
            )}
            <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur-md">
              {property.type === 'rent' ? 'Location' : property.type === 'sale' ? 'Vente' : property.type}
            </span>
          </div>

          {/* Favoris - top right */}
          <button
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-md backdrop-blur-md transition-transform hover:scale-110"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
          </button>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Owner + Price row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Link
              to={`/profile/${property.owner_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 min-w-0 shrink group/owner"
            >
              <Avatar className="h-8 w-8 ring-2 ring-accent shadow-sm shrink-0">
                <AvatarImage src={property.owner?.avatar_url || ''} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                  {property.owner?.fullname?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold truncate group-hover/owner:text-accent transition-colors">
                {property.owner?.fullname || 'Propriétaire'}
              </span>
            </Link>
            <div className="rounded-xl bg-accent/95 px-3 py-1.5 shadow-sm shrink-0">
              <p className="text-xs sm:text-sm font-black text-accent-foreground whitespace-nowrap">{formatPrice(property.price, property.type)}</p>
            </div>
          </div>

          <h3 className="font-bold text-base line-clamp-1 mb-1.5">{property.title}</h3>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="truncate">{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</span>
          </div>

          {/* Specs pills */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
            <span className="flex items-center gap-1 bg-muted/80 rounded-full px-2.5 py-1">
              <Bed className="h-3 w-3 text-accent" />
              {property.rooms} pce{property.rooms > 1 ? 's' : ''}
            </span>
            {property.bathrooms && (
              <span className="flex items-center gap-1 bg-muted/80 rounded-full px-2.5 py-1">
                <Bath className="h-3 w-3 text-accent" />
                {property.bathrooms} sdb
              </span>
            )}
            {property.surface && (
              <span className="flex items-center gap-1 bg-muted/80 rounded-full px-2.5 py-1">
                <Ruler className="h-3 w-3 text-accent" />
                {property.surface} m²
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center justify-end">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatPropertyDate(property.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
