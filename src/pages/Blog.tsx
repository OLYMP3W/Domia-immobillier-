import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AuthModal } from '@/components/AuthModal';

const blogPosts = [
  {
    id: 'lancement-blog-domia',
    title: 'Bienvenue sur le Blog Domia — La recherche immobilière réinventée',
    excerpt: "Domia lance officiellement son blog ! Découvrez notre vision : rendre la recherche de logement au Gabon plus simple, plus transparente et plus accessible à tous. Propriétaires et locataires, cet espace est le vôtre.",
    date: '2026-03-05',
    readTime: '4 min',
    category: 'Actualité',
    featured: true,
    content: `
## 🎉 Domia lance son blog !

Nous sommes ravis de vous annoncer le lancement officiel du blog Domia. Cet espace sera votre source d'information privilégiée sur l'immobilier au Gabon.

### Pourquoi un blog ?

Chez Domia, nous croyons que **trouver un logement ne devrait jamais être un parcours du combattant**. Notre plateforme connecte directement propriétaires et locataires, sans intermédiaires, sans frais cachés.

Avec ce blog, nous allons plus loin en vous offrant :

- **Des conseils pratiques** pour louer ou mettre en location
- **Les tendances du marché** immobilier gabonais
- **Des guides** pour les propriétaires et locataires
- **Les nouveautés** de la plateforme Domia

### Ce qui rend Domia unique

🏠 **Publication gratuite** — Les propriétaires publient leurs annonces sans frais
📱 **Application mobile** — Domia s'installe sur votre téléphone comme une vraie app
💬 **Messagerie intégrée** — Communiquez directement avec les propriétaires
🔔 **Notifications en temps réel** — Soyez alerté dès qu'une annonce correspond à vos critères
📞 **Contact direct** — Appelez ou écrivez sur WhatsApp en un clic

### Rejoignez la communauté

Domia grandit chaque jour grâce à vous. Que vous soyez propriétaire cherchant à louer votre bien, ou locataire à la recherche du logement idéal, **Domia est fait pour vous**.

> "Notre mission est simple : connecter les bonnes personnes aux bons logements, rapidement et en toute confiance."

Restez connectés, d'autres articles arrivent très bientôt ! 🚀
    `,
  },
];

const Blog = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 gradient-gold border-0 text-sm px-4 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Blog Domia
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Actualités & Conseils<br />
              <span className="text-accent">Immobiliers</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez nos articles sur l'immobilier au Gabon, les tendances du marché et les conseils pour propriétaires et locataires.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <main className="flex-1 container mx-auto px-4 pb-20 md:pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="group">
              <Link to={`/blog/${post.id}`}>
                <div className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1">
                  {post.featured && (
                    <Badge className="mb-3 bg-accent/10 text-accent border-accent/20 text-xs">
                      ⭐ Article vedette
                    </Badge>
                  )}
                  <Badge variant="outline" className="mb-3 ml-2">{post.category}</Badge>

                  <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
      <MobileNavbar onOpenAuth={() => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Blog;
