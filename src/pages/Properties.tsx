import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useProperties } from '@/hooks/useProperties';
import { SlidersHorizontal, Home, Loader2, Search } from 'lucide-react';

// Toutes les villes du Gabon
const gabonCities = [
  'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda',
  'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou',
  'Bitam', 'Gamba', 'Mounana', 'Ntoum', 'Lastoursville',
  'Akanda', 'Owendo', 'Ndjolé', 'Cap Estérias', 'Fougamou',
  'Booué', 'Ndendé', 'Mayumba', 'Mimongo', 'Okondja',
  'Mékambo', 'Minvoul', 'Cocobeach', 'Mbigou', 'Lekoni'
].sort();

const Properties = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [rooms, setRooms] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const { data: properties = [], isLoading } = useProperties({
    city: selectedCity !== 'all' ? selectedCity : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    minRooms: rooms > 0 ? rooms : undefined,
  });

  // Filtrage côté client pour la recherche texte et le budget
  const filteredProperties = properties.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.neighborhood || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (minBudget && p.price < parseInt(minBudget)) return false;
    if (maxBudget && p.price > parseInt(maxBudget)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Toutes les propriétés</h1>
          <p className="text-muted-foreground">{filteredProperties.length} propriétés disponibles</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <Card className="h-fit sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-bold">Filtres</h2>
              </div>

              <div className="space-y-5">
                {/* Barre de recherche texte */}
                <div>
                  <Label>Rechercher</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Titre, ville, quartier..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label>Ville</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {gabonCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="rent">Location</SelectItem>
                      <SelectItem value="sale">Vente</SelectItem>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="house">Maison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nombre de pièces minimum</Label>
                  <Select value={rooms.toString()} onValueChange={(v) => setRooms(Number(v))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Toutes</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget filters */}
                <div>
                  <Label>Budget (CFA)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCity('all');
                    setSelectedType('all');
                    setRooms(0);
                    setSearchQuery('');
                    setMinBudget('');
                    setMaxBudget('');
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Home className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-semibold">Aucune propriété trouvée</h3>
                <p className="text-muted-foreground">Essayez de modifier vos filtres</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
