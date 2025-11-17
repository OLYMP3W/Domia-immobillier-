import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { mockProperties, cities } from '@/data/mockData';
import { SlidersHorizontal } from 'lucide-react';

const Properties = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [rooms, setRooms] = useState(0);

  const filteredProperties = mockProperties.filter(property => {
    if (selectedCity && property.city !== selectedCity) return false;
    if (selectedType && property.status !== selectedType) return false;
    if (rooms > 0 && property.rooms < rooms) return false;
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

              <div className="space-y-6">
                <div>
                  <Label>Ville</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes</SelectItem>
                      {cities.map(city => (
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
                      <SelectItem value="">Tous</SelectItem>
                      <SelectItem value="rent">Location</SelectItem>
                      <SelectItem value="sell">Vente</SelectItem>
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

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedType('');
                    setRooms(0);
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="py-20 text-center">
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
