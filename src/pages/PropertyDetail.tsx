import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Home, BedDouble, Calendar, User, Phone, Mail } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { mockProperties } from '@/data/mockData';
import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const property = mockProperties.find(p => p.id === id);

  if (!property) {
    return <div>Propriété non trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                      <img
                        src={image}
                        alt={`${property.title} - ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            {/* Title and Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{property.title}</h1>
                    {property.isPremium && (
                      <Badge className="gradient-gold">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{property.city}, {property.neighborhood}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="text-3xl font-bold text-gold mb-6">
                {property.price}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Home className="h-6 w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">{property.rooms}</div>
                    <div className="text-sm text-muted-foreground">Pièces</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BedDouble className="h-6 w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">{property.rooms - 1}</div>
                    <div className="text-sm text-muted-foreground">Chambres</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">
                      {property.status === 'rent' ? 'Location' : 'Vente'}
                    </div>
                    <div className="text-sm text-muted-foreground">Type</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Owner Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Propriétaire</h3>
                
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={property.owner.profilePicUrl} />
                    <AvatarFallback>{property.owner.fullname.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{property.owner.fullname}</div>
                    <div className="text-sm text-muted-foreground">Membre depuis 2023</div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Button className="w-full gradient-gold">
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer un message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Appeler
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Taux de réponse</span>
                    <span className="font-semibold text-foreground">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Temps de réponse</span>
                    <span className="font-semibold text-foreground">&lt; 2h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
