import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Upload, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useCreateProperty, useAddPropertyImage } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';

const cities = ['Libreville', 'Port Gentil', 'Franceville', 'Oyem', 'Moanda'];
const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'house', label: 'Maison' },
  { value: 'duplex', label: 'Duplex' },
];

const CreateProperty = () => {
  const { role, isAuthenticated, isLoading } = useAuth();
  const createProperty = useCreateProperty();
  const addImage = useAddPropertyImage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    neighborhood: '',
    address: '',
    type: 'apartment',
    price: '',
    rooms: '1',
    bathrooms: '1',
    surface: '',
    is_premium: false,
    is_published: true,
  });

  const [imageUrl, setImageUrl] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated || role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.city || !formData.price) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const property = await createProperty.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        address: formData.address || null,
        type: formData.type,
        price: parseInt(formData.price),
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms),
        surface: formData.surface ? parseInt(formData.surface) : null,
        is_premium: formData.is_premium,
        is_published: formData.is_published,
      });

      // Add image if provided
      if (imageUrl && property.id) {
        await addImage.mutateAsync({
          propertyId: property.id,
          url: imageUrl,
          isPrimary: true,
        });
      }

      toast({
        title: 'Succès',
        description: 'Votre annonce a été créée avec succès',
      });

      navigate('/dashboard/owner');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
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
              <Home className="h-6 w-6 text-gold" />
              Créer une nouvelle annonce
            </CardTitle>
            <CardDescription>
              Remplissez les informations de votre propriété pour la publier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations générales</h3>
                
                <div>
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Bel appartement T3 en centre-ville"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre propriété en détail..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type de bien *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Prix (CFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Ex: 450000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Localisation</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, city: v }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="neighborhood">Quartier</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Ex: Batterie IV"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Ex: Rue des Palmiers, Immeuble ABC"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Characteristics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Caractéristiques</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rooms">Pièces</Label>
                    <Select 
                      value={formData.rooms} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, rooms: v }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Salles de bain</Label>
                    <Select 
                      value={formData.bathrooms} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, bathrooms: v }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <Input
                      id="surface"
                      type="number"
                      value={formData.surface}
                      onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                      placeholder="Ex: 85"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Image</h3>
                
                <div>
                  <Label htmlFor="imageUrl">URL de l'image principale</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez l'URL d'une image pour votre annonce
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Options</h3>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="is_published">Publier immédiatement</Label>
                    <p className="text-sm text-muted-foreground">
                      L'annonce sera visible par tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="is_premium">Annonce Premium</Label>
                    <p className="text-sm text-muted-foreground">
                      Mise en avant dans les résultats de recherche
                    </p>
                  </div>
                  <Switch
                    id="is_premium"
                    checked={formData.is_premium}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_premium: checked }))}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link to="/dashboard/owner">Annuler</Link>
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 gradient-gold"
                  disabled={createProperty.isPending}
                >
                  {createProperty.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer l\'annonce'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CreateProperty;