export interface Profile {
  id: string;
  user_id: string;
  fullname: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'owner' | 'tenant';
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  price: number;
  city: string;
  neighborhood: string | null;
  address: string | null;
  type: string;
  rooms: number;
  bathrooms: number | null;
  surface: number | null;
  is_premium: boolean;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: Profile;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
  property?: Property;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  city: string | null;
  type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_rooms: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
