import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Favorite, Property } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(
            *,
            images:property_images(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch owner profiles for properties
      const ownerIds = [...new Set(data?.map(f => f.property?.owner_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', ownerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(favorite => ({
        ...favorite,
        property: favorite.property ? {
          ...favorite.property,
          owner: profileMap.get(favorite.property.owner_id) || null,
        } : null,
      })) as Favorite[];
    },
    enabled: !!user,
  });
};

export const useIsFavorite = (propertyId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorite', propertyId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!propertyId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });

        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (_, propertyId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite', propertyId] });
    },
  });
};
