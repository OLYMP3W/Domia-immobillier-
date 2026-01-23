import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with user's token to verify them
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin status via email
    if (user.email !== 'infodomia7@gmail.com') {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { action, propertyId, reportId, status } = await req.json();

    if (action === 'get-stats') {
      // Get all stats using service role
      const [usersRes, propertiesRes, installsRes, rolesRes] = await Promise.all([
        adminClient.from('profiles').select('user_id, fullname, email, created_at'),
        adminClient.from('properties').select('id, title, city, owner_id, views, is_published, created_at'),
        adminClient.from('app_installs').select('*', { count: 'exact', head: true }),
        adminClient.from('user_roles').select('user_id, role'),
      ]);

      const users = usersRes.data || [];
      const properties = propertiesRes.data || [];
      const rolesData = rolesRes.data || [];

      // Build role map
      const roleMap = new Map(rolesData.map((r: any) => [r.user_id, r.role]));
      const usersWithRoles = users.map((u: any) => ({
        ...u,
        role: roleMap.get(u.user_id) || 'unknown',
      }));

      // Get owner info for properties
      const ownerIds = [...new Set(properties.map((p: any) => p.owner_id))];
      const { data: ownersData } = await adminClient
        .from('profiles')
        .select('user_id, fullname, email')
        .in('user_id', ownerIds);

      const ownerMap = new Map((ownersData || []).map((o: any) => [o.user_id, o]));
      const propertiesWithOwners = properties.map((p: any) => ({
        ...p,
        owner_name: ownerMap.get(p.owner_id)?.fullname || 'Inconnu',
        owner_email: ownerMap.get(p.owner_id)?.email || '',
      }));

      // Get reports
      const { data: reportsData } = await adminClient
        .from('reported_properties')
        .select('id, property_id, reason, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      const reportPropertyIds = (reportsData || []).map((r: any) => r.property_id);
      const { data: reportedProps } = await adminClient
        .from('properties')
        .select('id, title')
        .in('id', reportPropertyIds);

      const propMap = new Map((reportedProps || []).map((p: any) => [p.id, p.title]));
      const reportsWithTitles = (reportsData || []).map((r: any) => ({
        ...r,
        property_title: propMap.get(r.property_id) || 'Supprimée',
      }));

      const totalViews = properties.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
      const owners = rolesData.filter((r: any) => r.role === 'owner').length;
      const tenants = rolesData.filter((r: any) => r.role === 'tenant').length;

      return new Response(JSON.stringify({
        stats: {
          totalUsers: users.length,
          totalOwners: owners,
          totalTenants: tenants,
          totalProperties: properties.length,
          totalInstalls: installsRes.count || 0,
          totalViews,
        },
        users: usersWithRoles,
        properties: propertiesWithOwners,
        reports: reportsWithTitles,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete-property' && propertyId) {
      const { error } = await adminClient
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update-report' && reportId && status) {
      const { error } = await adminClient
        .from('reported_properties')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Admin function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
