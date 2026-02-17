import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, role = 'client', client_id = null } = await req.json()

    console.log('📝 [1] Iniciando registro para:', email, 'role:', role)

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Create user in Supabase Auth
    console.log('🔐 [2] Criando usuário no Supabase Auth...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error('❌ [2] Erro ao criar no Auth:', authError.message)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [2] Usuário criado no Auth:', authData.user?.id)

    // 2. Create user record in public.users table
    console.log('📊 [3] Criando registro na tabela users...')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user!.id,
        email: email,
        role: role,
        client_id: client_id,
        password_hash: 'managed_by_supabase_auth', // Placeholder since Auth handles passwords
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ [3] Erro ao criar na tabela users:', userError.message)
      // Rollback: delete the auth user if we can't create the profile
      await supabaseAdmin.auth.admin.deleteUser(authData.user!.id)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar perfil: ' + userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [3] Registro criado na tabela users:', userData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authData.user!.id,
          email: email,
          role: role,
        },
        message: 'Usuário criado com sucesso!'
      }),
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
