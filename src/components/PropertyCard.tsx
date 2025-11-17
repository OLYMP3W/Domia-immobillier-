import { Link } from 'react-router-dom';
import { Heart, MapPin, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Property } from '@/data/mockData';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className="group overflow-hidden hover-lift animate-fade-in">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {property.isPremium && (
          <Badge className="absolute top-3 left-3 gradient-gold border-0">
            Premium
          </Badge>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm bg-white/90"
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
            <Badge variant="outline" className="ml-2">
              {property.status === 'rent' ? 'Location' : 'Vente'}
            </Badge>
          </div>

          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.city}, {property.neighborhood}</span>
          </div>

          <div className="flex items-center text-muted-foreground text-sm">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
          </div>

          <p className="text-2xl font-bold text-gold">{property.price}</p>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={property.owner.profilePicUrl} />
            <AvatarFallback>{property.owner.fullname.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{property.owner.fullname}</span>
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
