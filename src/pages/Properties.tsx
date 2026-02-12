import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProperties } from '@/hooks/useProperties';
import { SlidersHorizontal, Home, Loader2, Search, X, MapPin } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

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
  const [showFilters, setShowFilters] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { data: properties = [], isLoading } = useProperties({
    city: selectedCity !== 'all' ? selectedCity : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    minRooms: rooms > 0 ? rooms : undefined,
  });

  const filteredProperties = properties.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || (p.neighborhood || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (minBudget && p.price < parseInt(minBudget)) return false;
    if (maxBudget && p.price > parseInt(maxBudget)) return false;
    return true;
  });

  const activeFiltersCount = [selectedCity !== 'all', selectedType !== 'all', rooms > 0, !!minBudget, !!maxBudget].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedType('all');
    setRooms(0);
    setSearchQuery('');
    setMinBudget('');
    setMaxBudget('');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Header avec recherche */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une propriété..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/50 bg-background"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              className="h-11 rounded-xl relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filtres expandables */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 pb-2 animate-fade-in">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {gabonCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Type" />
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

              <Select value={rooms.toString()} onValueChange={(v) => setRooms(Number(v))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Pièces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Toutes</SelectItem>
                  <SelectItem value="1">1+ pièce</SelectItem>
                  <SelectItem value="2">2+ pièces</SelectItem>
                  <SelectItem value="3">3+ pièces</SelectItem>
                  <SelectItem value="4">4+ pièces</SelectItem>
                </SelectContent>
              </Select>

              <Input type="number" placeholder="Budget min" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="rounded-xl" />
              <Input type="number" placeholder="Budget max" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="rounded-xl" />

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground col-span-2 md:col-span-5">
                  <X className="h-4 w-4 mr-1" /> Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">Propriétés</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredProperties.length} résultat{filteredProperties.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Aucune propriété trouvée</h3>
            <p className="text-muted-foreground mb-6">Essayez de modifier vos critères de recherche</p>
            <Button variant="outline" onClick={resetFilters}>Réinitialiser les filtres</Button>
          </div>
        )}
      </div>

      <Footer />
      <MobileNavbar onOpenAuth={(type) => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Properties;
