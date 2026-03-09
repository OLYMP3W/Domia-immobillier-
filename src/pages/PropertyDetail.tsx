import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Home, BedDouble, Calendar, Phone, Mail, Loader2, Bath, Maximize, Send, MessageCircle, Eye, ChevronLeft, Download } from 'lucide-react';
import { sanitizePhoneNumbers } from '@/lib/phoneFilter';
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
import { AuthModal } from '@/components/AuthModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { formatPropertyDate } from '@/lib/dateUtils';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const sendMessage = useSendMessage();

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleToggleFavorite = () => {
    requireAuth(() => { if (id) toggleFavorite.mutate(id); });
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !property?.owner_id) return;
    try {
      await sendMessage.mutateAsync({ receiverId: property.owner_id, propertyId: property.id, content: messageContent });
      toast({ title: 'Message envoyé' });
      setMessageDialogOpen(false);
      setMessageContent('');
    } catch { toast({ title: 'Erreur', variant: 'destructive' }); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: property?.title, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Lien copié' });
    }
  };

  const handleWhatsApp = () => {
    requireAuth(() => {
      const whatsapp = property?.owner?.whatsapp;
      if (!whatsapp) return;
      const cleanNumber = whatsapp.replace(/[^0-9+]/g, '').replace('+', '');
      const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${property?.title}" sur Domia.`);
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    });
  };

  const handleCall = () => {
    requireAuth(() => {
      if (property?.owner?.phone) {
        window.open(`tel:${property.owner.phone}`, '_self');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Home className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Propriété non trouvée</h1>
          <p className="text-muted-foreground mb-6">Cette annonce n'existe pas ou a été supprimée</p>
          <Button asChild><Link to="/properties">Voir toutes les annonces</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images?.map(img => img.url) || [];
  const ownerWhatsapp = property.owner?.whatsapp;
  const isLand = property.type === 'sale' && (property.title?.toLowerCase().includes('terrain') || property.description?.toLowerCase().includes('terrain'));

  // Build specs based on property type
  const specs = [
    ...(!isLand ? [
      { icon: Home, label: 'Pièces', value: property.rooms },
      { icon: BedDouble, label: 'Chambres', value: Math.max(1, property.rooms - 1) },
      { icon: Bath, label: 'Salle(s) de bain', value: property.bathrooms || 1 },
    ] : []),
    { icon: Maximize, label: 'm²', value: property.surface || '-' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Galerie pleine largeur */}
      <div className="relative bg-muted">
        {images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((url, index) => {
                const isVideo = url.toLowerCase().split('?')[0].match(/\.(mp4|webm|ogg|mov)$/);
                return (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                      {isVideo ? (
                        <video
                          src={url}
                          controls
                          preload="metadata"
                          playsInline
                          muted
                          crossOrigin="anonymous"
                          className="h-full w-full object-cover"
                          onLoadedData={(e) => { e.currentTarget.currentTime = 0.5; }}
                        />
                      ) : (
                        <img src={url} alt={`${property.title} - ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}

        <Button variant="secondary" size="icon" className="absolute top-4 left-4 rounded-full shadow-lg backdrop-blur-md bg-card/80" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg backdrop-blur-md bg-card/80" onClick={handleToggleFavorite}>
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg backdrop-blur-md bg-card/80" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container py-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {property.is_premium && <Badge className="gradient-gold border-0">Premium</Badge>}
                <Badge variant="outline">
                  {property.type === 'rent' ? 'Location' : property.type === 'sale' ? 'Vente' : property.type}
                </Badge>
                {isLand && <Badge variant="outline">🏗️ Terrain</Badge>}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">{property.title}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="mr-2 h-4 w-4 shrink-0" />
                <span>{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-accent">
                {property.price.toLocaleString()} CFA
                {property.type === 'rent' && <span className="text-base font-normal text-muted-foreground">/mois</span>}
              </p>
            </div>

            {/* Specs - adapts for land */}
            <div className={`grid gap-3 ${isLand ? 'grid-cols-1 sm:grid-cols-1 max-w-xs' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-2xl border border-border/50 bg-card p-4 text-center">
                  <spec.icon className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <div className="text-xl font-bold">{spec.value}</div>
                  <div className="text-xs text-muted-foreground">{spec.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description ? sanitizePhoneNumbers(property.description) : 'Aucune description disponible.'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border/50 bg-card p-6 lg:sticky lg:top-24 space-y-6">
              <h3 className="text-lg font-bold">Propriétaire</h3>

              <Link to={`/profile/${property.owner_id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <Avatar className="h-14 w-14 ring-2 ring-accent/20">
                  <AvatarImage src={property.owner?.avatar_url || ''} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                    {property.owner?.fullname?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{property.owner?.fullname || 'Propriétaire'}</div>
                  <div className="text-sm text-muted-foreground">Voir le profil</div>
                </div>
              </Link>

              <Separator />

              <div className="space-y-3">
                <Button className="w-full gradient-gold rounded-xl h-11" onClick={() => requireAuth(() => setMessageDialogOpen(true))}>
                  <Mail className="mr-2 h-4 w-4" /> Envoyer un message
                </Button>
                {ownerWhatsapp && (
                  <Button variant="outline" className="w-full rounded-xl h-11 text-green-600 border-green-200 hover:bg-green-50" onClick={handleWhatsApp}>
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                )}
                {property.owner?.phone && (
                  <Button variant="outline" className="w-full rounded-xl h-11" onClick={handleCall}>
                    <Phone className="mr-2 h-4 w-4" /> Appeler
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2"><Eye className="h-4 w-4" /> Vues</span>
                  <span className="font-semibold">{property.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Publié</span>
                  <span className="font-semibold text-accent">{formatPropertyDate(property.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>Contactez {property.owner?.fullname || 'le propriétaire'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <Avatar>
                <AvatarImage src={property.owner?.avatar_url || ''} />
                <AvatarFallback className="bg-accent text-accent-foreground">{property.owner?.fullname?.charAt(0) || 'P'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{property.owner?.fullname}</div>
                <div className="text-sm text-muted-foreground">{property.title}</div>
              </div>
            </div>
            <Textarea placeholder="Écrivez votre message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={4} className="rounded-xl" />
            <Button className="w-full gradient-gold rounded-xl" onClick={handleSendMessage} disabled={sendMessage.isPending || !messageContent.trim()}>
              {sendMessage.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <Footer />
    </div>
  );
};

export default PropertyDetail;