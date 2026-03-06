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
import { ArrowLeft, Loader2, Upload, Home, X, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useCreateProperty, useAddPropertyImage } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Toutes les villes du Gabon
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

const MAX_MEDIA = 20;

const CreateProperty = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
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
    listing_type: 'rent',
    price: '',
    rooms: '1',
    bathrooms: '1',
    surface: '',
    is_premium: false,
    is_published: true,
  });

  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalMedia = media.length + newFiles.length;

    if (totalMedia > MAX_MEDIA) {
      toast({
        title: 'Limite atteinte',
        description: `Vous pouvez ajouter maximum ${MAX_MEDIA} fichiers`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file sizes
    const validFiles = newFiles.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'Fichier trop volumineux',
          description: `${file.name} dépasse la limite de ${isVideo ? '100MB' : '10MB'}`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    // Generate previews
    validFiles.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, { url: reader.result as string, isVideo }]);
      };
      reader.readAsDataURL(file);
    });

    setMedia(prev => [...prev, ...validFiles]);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, propertyId: string): Promise<string | null> => {
    try {
      const isVideo = file.type.startsWith('video/');
      const fileExt = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
      const fileName = `${user?.id}/${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Only compress images, not videos
      const fileToUpload = isVideo ? file : await compressImage(file);
      
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

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
      setIsUploading(true);

      const property = await createProperty.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        address: formData.address || null,
        type: formData.listing_type, // rent ou sale
        price: parseInt(formData.price),
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms),
        surface: formData.surface ? parseInt(formData.surface) : null,
        is_premium: formData.is_premium,
        is_published: formData.is_published,
      });

      // Upload media files
      if (media.length > 0 && property.id) {
        for (let i = 0; i < media.length; i++) {
          const mediaUrl = await uploadFile(media[i], property.id);
          if (mediaUrl) {
            const isVideo = media[i].type.startsWith('video/');
            if (isVideo) {
              // Sauvegarder les vidéos dans property_media
              await supabase.from('property_media').insert({
                property_id: property.id,
                url: mediaUrl,
                type: 'video',
                is_primary: i === 0 && media.filter(m => !m.type.startsWith('video/')).length === 0,
              });
            } else {
              await addImage.mutateAsync({
                propertyId: property.id,
                url: mediaUrl,
                isPrimary: i === 0,
              });
            }
          }
        }
      }

      toast({
        title: 'Succès',
        description: 'Votre annonce a été créée avec succès',
      });

      navigate('/dashboard/owner');
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
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
              <Home className="h-6 w-6 text-gold" />
              Créer une nouvelle annonce
            </CardTitle>
            <CardDescription>
              Remplissez les informations de votre propriété pour la publier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type d'annonce: Location ou Vente */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Label htmlFor="price">
                      Prix (CFA) * {formData.listing_type === 'rent' ? '/ mois' : ''}
                    </Label>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        {gabonCities.map(city => (
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
                
                <div className={`grid gap-4 ${formData.type === 'terrain' ? 'grid-cols-1 max-w-xs' : 'grid-cols-3'}`}>
                  {formData.type !== 'terrain' && (
                    <>
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
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
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
                    </>
                  )}

                  <div>
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <Input
                      id="surface"
                      type="number"
                      value={formData.surface}
                      onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                      placeholder={formData.type === 'terrain' ? 'Ex: 500' : 'Ex: 85'}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Videos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Photos & Vidéos ({media.length}/{MAX_MEDIA})
                </h3>
                
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="media"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="media"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Cliquez pour ajouter des photos ou vidéos
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Images (max 10MB) • Vidéos (max 100MB) • Maximum {MAX_MEDIA} fichiers
                    </span>
                  </label>
                </div>

                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        {preview.isVideo ? (
                          <div className="relative h-full w-full">
                            <video
                              src={preview.url}
                              className="h-full w-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        )}
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-gold text-white text-xs px-2 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Options</h3>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Annonce Premium</p>
                    <p className="text-sm text-muted-foreground">
                      Mettez votre annonce en avant
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_premium}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_premium: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Publier immédiatement</p>
                    <p className="text-sm text-muted-foreground">
                      Rendre l'annonce visible après création
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-gold"
                size="lg"
                disabled={isUploading || createProperty.isPending}
              >
                {isUploading || createProperty.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer l\'annonce'
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

export default CreateProperty;
