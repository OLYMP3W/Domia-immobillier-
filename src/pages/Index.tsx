import { useState, useEffect, useCallback } from 'react';
import { Search, Home as HomeIcon, TrendingUp, Loader2, Building2, Users, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties } from '@/hooks/useProperties';
import { usePublicStats } from '@/hooks/useStats';

// Images hero diaporama
import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';

const heroImages = [hero1, hero2, hero3];

// Toutes les villes du Gabon
const gabonCities = [
  'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda',
  'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou',
  'Bitam', 'Gamba', 'Mounana', 'Ntoum', 'Lastoursville',
  'Akanda', 'Owendo', 'Ndjolé', 'Cap Estérias', 'Fougamou',
  'Booué', 'Ndendé', 'Mayumba', 'Mimongo', 'Okondja',
  'Mékambo', 'Minvoul', 'Cocobeach', 'Mbigou', 'Lekoni'
].sort();

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [searchCity, setSearchCity] = useState('all');
  const [searchType, setSearchType] = useState('all');
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  const { data: properties = [], isLoading } = useProperties({
    city: searchCity !== 'all' ? searchCity : undefined,
    type: searchType !== 'all' ? searchType : undefined,
  });

  const { data: stats } = usePublicStats();

  // Diaporama automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openAuthModal = useCallback((type: 'login' | 'register') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar onOpenAuth={openAuthModal} />

      {/* Hero Section - Diaporama avec glassmorphism */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        {/* Images de fond en diaporama */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: currentHeroImage === index ? 1 : 0 }}
          >
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover"
              draggable="false"
            />
          </div>
        ))}

        {/* Overlay gradient sombre */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Contenu hero */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
          <div className="max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
              <Shield className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-white">Annonces vérifiées par Domia</span>
            </div>

            <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-7xl">
              Trouvez votre{' '}
              <span className="bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-light))] bg-clip-text text-transparent">
                maison idéale
              </span>
              <br />au Gabon
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl">
              La plateforme immobilière de référence au Gabon. Des annonces fiables, des propriétaires vérifiés.
            </p>

            {/* Barre de recherche glassmorphism */}
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl md:p-5">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <Select value={searchCity} onValueChange={setSearchCity}>
                    <SelectTrigger className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm [&>svg]:text-white">
                      <SelectValue placeholder="Ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {gabonCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm [&>svg]:text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="rent">Location</SelectItem>
                      <SelectItem value="sale">Vente</SelectItem>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="house">Maison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="h-12 gradient-gold px-8 text-base font-semibold shadow-lg" asChild>
                  <Link to="/properties">
                    <Search className="mr-2 h-5 w-5" />
                    Rechercher
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Indicateurs de diaporama */}
          <div className="absolute bottom-8 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroImage(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentHeroImage === index ? 'w-8 bg-gold' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Glassmorphism cards */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="container">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {[
              { label: 'Annonces actives', value: stats?.properties || 0, icon: Building2 },
              { label: 'Propriétaires', value: stats?.owners || 0, icon: Users },
              { label: 'Locataires actifs', value: stats?.tenants || 0, icon: HomeIcon },
              { label: 'Satisfaction', value: `${stats?.satisfaction || 98}%`, icon: Shield },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-border/50 bg-card/80 p-5 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1 md:p-6"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-3xl font-black text-foreground md:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Properties Section - Clean design */}
      <section className="py-20">
        <div className="container">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">Annonces récentes</h2>
              <p className="mt-2 text-muted-foreground">Les meilleures propriétés disponibles maintenant</p>
            </div>
            <Button variant="outline" className="group" asChild>
              <Link to="/properties">
                Voir tout
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <HomeIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Aucune propriété disponible</h3>
              <p className="text-muted-foreground">Les nouvelles annonces apparaîtront ici</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Glassmorphism premium */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0">
          <img src={hero3} alt="" className="h-full w-full object-cover" draggable="false" />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>
        <div className="container relative z-10 text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white md:text-5xl">
            Vous êtes propriétaire ?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
            Publiez vos annonces gratuitement et trouvez des locataires de confiance sur la première plateforme immobilière du Gabon
          </p>
          <Button
            size="lg"
            className="gradient-gold px-10 text-base font-semibold shadow-2xl"
            onClick={() => openAuthModal('register')}
          >
            Publier une annonce
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalType}
      />

      <Footer />
      <MobileNavbar onOpenAuth={openAuthModal} />
    </div>
  );
};

export default Index;
