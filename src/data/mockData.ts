export interface Property {
  id: string;
  images: string[];
  price: string;
  title: string;
  city: string;
  neighborhood: string;
  rooms: number;
  status: 'rent' | 'sell';
  description: string;
  isPremium: boolean;
  owner: {
    id: string;
    fullname: string;
    profilePicUrl: string;
  };
}

export const mockProperties: Property[] = [
  {
    id: 'h1',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'],
    price: '450 000 CFA/mois',
    title: 'Appartement T3 Spacieux',
    city: 'Libreville',
    neighborhood: 'Batterie IV',
    rooms: 3,
    status: 'rent',
    description: 'Bel appartement T3 rénové, très lumineux, situé dans un quartier calme et sécurisé. Idéal pour jeune couple ou petite famille.',
    isPremium: true,
    owner: {
      id: 'owner_123',
      fullname: 'Jean Dupont',
      profilePicUrl: '/placeholder.svg'
    }
  },
  {
    id: 'h2',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'],
    price: '30 000 000 CFA',
    title: 'Maison Individuelle avec Jardin',
    city: 'Port Gentil',
    neighborhood: 'Balise',
    rooms: 4,
    status: 'sell',
    description: 'Grande maison individuelle avec jardin et piscine, idéale pour une famille. Prix négociable.',
    isPremium: true,
    owner: {
      id: 'owner_456',
      fullname: 'Marie Ondo',
      profilePicUrl: '/placeholder.svg'
    }
  },
  {
    id: 'h3',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    price: '300 000 CFA/mois',
    title: 'Studio Meublé Centre-Ville',
    city: 'Franceville',
    neighborhood: 'Plateau',
    rooms: 1,
    status: 'rent',
    description: 'Studio meublé et équipé en plein centre-ville. Excellent pour étudiant.',
    isPremium: false,
    owner: {
      id: 'owner_789',
      fullname: 'Pierre Nguema',
      profilePicUrl: '/placeholder.svg'
    }
  },
  {
    id: 'h4',
    images: ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4'],
    price: '550 000 CFA/mois',
    title: 'Villa Moderne avec Piscine',
    city: 'Libreville',
    neighborhood: 'Sablière',
    rooms: 5,
    status: 'rent',
    description: 'Magnifique villa moderne avec piscine, jardin tropical et garage double. Quartier résidentiel haut standing.',
    isPremium: true,
    owner: {
      id: 'owner_234',
      fullname: 'Sophie Makaya',
      profilePicUrl: '/placeholder.svg'
    }
  },
  {
    id: 'h5',
    images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde'],
    price: '380 000 CFA/mois',
    title: 'Appartement T2 Vue Mer',
    city: 'Port Gentil',
    neighborhood: 'Bonaventure',
    rooms: 2,
    status: 'rent',
    description: 'Charmant T2 avec vue imprenable sur la mer. Cuisine équipée, terrasse spacieuse.',
    isPremium: false,
    owner: {
      id: 'owner_567',
      fullname: 'David Obame',
      profilePicUrl: '/placeholder.svg'
    }
  },
  {
    id: 'h6',
    images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d'],
    price: '45 000 000 CFA',
    title: 'Villa de Luxe Bord de Mer',
    city: 'Libreville',
    neighborhood: 'Pointe Denis',
    rooms: 6,
    status: 'sell',
    description: 'Villa d\'exception en bord de mer avec accès privé à la plage. Architecture contemporaine, prestations haut de gamme.',
    isPremium: true,
    owner: {
      id: 'owner_890',
      fullname: 'Patricia Moussavou',
      profilePicUrl: '/placeholder.svg'
    }
  }
];

export const cities = ['Libreville', 'Port Gentil', 'Franceville', 'Oyem', 'Moanda'];
