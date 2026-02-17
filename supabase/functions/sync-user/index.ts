import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncResult {
  auth_user_id: string;
  auth_email: string | undefined;
  auth_confirmed: boolean;
  public_user: Record<string, unknown> | null;
  synced: boolean;
  error?: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    console.log('🔄 [1] Sincronizando usuário:', email)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Get user from Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ [1] Erro ao listar usuários:', listError.message)
      return new Response(
        JSON.stringify({ error: listError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authUser = users.find(u => u.email === email)
    
    if (!authUser) {
      console.log('⚠️ [2] Usuário não encontrado no Auth')
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado no Auth', found_in_auth: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [2] Usuário encontrado no Auth:', authUser.id, authUser.email)

    // 2. Check if user exists in public.users table
    const { data: publicUser, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (publicError) {
      console.error('❌ [3] Erro ao buscar na tabela users:', publicError.message)
    }

    const result: SyncResult = {
      auth_user_id: authUser.id,
      auth_email: authUser.email,
      auth_confirmed: authUser.email_confirmed_at ? true : false,
      public_user: publicUser,
      synced: false,
    }

    // 3. If public user exists but ID is different, update it
    if (publicUser && publicUser.id !== authUser.id) {
      console.log('🔄 [4] IDs diferentes, atualizando...')
      console.log('   Auth ID:', authUser.id)
      console.log('   Public ID:', publicUser.id)
      
      // Update the ID in public.users to match Auth
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ id: authUser.id })
        .eq('email', email)

      if (updateError) {
        console.error('❌ [4] Erro ao atualizar ID:', updateError.message)
        result.error = updateError.message
      } else {
        console.log('✅ [4] ID atualizado com sucesso!')
        result.synced = true
      }
    } else if (!publicUser) {
      console.log('⚠️ [4] Usuário não existe na tabela public.users')
      result.message = 'Usuário existe no Auth mas não na tabela users'
    } else {
      console.log('✅ [4] IDs já estão sincronizados')
      result.synced = true
      result.message = 'IDs já sincronizados'
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
