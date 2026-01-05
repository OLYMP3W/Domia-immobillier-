import { useState } from 'react';
import { Search, Home as HomeIcon, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties } from '@/hooks/useProperties';
import { usePublicStats } from '@/hooks/useStats';

const cities = ['Libreville', 'Port Gentil', 'Franceville', 'Oyem', 'Moanda'];

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [searchCity, setSearchCity] = useState('all');
  const [searchType, setSearchType] = useState('all');

  const { data: properties = [], isLoading } = useProperties({
    city: searchCity !== 'all' ? searchCity : undefined,
    type: searchType !== 'all' ? searchType : undefined,
  });

  const { data: stats } = usePublicStats();

  const openAuthModal = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

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
                    <SelectItem value="all">Toutes les villes</SelectItem>
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
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="rent">Location</SelectItem>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="gradient-gold md:w-auto" size="lg" asChild>
                <Link to="/properties">
                  <Search className="mr-2 h-5 w-5" />
                  Rechercher
                </Link>
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
              <div className="mb-2 text-4xl font-bold text-gold">{stats?.properties || 245}</div>
              <div className="text-sm text-muted-foreground">Annonces actives</div>
            </div>
            <div className="text-center animate-fade-in delay-1">
              <div className="mb-2 text-4xl font-bold text-gold">{stats?.owners || 89}</div>
              <div className="text-sm text-muted-foreground">Propriétaires</div>
            </div>
            <div className="text-center animate-fade-in delay-2">
              <div className="mb-2 text-4xl font-bold text-gold">{stats?.tenants || 1250}</div>
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Annonces récentes</h2>
              <p className="text-muted-foreground">Découvrez les dernières propriétés disponibles</p>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/properties">
                <TrendingUp className="mr-2 h-4 w-4" />
                Voir tout
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <HomeIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-xl font-semibold">Aucune propriété disponible</h3>
              <p className="text-muted-foreground">Les nouvelles annonces apparaîtront ici</p>
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