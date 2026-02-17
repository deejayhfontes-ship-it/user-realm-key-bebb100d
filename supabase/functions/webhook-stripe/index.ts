import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('📥 Webhook Stripe recebido');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Log webhook for debugging
    const { error: logError } = await supabase.from('webhook_logs').insert({
      gateway: 'stripe',
      event_type: 'raw_webhook',
      payload: JSON.parse(payload),
      processed: false,
    });

    if (logError) {
      console.error('❌ Erro ao salvar log:', logError);
    }

    // Parse the event
    const event = JSON.parse(payload);
    console.log('📋 Evento:', event.type);

    // TODO: Validate signature with webhook secret
    // const webhookSecret = await getWebhookSecret(supabase);
    // if (webhookSecret) {
    //   // Validate signature
    // }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('✅ Checkout session completed');
        // TODO: Process successful checkout
        // - Find client by customer email
        // - Update client credits based on plan
        // - Update payment status to 'approved'
        break;

      case 'invoice.paid':
        console.log('✅ Invoice paid');
        // TODO: Process subscription renewal
        break;

      case 'invoice.payment_failed':
        console.log('❌ Invoice payment failed');
        // TODO: Handle failed payment
        break;

      case 'customer.subscription.deleted':
        console.log('🚫 Subscription cancelled');
        // TODO: Handle subscription cancellation
        break;

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
    }

    // Update log as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true, event_type: event.type })
      .eq('gateway', 'stripe')
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
