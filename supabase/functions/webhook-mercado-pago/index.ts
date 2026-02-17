import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('📥 Webhook Mercado Pago recebido');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();

    // Log webhook for debugging
    const { error: logError } = await supabase.from('webhook_logs').insert({
      gateway: 'mercado_pago',
      event_type: payload.type || payload.action || 'unknown',
      payload: payload,
      processed: false,
    });

    if (logError) {
      console.error('❌ Erro ao salvar log:', logError);
    }

    console.log('📋 Tipo de notificação:', payload.type || payload.action);

    // Handle different notification types
    // Mercado Pago uses 'action' for IPN and 'type' for webhooks
    const eventType = payload.type || payload.action;

    switch (eventType) {
      case 'payment':
      case 'payment.created':
      case 'payment.updated':
        console.log('💳 Notificação de pagamento');
        // TODO: Fetch payment details from MP API
        // const paymentId = payload.data?.id;
        // - Get payment info from MP
        // - If approved, update client credits
        // - Update payment record
        break;

      case 'subscription_preapproval':
      case 'subscription_authorized_payment':
        console.log('🔄 Notificação de assinatura');
        // TODO: Handle subscription events
        break;

      default:
        console.log(`ℹ️ Evento não tratado: ${eventType}`);
    }

    // Update log as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('gateway', 'mercado_pago')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Erro no webhook:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
