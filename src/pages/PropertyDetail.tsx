import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Home, BedDouble, Calendar, Phone, Mail, Loader2, Bath, Maximize, Send } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useProperty } from '@/hooks/useProperties';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { useSendMessage } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { data: property, isLoading, error } = useProperty(id || '');
  const { data: isFavorite = false } = useIsFavorite(id || '');
  const toggleFavorite = useToggleFavorite();

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const sendMessage = useSendMessage();

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Connexion requise',
        description: 'Connectez-vous pour ajouter aux favoris',
        variant: 'destructive',
      });
      return;
    }
    if (id) {
      toggleFavorite.mutate(id);
    }
  };

  const handleOpenMessageDialog = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Connexion requise',
        description: 'Connectez-vous pour envoyer un message',
        variant: 'destructive',
      });
      return;
    }
    setMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !property?.owner_id) return;

    try {
      await sendMessage.mutateAsync({
        receiverId: property.owner_id,
        propertyId: property.id,
        content: messageContent,
      });
      toast({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé au propriétaire',
      });
      setMessageDialogOpen(false);
      setMessageContent('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Découvrez cette propriété sur Domia: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Lien copié',
        description: 'Le lien a été copié dans le presse-papier',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Home className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Propriété non trouvée</h1>
          <p className="text-muted-foreground mb-6">Cette annonce n'existe pas ou a été supprimée</p>
          <Button asChild>
            <Link to="/properties">Voir toutes les annonces</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images?.map(img => img.url) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-4 sm:py-8">
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video overflow-hidden rounded-xl">
                        <img
                          src={image}
                          alt={`${property.title} - ${index + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center">
                <Home className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            {/* Title and Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">{property.title}</h1>
                    {property.is_premium && (
                      <Badge className="gradient-gold">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 shrink-0" />
                    <span>{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-bold text-gold mb-6">
                {property.price.toLocaleString()} CFA
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Home className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">{property.rooms}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Pièces</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <BedDouble className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">{Math.max(1, property.rooms - 1)}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Chambres</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Bath className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">{property.bathrooms || 1}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Salle(s) de bain</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Maximize className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-gold" />
                    <div className="font-semibold">{property.surface || '-'}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">m²</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description || 'Aucune description disponible pour cette propriété.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Owner Card */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4">Propriétaire</h3>
                
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                    <AvatarImage src={property.owner?.avatar_url || ''} />
                    <AvatarFallback className="bg-gold text-white">
                      {property.owner?.fullname?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{property.owner?.fullname || 'Propriétaire'}</div>
                    <div className="text-sm text-muted-foreground">Membre Domia</div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Button className="w-full gradient-gold" onClick={handleOpenMessageDialog}>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer un message
                  </Button>
                  {property.owner?.phone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${property.owner.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Appeler
                      </a>
                    </Button>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Vues</span>
                    <span className="font-semibold text-foreground">{property.views || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Publié le</span>
                    <span className="font-semibold text-foreground">
                      {new Date(property.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>
              Contactez {property.owner?.fullname || 'le propriétaire'} à propos de cette annonce
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar>
                <AvatarImage src={property.owner?.avatar_url || ''} />
                <AvatarFallback className="bg-gold text-white">
                  {property.owner?.fullname?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{property.owner?.fullname || 'Propriétaire'}</div>
                <div className="text-sm text-muted-foreground">{property.title}</div>
              </div>
            </div>
            <Textarea
              placeholder="Écrivez votre message ici..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
            <Button 
              className="w-full gradient-gold" 
              onClick={handleSendMessage}
              disabled={sendMessage.isPending || !messageContent.trim()}
            >
              {sendMessage.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
