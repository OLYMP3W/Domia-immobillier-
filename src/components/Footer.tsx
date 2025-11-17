import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Domia" className="h-10 w-10" />
              <span className="text-2xl font-black text-primary">Domia</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              La plateforme de référence pour la location et la vente immobilière au Gabon.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-colors">
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
              <li><Link to="/#" className="hover:text-gold transition-colors">Rechercher</Link></li>
              <li><Link to="/#" className="hover:text-gold transition-colors">À propos</Link></li>
              <li><Link to="/#" className="hover:text-gold transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/#" className="hover:text-gold transition-colors">Publier une annonce</Link></li>
              <li><Link to="/#" className="hover:text-gold transition-colors">Devenir premium</Link></li>
              <li><Link to="/#" className="hover:text-gold transition-colors">Aide & Support</Link></li>
              <li><Link to="/#" className="hover:text-gold transition-colors">Contact</Link></li>
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
                <span>+241 XX XX XX XX</span>
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
