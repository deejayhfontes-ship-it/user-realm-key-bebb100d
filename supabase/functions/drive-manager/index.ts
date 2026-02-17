<<<<<<< HEAD
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Google Drive helpers ───────────────────────────────────────────
const ROOT_FOLDER_ID = '1QBQoRBOoNchYglG2wUwpqsqR8LcWMuao'

interface ServiceAccountKey {
    client_email: string
    private_key: string
    token_uri: string
}

/** Base64url encode (RFC 4648 §5) */
function base64url(input: Uint8Array | string): string {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
    let binary = ''
    for (const b of bytes) binary += String.fromCharCode(b)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Create a JWT signed with RS256 for Google APIs */
async function createJWT(sa: ServiceAccountKey): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/drive',
        aud: sa.token_uri,
        iat: now,
        exp: now + 3600,
    }

    const headerB64 = base64url(JSON.stringify(header))
    const payloadB64 = base64url(JSON.stringify(payload))
    const unsigned = `${headerB64}.${payloadB64}`

    // Import the RSA private key
    const pemBody = sa.private_key
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '')
    const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

    const key = await crypto.subtle.importKey(
        'pkcs8',
        keyBytes.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const sig = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(unsigned)
    )

    return `${unsigned}.${base64url(new Uint8Array(sig))}`
}

/** Obtain an access token from Google OAuth2 */
async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
    const jwt = await createJWT(sa)
    const res = await fetch(sa.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Google OAuth error: ${txt}`)
    }
    const data = await res.json()
    return data.access_token
}

/** Create a folder in Google Drive */
async function createDriveFolder(token: string, name: string, parentId: string) {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        }),
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Drive create folder error: ${txt}`)
    }
    return await res.json()
}

/** Share a Drive folder with an email (reader) */
async function shareDriveFolder(token: string, folderId: string, email: string) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'user',
                role: 'reader',
                emailAddress: email,
            }),
        }
    )
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Drive share error: ${txt}`)
    }
    return await res.json()
}

/** Enable "anyone with link" for a Drive folder */
async function enablePublicLink(token: string, folderId: string) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'anyone',
                role: 'reader',
            }),
        }
    )
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Drive public link error: ${txt}`)
    }
    return await res.json()
}

