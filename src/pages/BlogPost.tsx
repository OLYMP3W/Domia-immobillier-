import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNavbar } from '@/components/MobileNavbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AuthModal } from '@/components/AuthModal';

// Same data - in production this would come from DB
const blogPosts: Record<string, any> = {
  'lancement-blog-domia': {
    title: 'Bienvenue sur le Blog Domia — La recherche immobilière réinventée',
    date: '2026-03-05',
    readTime: '4 min',
    category: 'Actualité',
    content: `## 🎉 Domia lance son blog !

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

Restez connectés, d'autres articles arrivent très bientôt ! 🚀`,
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const post = slug ? blogPosts[slug] : null;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post?.title, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Lien copié' });
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Button asChild><Link to="/blog">Retour au blog</Link></Button>
        </div>
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-8 mb-3">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{line.slice(3)}</h2>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-accent pl-4 py-2 my-6 italic text-muted-foreground bg-accent/5 rounded-r-lg">{line.slice(2)}</blockquote>;
      if (line.startsWith('- ')) {
        const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <li key={i} className="ml-4 mb-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: text }} />;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      const text = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return <p key={i} className="text-muted-foreground leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: text }} />;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/blog"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <Badge variant="outline">{post.category}</Badge>
            <Button variant="ghost" size="icon" className="rounded-full ml-auto" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          <div className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </div>

          <div className="mt-16 pt-8 border-t border-border/50 text-center">
            <h3 className="text-xl font-bold mb-3">Vous cherchez un logement ?</h3>
            <p className="text-muted-foreground mb-6">Explorez les annonces disponibles sur Domia</p>
            <Button className="gradient-gold rounded-xl" asChild>
              <Link to="/properties">Voir les annonces</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNavbar onOpenAuth={() => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default BlogPost;
