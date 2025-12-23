import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOwnerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get property count and total views
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, views, is_published')
        .eq('owner_id', user.id);

      if (propError) throw propError;

      const activeListings = properties?.filter(p => p.is_published).length || 0;
      const totalViews = properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      // Get unread messages count
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

      // Get favorites count
      const { count: favoritesCount, error: favError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (favError) throw favError;

      // Get saved searches count
      const { count: searchesCount, error: searchError } = await supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (searchError) throw searchError;

      // Get unread notifications count
      const { count: notificationsCount, error: notifError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (notifError) throw notifError;

      // Get unread messages count
      const { count: messagesCount, error: msgError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (msgError) throw msgError;

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

export const usePublicStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      // Get published properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Get owners count
      const { count: ownersCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'owner');

      // Get tenants count
      const { count: tenantsCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'tenant');

      return {
        properties: propertiesCount || 0,
        owners: ownersCount || 0,
        tenants: tenantsCount || 0,
        satisfaction: 98,
      };
    },
  });
};
