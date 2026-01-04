import { Link } from 'react-router-dom';
import { Heart, MapPin, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Property } from '@/types/database';
import { useToggleFavorite, useIsFavorite } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PropertyCardProps {
  property: Property;
}

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

  const primaryImage = property.images?.find(img => img.is_primary)?.url || 
                       property.images?.[0]?.url;

  const formatPrice = (price: number, type: string) => {
    const formatted = price.toLocaleString('fr-FR');
    return type === 'rent' ? `${formatted} CFA/mois` : `${formatted} CFA`;
  };

  return (
    <Card className="group overflow-hidden hover-lift animate-fade-in">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
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

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={property.owner?.avatar_url || ''} />
            <AvatarFallback>{property.owner?.fullname?.charAt(0) || 'P'}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{property.owner?.fullname || 'Propriétaire'}</span>
        </div>

        <Button asChild size="sm" className="gradient-gold">
          <Link to={`/property/${property.id}`}>
            Voir détails
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
