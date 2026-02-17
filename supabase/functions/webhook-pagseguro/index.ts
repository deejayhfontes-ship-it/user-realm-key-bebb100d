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

  console.log('📥 Webhook PagSeguro recebido');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // PagSeguro can send both form-urlencoded and JSON
    let payload: Record<string, unknown>;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      payload = await req.json();
    }

    // Log webhook for debugging
    const notificationType = (payload.notificationType as string) || 'unknown';
    const { error: logError } = await supabase.from('webhook_logs').insert({
      gateway: 'pagseguro',
      event_type: notificationType,
      payload: payload,
      processed: false,
    });

    if (logError) {
      console.error('❌ Erro ao salvar log:', logError);
    }

    console.log('📋 Tipo de notificação:', notificationType);

    // Handle different notification types
    switch (notificationType) {
      case 'transaction':
        console.log('💳 Notificação de transação');
        // TODO: Fetch transaction details from PagSeguro API
        // const notificationCode = payload.notificationCode;
        // - Get transaction info from PagSeguro
        // - If status === 3 (Paga), update client credits
        // - Update payment record
        break;

      case 'preApproval':
        console.log('🔄 Notificação de assinatura');
        // TODO: Handle pre-approval (subscription) events
        break;

      default:
        console.log(`ℹ️ Evento não tratado: ${notificationType}`);
    }

    // Update log as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('gateway', 'pagseguro')
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
