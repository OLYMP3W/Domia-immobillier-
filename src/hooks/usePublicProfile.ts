import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicProfile, Property } from '@/types/database';

export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as PublicProfile;
    },
    enabled: !!userId,
  });
};

export const useUserProperties = (userId: string) => {
  return useQuery({
    queryKey: ['user-properties', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*)
        `)
        .eq('owner_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get owner public profile
      const { data: ownerProfile } = await supabase
        .from('public_profiles')
        .select('user_id, fullname, avatar_url')
        .eq('user_id', userId)
        .single();

      return (data || []).map(property => ({
        ...property,
        public_owner: ownerProfile || null,
      })) as Property[];
    },
    enabled: !!userId,
  });
};
