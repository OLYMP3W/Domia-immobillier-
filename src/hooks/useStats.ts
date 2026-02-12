import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOwnerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, views, is_published')
        .eq('owner_id', user.id);

      if (propError) throw propError;

      const activeListings = properties?.filter(p => p.is_published).length || 0;
      const totalViews = properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      const { count: messagesCount, error: msgError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (msgError) throw msgError;

      return {
        activeListings,
        totalViews,
        messages: messagesCount || 0,
        conversionRate: totalViews > 0 ? Math.round((messagesCount || 0) / totalViews * 100) : 0,
      };
    },
    enabled: !!user,
  });
};

export const useTenantStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tenant-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: searchesCount } = await supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      return {
        favorites: favoritesCount || 0,
        savedSearches: searchesCount || 0,
        notifications: notificationsCount || 0,
        messages: messagesCount || 0,
      };
    },
    enabled: !!user,
  });
};

// Utilise une fonction SECURITY DEFINER pour contourner le RLS
export const usePublicStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_stats');
      if (error) throw error;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data as Record<string, number>;
      return {
        properties: parsed?.properties || 0,
        owners: parsed?.owners || 0,
        tenants: parsed?.tenants || 0,
        satisfaction: 98,
      };
    },
  });
};
