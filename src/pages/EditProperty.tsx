import { useState, useEffect } from 'react';
import { sanitizePhoneNumbers, containsPhoneNumber } from '@/lib/phoneFilter';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Home, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { useProperty, useUpdateProperty } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';

const gabonCities = [
  'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda',
  'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou',
  'Bitam', 'Gamba', 'Mounana', 'Ntoum', 'Lastoursville',
  'Akanda', 'Owendo', 'Ndjolé', 'Cap Estérias', 'Fougamou',
  'Booué', 'Ndendé', 'Mayumba', 'Mimongo', 'Okondja',
  'Mékambo', 'Minvoul', 'Cocobeach', 'Mbigou', 'Lekoni'
].sort();

const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'house', label: 'Maison' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'commercial', label: 'Local commercial' },
];

const listingTypes = [
  { value: 'rent', label: 'À louer' },
  { value: 'sale', label: 'À vendre' },
];

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: property, isLoading: propertyLoading } = useProperty(id || '');
  const updateProperty = useUpdateProperty();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    neighborhood: '',
    address: '',
    type: 'apartment',
    listing_type: 'rent',
    price: '',
    rooms: '1',
    bathrooms: '1',
    surface: '',
    is_premium: false,
    is_published: true,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        city: property.city || '',
        neighborhood: property.neighborhood || '',
        address: property.address || '',
        type: ['rent', 'sale'].includes(property.type) ? 'apartment' : property.type,
        listing_type: ['rent', 'sale'].includes(property.type) ? property.type : 'rent',
        price: property.price?.toString() || '',
        rooms: property.rooms?.toString() || '1',
        bathrooms: property.bathrooms?.toString() || '1',
        surface: property.surface?.toString() || '',
        is_premium: property.is_premium || false,
        is_published: property.is_published !== false,
      });
    }
  }, [property]);

  if (authLoading || propertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  if (property && property.owner_id !== user?.id) {
    return <Navigate to="/dashboard/owner" replace />;
  }

  const isTerrain = formData.type === 'terrain';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !formData.title || !formData.city || !formData.price) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const cleanDescription = formData.description ? sanitizePhoneNumbers(formData.description) : null;
      if (formData.description && containsPhoneNumber(formData.description)) {
        toast({
          title: 'Numéro détecté',
          description: 'Les numéros de téléphone dans la description ont été masqués.',
        });
      }

      await updateProperty.mutateAsync({
        id,
        title: formData.title,
        description: cleanDescription,
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        address: formData.address || null,
        type: formData.listing_type,
        price: parseInt(formData.price),
        rooms: isTerrain ? 0 : parseInt(formData.rooms),
        bathrooms: isTerrain ? 0 : parseInt(formData.bathrooms),
        surface: formData.surface ? parseInt(formData.surface) : null,
        is_premium: formData.is_premium,
        is_published: formData.is_published,
      });

      toast({
        title: 'Succès',
        description: 'Votre annonce a été modifiée avec succès',
      });
      navigate('/dashboard/owner');
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'annonce',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navbar />

      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/dashboard/owner">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-6 w-6 text-accent" />
              Modifier l'annonce
            </CardTitle>
            <CardDescription>
              Modifiez les informations de votre propriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type d'annonce */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Type d'annonce</h3>
                <div className="grid grid-cols-2 gap-4">
                  {listingTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, listing_type: type.value }))}
                      className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                        formData.listing_type === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations générales</h3>
                <div>
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="mt-1" rows={4} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Type de bien *</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prix (CFA) * {formData.listing_type === 'rent' ? '/ mois' : ''}</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Localisation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Ville *</Label>
                    <Select value={formData.city} onValueChange={(v) => setFormData(prev => ({ ...prev, city: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {gabonCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quartier</Label>
                    <Input value={formData.neighborhood} onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Adresse complète</Label>
                  <Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="mt-1" />
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Caractéristiques</h3>
                <div className={`grid gap-4 ${isTerrain ? 'grid-cols-1 max-w-xs' : 'grid-cols-3'}`}>
                  {!isTerrain && (
                    <>
                      <div>
                        <Label>Pièces</Label>
                        <Select value={formData.rooms} onValueChange={(v) => setFormData(prev => ({ ...prev, rooms: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Salles de bain</Label>
                        <Select value={formData.bathrooms} onValueChange={(v) => setFormData(prev => ({ ...prev, bathrooms: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Surface (m²)</Label>
                    <Input type="number" value={formData.surface} onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Options</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Annonce Premium</p>
                    <p className="text-sm text-muted-foreground">Mettez votre annonce en avant</p>
                  </div>
                  <Switch checked={formData.is_premium} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_premium: checked }))} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Publier</p>
                    <p className="text-sm text-muted-foreground">Rendre l'annonce visible</p>
                  </div>
                  <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))} />
                </div>
              </div>

              <Button type="submit" className="w-full gradient-gold" size="lg" disabled={updateProperty.isPending}>
                {updateProperty.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Modification en cours...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Sauvegarder les modifications</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EditProperty;