/** Delete a Drive file/folder */
async function deleteDriveFolder(token: string, folderId: string) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}`,
        {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        }
    )
    if (!res.ok && res.status !== 404) {
        const txt = await res.text()
        throw new Error(`Drive delete error: ${txt}`)
    }
}

// ─── Main handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const pathParts = url.pathname.split('/')
        const lastSegment = pathParts[pathParts.length - 1]

        // ═══════════════════════════════════════════════════════════════
        // GET /consultar?code=XXXX  — Public endpoint (no auth needed)
        // ═══════════════════════════════════════════════════════════════
        if (req.method === 'GET' && lastSegment === 'consultar') {
            const code = url.searchParams.get('code')
            if (!code) {
                return new Response(
                    JSON.stringify({ error: 'Parâmetro "code" é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
                { auth: { autoRefreshToken: false, persistSession: false } }
            )

            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('protocol_code, type, display_name, status, delivery_link_enabled, drive_folder_url, created_at, updated_at')
                .eq('protocol_code', code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const publicData = {
                ...protocol,
                drive_folder_url: protocol.delivery_link_enabled ? protocol.drive_folder_url : null,
            }

            console.log(`🔍 [drive-manager] consulta pública: ${code} → ${protocol.status}`)

            return new Response(
                JSON.stringify({ success: true, protocol: publicData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ─── POST actions (require JSON body) ───────────────────────
        const { action, protocol_code, display_name, type, customer_email, pedido_id } =
            await req.json()

        console.log(`📁 [drive-manager] action=${action} protocol=${protocol_code}`)

        // Supabase admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Parse Google Service Account
        const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if (!saJson) {
            return new Response(
                JSON.stringify({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON secret não configurado' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        const sa: ServiceAccountKey = JSON.parse(saJson)

        // ═══════════════════════════════════════════════════════════════
        // ACTION: CREATE_FOLDER
        // ═══════════════════════════════════════════════════════════════
        if (action === 'CREATE_FOLDER') {
            if (!display_name || !type) {
                return new Response(
                    JSON.stringify({ error: 'display_name e type são obrigatórios' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Generate protocol code via DB function
            const { data: codeData, error: codeError } = await supabaseAdmin.rpc(
                'generate_protocol_code',
                { p_type: type }
            )
            if (codeError) throw new Error(`Erro ao gerar código: ${codeError.message}`)

            const newCode = codeData as string
            const today = new Date().toISOString().split('T')[0]
            const folderName = `[${type}] - ${newCode} - ${display_name} - ${today}`

            // Create folder in Google Drive
            const token = await getAccessToken(sa)
            const folder = await createDriveFolder(token, folderName, ROOT_FOLDER_ID)
            const folderUrl = `https://drive.google.com/drive/folders/${folder.id}`

            console.log(`✅ Pasta criada: ${folderName} (${folder.id})`)

            // Insert protocol in database
            const { data: protocolData, error: protocolError } = await supabaseAdmin
                .from('protocols')
                .insert({
                    protocol_code: newCode,
                    type,
                    display_name,
                    customer_email: customer_email || null,
                    status: 'DRAFT',
                    drive_folder_id: folder.id,
                    drive_folder_url: folderUrl,
                    delivery_link_enabled: false,
                    pedido_id: pedido_id || null,
                })
                .select()
                .single()

            if (protocolError) throw new Error(`Erro ao salvar protocolo: ${protocolError.message}`)

            // Log action
            await supabaseAdmin.from('drive_actions').insert({
                protocol_code: newCode,
                action: 'CREATE_FOLDER',
                success: true,
                payload_json: { folder_id: folder.id, folder_name: folderName },
            })

            return new Response(
                JSON.stringify({ success: true, protocol: protocolData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ═══════════════════════════════════════════════════════════════
        // ACTION: ENABLE_DELIVERY
        // ═══════════════════════════════════════════════════════════════
        if (action === 'ENABLE_DELIVERY') {
            if (!protocol_code) {
                return new Response(
                    JSON.stringify({ error: 'protocol_code é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Fetch protocol
            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('*')
                .eq('protocol_code', protocol_code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            if (!protocol.drive_folder_id) {
                return new Response(
                    JSON.stringify({ error: 'Pasta do Drive não existe para este protocolo' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const token = await getAccessToken(sa)

            // Enable public link
            await enablePublicLink(token, protocol.drive_folder_id)

            // Share with customer email if available
            if (protocol.customer_email) {
                try {
                    await shareDriveFolder(token, protocol.drive_folder_id, protocol.customer_email)
                    await supabaseAdmin.from('drive_actions').insert({
                        protocol_code,
                        action: 'SHARE_EMAIL',
                        success: true,
                        payload_json: { email: protocol.customer_email },
                    })
                } catch (shareErr) {
                    console.warn('⚠️ Erro ao compartilhar por email:', shareErr)
                }
            }

            // Update protocol
            const { error: updateErr } = await supabaseAdmin
                .from('protocols')
                .update({
                    delivery_link_enabled: true,
                    status: 'READY_FOR_PICKUP',
                })
                .eq('protocol_code', protocol_code)

            if (updateErr) throw new Error(`Erro ao atualizar protocolo: ${updateErr.message}`)

            // Log action
            await supabaseAdmin.from('drive_actions').insert({
                protocol_code,
                action: 'ENABLE_DELIVERY',
                success: true,
                payload_json: { folder_id: protocol.drive_folder_id },
            })

            console.log(`✅ Entrega habilitada para ${protocol_code}`)

            return new Response(
                JSON.stringify({ success: true, message: 'Entrega habilitada com sucesso' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ═══════════════════════════════════════════════════════════════
        // ACTION: DELETE_FOLDER
        // ═══════════════════════════════════════════════════════════════
        if (action === 'DELETE_FOLDER') {
            if (!protocol_code) {
                return new Response(
                    JSON.stringify({ error: 'protocol_code é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('*')
                .eq('protocol_code', protocol_code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Delete from Drive if folder exists
            if (protocol.drive_folder_id) {
                const token = await getAccessToken(sa)
                await deleteDriveFolder(token, protocol.drive_folder_id)
                console.log(`🗑️ Pasta removida do Drive: ${protocol.drive_folder_id}`)
            }

            // Clean up database fields
            const { error: updateErr } = await supabaseAdmin
                .from('protocols')
                .update({
                    drive_folder_id: null,
                    drive_folder_url: null,
                    delivery_link_enabled: false,
                    status: 'CANCELED',
                })
                .eq('protocol_code', protocol_code)

            if (updateErr) throw new Error(`Erro ao atualizar protocolo: ${updateErr.message}`)

            // Log action
            await supabaseAdmin.from('drive_actions').insert({
                protocol_code,
                action: 'DELETE_FOLDER',
                success: true,
                payload_json: { folder_id: protocol.drive_folder_id },
            })

            return new Response(
                JSON.stringify({ success: true, message: 'Pasta removida e protocolo cancelado' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ═══════════════════════════════════════════════════════════════
        // ACTION: GET_PUBLIC
        // ═══════════════════════════════════════════════════════════════
        if (action === 'GET_PUBLIC') {
            if (!protocol_code) {
                return new Response(
                    JSON.stringify({ error: 'protocol_code é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('protocol_code, type, display_name, status, delivery_link_enabled, drive_folder_url, created_at, updated_at')
                .eq('protocol_code', protocol_code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Only return drive_folder_url if delivery is enabled
            const publicData = {
                ...protocol,
                drive_folder_url: protocol.delivery_link_enabled ? protocol.drive_folder_url : null,
            }

            return new Response(
                JSON.stringify({ success: true, protocol: publicData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ error: `Ação desconhecida: ${action}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('❌ Erro:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Erro interno' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
=======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Google Drive helpers ───────────────────────────────────────────
const ROOT_FOLDER_ID = '1QBQoRBOoNchYglG2wUwpqsqR8LcWMuao'

interface ServiceAccountKey {
    client_email: string
    private_key: string
    token_uri: string
}

/** Base64url encode (RFC 4648 §5) */
function base64url(input: Uint8Array | string): string {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
    let binary = ''
    for (const b of bytes) binary += String.fromCharCode(b)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Create a JWT signed with RS256 for Google APIs */
async function createJWT(sa: ServiceAccountKey): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/drive',
        aud: sa.token_uri,
        iat: now,
        exp: now + 3600,
    }

    const headerB64 = base64url(JSON.stringify(header))
    const payloadB64 = base64url(JSON.stringify(payload))
    const unsigned = `${headerB64}.${payloadB64}`

    // Import the RSA private key
    const pemBody = sa.private_key
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '')
    const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

    const key = await crypto.subtle.importKey(
        'pkcs8',
        keyBytes.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const sig = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(unsigned)
    )

    return `${unsigned}.${base64url(new Uint8Array(sig))}`
}

/** Obtain an access token from Google OAuth2 */
async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
    const jwt = await createJWT(sa)
    const res = await fetch(sa.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Google OAuth error: ${txt}`)
    }
    const data = await res.json()
    return data.access_token
}

/** Create a folder in Google Drive */
async function createDriveFolder(token: string, name: string, parentId: string) {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        }),
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Drive create folder error: ${txt}`)
    }
    return await res.json()
}

/** Share a Drive folder with an email (reader) */
async function shareDriveFolder(token: string, folderId: string, email: string) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'user',
                role: 'reader',
                emailAddress: email,
            }),
        }
    )
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Drive share error: ${txt}`)
    }
    return await res.json()
}

/** Enable "anyone with link" for a Drive folder */
async function enablePublicLink(token: string, folderId: string) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'anyone',
                role: 'reader',
            }),
        }
    )
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Drive public link error: ${txt}`)
    }
    return await res.json()
}

/** Delete a Drive file/folder */
async function deleteDriveFolder(token: string, folderId: string) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}`,
        {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        }
    )
    if (!res.ok && res.status !== 404) {
        const txt = await res.text()
        throw new Error(`Drive delete error: ${txt}`)
    }
}

// ─── Main handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const pathParts = url.pathname.split('/')
        const lastSegment = pathParts[pathParts.length - 1]

        // ═══════════════════════════════════════════════════════════════
        // GET /consultar?code=XXXX  — Public endpoint (no auth needed)
        // ═══════════════════════════════════════════════════════════════
        if (req.method === 'GET' && lastSegment === 'consultar') {
            const code = url.searchParams.get('code')
            if (!code) {
                return new Response(
                    JSON.stringify({ error: 'Parâmetro "code" é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
                { auth: { autoRefreshToken: false, persistSession: false } }
            )

            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('protocol_code, type, display_name, status, delivery_link_enabled, drive_folder_url, created_at, updated_at')
                .eq('protocol_code', code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const publicData = {
                ...protocol,
                drive_folder_url: protocol.delivery_link_enabled ? protocol.drive_folder_url : null,
            }

            console.log(`🔍 [drive-manager] consulta pública: ${code} → ${protocol.status}`)

            return new Response(
                JSON.stringify({ success: true, protocol: publicData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ─── POST actions (require JSON body) ───────────────────────
        const { action, protocol_code, display_name, type, customer_email, pedido_id } =
            await req.json()

        console.log(`📁 [drive-manager] action=${action} protocol=${protocol_code}`)

        // Supabase admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Parse Google Service Account
        const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if (!saJson) {
            return new Response(
                JSON.stringify({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON secret não configurado' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        const sa: ServiceAccountKey = JSON.parse(saJson)

        // ═══════════════════════════════════════════════════════════════
        // ACTION: CREATE_FOLDER
        // ═══════════════════════════════════════════════════════════════
        if (action === 'CREATE_FOLDER') {
            if (!display_name || !type) {
                return new Response(
                    JSON.stringify({ error: 'display_name e type são obrigatórios' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Generate protocol code via DB function
            const { data: codeData, error: codeError } = await supabaseAdmin.rpc(
                'generate_protocol_code',
                { p_type: type }
            )
            if (codeError) throw new Error(`Erro ao gerar código: ${codeError.message}`)

            const newCode = codeData as string
            const today = new Date().toISOString().split('T')[0]
            const folderName = `[${type}] - ${newCode} - ${display_name} - ${today}`

            // Create folder in Google Drive
            const token = await getAccessToken(sa)
            const folder = await createDriveFolder(token, folderName, ROOT_FOLDER_ID)
            const folderUrl = `https://drive.google.com/drive/folders/${folder.id}`

            console.log(`✅ Pasta criada: ${folderName} (${folder.id})`)

            // Insert protocol in database
            const { data: protocolData, error: protocolError } = await supabaseAdmin
                .from('protocols')
                .insert({
                    protocol_code: newCode,
                    type,
                    display_name,
                    customer_email: customer_email || null,
                    status: 'DRAFT',
                    drive_folder_id: folder.id,
                    drive_folder_url: folderUrl,
                    delivery_link_enabled: false,
                    pedido_id: pedido_id || null,
                })
                .select()
                .single()

            if (protocolError) throw new Error(`Erro ao salvar protocolo: ${protocolError.message}`)

            // Log action
            await supabaseAdmin.from('drive_actions').insert({
                protocol_code: newCode,
                action: 'CREATE_FOLDER',
                success: true,
                payload_json: { folder_id: folder.id, folder_name: folderName },
            })

            return new Response(
                JSON.stringify({ success: true, protocol: protocolData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ═══════════════════════════════════════════════════════════════
        // ACTION: ENABLE_DELIVERY
        // ═══════════════════════════════════════════════════════════════
        if (action === 'ENABLE_DELIVERY') {
            if (!protocol_code) {
                return new Response(
                    JSON.stringify({ error: 'protocol_code é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Fetch protocol
            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('*')
                .eq('protocol_code', protocol_code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            if (!protocol.drive_folder_id) {
                return new Response(
                    JSON.stringify({ error: 'Pasta do Drive não existe para este protocolo' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const token = await getAccessToken(sa)

            // Enable public link
            await enablePublicLink(token, protocol.drive_folder_id)

            // Share with customer email if available
            if (protocol.customer_email) {
                try {
                    await shareDriveFolder(token, protocol.drive_folder_id, protocol.customer_email)
                    await supabaseAdmin.from('drive_actions').insert({
                        protocol_code,
                        action: 'SHARE_EMAIL',
                        success: true,
                        payload_json: { email: protocol.customer_email },
                    })
                } catch (shareErr) {
                    console.warn('⚠️ Erro ao compartilhar por email:', shareErr)
                }
            }

            // Update protocol
            const { error: updateErr } = await supabaseAdmin
                .from('protocols')
                .update({
                    delivery_link_enabled: true,
                    status: 'READY_FOR_PICKUP',
                })
                .eq('protocol_code', protocol_code)

            if (updateErr) throw new Error(`Erro ao atualizar protocolo: ${updateErr.message}`)

            // Log action
            await supabaseAdmin.from('drive_actions').insert({
                protocol_code,
                action: 'ENABLE_DELIVERY',
                success: true,
                payload_json: { folder_id: protocol.drive_folder_id },
            })

            console.log(`✅ Entrega habilitada para ${protocol_code}`)

            return new Response(
                JSON.stringify({ success: true, message: 'Entrega habilitada com sucesso' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ═══════════════════════════════════════════════════════════════
        // ACTION: DELETE_FOLDER
        // ═══════════════════════════════════════════════════════════════
        if (action === 'DELETE_FOLDER') {
            if (!protocol_code) {
                return new Response(
                    JSON.stringify({ error: 'protocol_code é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('*')
                .eq('protocol_code', protocol_code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Delete from Drive if folder exists
            if (protocol.drive_folder_id) {
                const token = await getAccessToken(sa)
                await deleteDriveFolder(token, protocol.drive_folder_id)
                console.log(`🗑️ Pasta removida do Drive: ${protocol.drive_folder_id}`)
            }

            // Clean up database fields
            const { error: updateErr } = await supabaseAdmin
                .from('protocols')
                .update({
                    drive_folder_id: null,
                    drive_folder_url: null,
                    delivery_link_enabled: false,
                    status: 'CANCELED',
                })
                .eq('protocol_code', protocol_code)

            if (updateErr) throw new Error(`Erro ao atualizar protocolo: ${updateErr.message}`)

            // Log action
            await supabaseAdmin.from('drive_actions').insert({
                protocol_code,
                action: 'DELETE_FOLDER',
                success: true,
                payload_json: { folder_id: protocol.drive_folder_id },
            })

            return new Response(
                JSON.stringify({ success: true, message: 'Pasta removida e protocolo cancelado' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ═══════════════════════════════════════════════════════════════
        // ACTION: GET_PUBLIC
        // ═══════════════════════════════════════════════════════════════
        if (action === 'GET_PUBLIC') {
            if (!protocol_code) {
                return new Response(
                    JSON.stringify({ error: 'protocol_code é obrigatório' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { data: protocol, error: fetchErr } = await supabaseAdmin
                .from('protocols')
                .select('protocol_code, type, display_name, status, delivery_link_enabled, drive_folder_url, created_at, updated_at')
                .eq('protocol_code', protocol_code)
                .single()

            if (fetchErr || !protocol) {
                return new Response(
                    JSON.stringify({ error: 'Protocolo não encontrado' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Only return drive_folder_url if delivery is enabled
            const publicData = {
                ...protocol,
                drive_folder_url: protocol.delivery_link_enabled ? protocol.drive_folder_url : null,
            }

            return new Response(
                JSON.stringify({ success: true, protocol: publicData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ error: `Ação desconhecida: ${action}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('❌ Erro:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Erro interno' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
