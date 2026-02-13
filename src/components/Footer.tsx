import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import logo from '@/assets/logo-domia.png';

export const Footer = () => {
  const { isInstalled } = usePWAInstall();

  // Si l'app est installée (PWA), affiche un footer minimal
  if (isInstalled) {
    return (
      <footer className="border-t bg-muted/30 py-6 pb-24">
        <div className="container">
          <div className="flex flex-col items-center gap-4">
            {/* Réseaux sociaux uniquement */}
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61583603153181" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Domia</p>
          </div>
        </div>
      </footer>
    );
  }

  // Footer complet pour le site web
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="Domia" className="h-14" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              La plateforme de référence pour la location et la vente immobilière au Gabon.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61583603153181" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-gold transition-colors">Accueil</Link></li>
              <li><Link to="/properties" className="hover:text-gold transition-colors">Rechercher</Link></li>
              <li><Link to="/install" className="hover:text-gold transition-colors">Télécharger l'app</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/property/new" className="hover:text-gold transition-colors">Publier une annonce</Link></li>
              <li><Link to="/settings" className="hover:text-gold transition-colors">Paramètres</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Libreville, Gabon</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a href="tel:+241076467692" className="hover:text-gold transition-colors">+241 076 46 76 92</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <span>contact@domia.ga</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Domia. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
