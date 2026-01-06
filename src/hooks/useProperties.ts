import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useProperties = (filters?: {
  city?: string;
  type?: string;
  minRooms?: number;
  ownerId?: string;
}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (filters?.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.minRooms && filters.minRooms > 0) {
        query = query.gte('rooms', filters.minRooms);
      }
      if (filters?.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch owner public profiles (no email/phone exposed)
      const ownerIds = [...new Set(data?.map(p => p.owner_id) || [])];
      const { data: publicProfiles } = await supabase
        .from('public_profiles')
        .select('user_id, fullname, avatar_url')
        .in('user_id', ownerIds);

      const profileMap = new Map(publicProfiles?.map(p => [p.user_id, { fullname: p.fullname, avatar_url: p.avatar_url }]) || []);

      return (data || []).map(property => ({
        ...property,
        owner: profileMap.get(property.owner_id) || null,
      })) as Property[];
    },
  });
};

export const useMyProperties = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Fetch owner public profile (no email/phone exposed to public)
      const { data: ownerPublicProfile } = await supabase
        .from('public_profiles')
        .select('user_id, fullname, avatar_url')
        .eq('user_id', data.owner_id)
        .single();

      // Fetch owner private profile for phone (only visible if RLS allows - authenticated users)
      const { data: ownerPrivateProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', data.owner_id)
        .maybeSingle();
      
      // Increment views
      await supabase.rpc('increment_property_views', { property_id: id });
      
      return {
        ...data,
        owner: ownerPublicProfile ? {
          fullname: ownerPublicProfile.fullname,
          avatar_url: ownerPublicProfile.avatar_url,
          phone: ownerPrivateProfile?.phone || null,
        } : null,
      } as Property;
    },
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (property: Omit<Property, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'views' | 'owner' | 'images'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...property,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Property> & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', data.id] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
    },
  });
};

export const useAddPropertyImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, url, isPrimary }: { propertyId: string; url: string; isPrimary?: boolean }) => {
      const { data, error } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          url,
          is_primary: isPrimary || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property', data.property_id] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
    },
  });
};
