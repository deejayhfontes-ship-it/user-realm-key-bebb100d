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
        const { email, newPassword } = await req.json()

        console.log('🔑 [1] Solicitação de reset de senha para:', email)

        if (!email || !newPassword) {
            return new Response(
                JSON.stringify({ error: 'Email e nova senha são obrigatórios' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (newPassword.length < 6) {
            return new Response(
                JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Verify the caller is an admin by checking their JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Token de autorização ausente' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create Supabase client with service role key for admin operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Verify caller is admin using their JWT
        const anonClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const token = authHeader.replace('Bearer ', '')
        const { data: { user: caller }, error: authError } = await anonClient.auth.getUser(token)

        if (authError || !caller) {
            return new Response(
                JSON.stringify({ error: 'Token inválido' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if caller is admin
        const { data: callerProfile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', caller.id)
            .single()

        if (!callerProfile || callerProfile.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Apenas administradores podem redefinir senhas' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Find the target user by email
        console.log('🔍 [2] Buscando usuário pelo email...')
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
            console.error('❌ [2] Erro ao listar usuários:', listError.message)
            return new Response(
                JSON.stringify({ error: 'Erro ao buscar usuários' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!targetUser) {
            return new Response(
                JSON.stringify({ error: `Usuário com email ${email} não encontrado no Auth` }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Update the user's password
        console.log('🔐 [3] Atualizando senha do usuário:', targetUser.id)
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            { password: newPassword }
        )

        if (updateError) {
            console.error('❌ [3] Erro ao atualizar senha:', updateError.message)
            return new Response(
                JSON.stringify({ error: 'Erro ao atualizar senha: ' + updateError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('✅ [3] Senha atualizada com sucesso para:', email)

        return new Response(
            JSON.stringify({
                success: true,
                message: `Senha do usuário ${email} atualizada com sucesso!`
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
