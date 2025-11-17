import { useState } from 'react';
import { Search, MapPin, Home as HomeIcon, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties, cities } from '@/data/mockData';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');

  const openAuthModal = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const filteredProperties = mockProperties.filter(property => {
    if (searchCity && property.city !== searchCity) return false;
    if (searchType && property.status !== searchType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenAuth={openAuthModal} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-dark py-20 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAwYzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-black text-white md:text-6xl animate-fade-up">
            Trouvez votre <span className="text-gold">maison idéale</span> au Gabon
          </h1>
          <p className="mb-8 text-lg text-white/90 md:text-xl animate-fade-up delay-1">
            Découvrez des annonces vérifiées par des propriétaires de confiance
          </p>

          {/* Search Bar */}
          <div className="glass mx-auto max-w-3xl rounded-2xl p-4 animate-fade-up delay-2">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Select value={searchCity} onValueChange={setSearchCity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les villes</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="rent">Location</SelectItem>
                    <SelectItem value="sell">Vente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="gradient-gold md:w-auto" size="lg">
                <Search className="mr-2 h-5 w-5" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center animate-fade-in">
              <div className="mb-2 text-4xl font-bold text-gold">500+</div>
              <div className="text-sm text-muted-foreground">Annonces actives</div>
            </div>
            <div className="text-center animate-fade-in delay-1">
              <div className="mb-2 text-4xl font-bold text-gold">200+</div>
              <div className="text-sm text-muted-foreground">Propriétaires</div>
            </div>
            <div className="text-center animate-fade-in delay-2">
              <div className="mb-2 text-4xl font-bold text-gold">1000+</div>
              <div className="text-sm text-muted-foreground">Locataires actifs</div>
            </div>
            <div className="text-center animate-fade-in delay-3">
              <div className="mb-2 text-4xl font-bold text-gold">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Annonces récentes</h2>
              <p className="text-muted-foreground">Découvrez les dernières propriétés disponibles</p>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/properties">
                <TrendingUp className="mr-2 h-4 w-4" />
                Voir tout
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="py-20 text-center">
              <HomeIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-xl font-semibold">Aucune propriété trouvée</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-navy to-navy-dark py-20 text-white">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl animate-fade-up">
            Vous êtes propriétaire ?
          </h2>
          <p className="mb-8 text-lg text-white/90 animate-fade-up delay-1">
            Publiez vos annonces gratuitement et trouvez des locataires de confiance
          </p>
          <Button
            size="lg"
            className="gradient-gold animate-fade-up delay-2"
            onClick={() => openAuthModal('register')}
          >
            Publier une annonce
          </Button>
        </div>
      </section>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalType}
      />

      <Footer />
    </div>
  );
};

export default Index;
