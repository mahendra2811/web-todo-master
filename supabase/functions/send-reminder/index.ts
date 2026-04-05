// Supabase Edge Function: send-reminder
// Deno runtime — runs on Supabase's edge infrastructure
// Triggered via cron (pg_cron) or Supabase scheduled functions
//
// What it does:
// 1. Queries todos with due_date approaching (next 24 hours)
// 2. Creates notification records for each
// 3. Could send emails via Resend/SendGrid (not implemented in this example)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role key to bypass RLS — this function operates across all users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find todos due in the next 24 hours that aren't completed
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: dueTodos, error: todoError } = await supabaseAdmin
      .from('todos')
      .select('id, user_id, title, due_date, list_id')
      .gte('due_date', now.toISOString())
      .lte('due_date', in24Hours.toISOString())
      .neq('status', 'completed')
      .neq('status', 'cancelled');

    if (todoError) throw todoError;

    if (!dueTodos || dueTodos.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming due todos', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification records for each due todo
    const notifications = dueTodos.map((todo) => ({
      user_id: todo.user_id,
      type: 'due_reminder',
      title: `Reminder: "${todo.title}" is due soon`,
      body: `This task is due ${new Date(todo.due_date!).toLocaleDateString()}`,
      entity_type: 'todo',
      entity_id: todo.id,
      is_read: false,
    }));

    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications);

    if (notifError) throw notifError;

    return new Response(
      JSON.stringify({ message: 'Reminders sent', count: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
