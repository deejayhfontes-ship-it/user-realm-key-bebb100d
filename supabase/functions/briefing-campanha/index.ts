// ============================================================
// briefing-campanha — recebe o briefing público de campanha,
// cria uma pasta no Google Drive, sobe os anexos e salva no banco.
//
// Pública (verify_jwt = false): quem preenche é o cliente, sem login.
// A chave do Google fica no secret GOOGLE_SERVICE_ACCOUNT_JSON — nunca no browser.
//
// Ações:
//   SUBMIT  { respostas, nome, cidade, cargo }  → cria pasta + salva briefing
//   UPLOAD  { folder_id, name, mime, base64 }   → sobe 1 arquivo na pasta
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mesma pasta raiz usada pela drive-manager
const ROOT_FOLDER_ID = '1QBQoRBOoNchYglG2wUwpqsqR8LcWMuao'

interface ServiceAccountKey {
    client_email: string
    private_key: string
    token_uri: string
}

function base64url(input: Uint8Array | string): string {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
    let binary = ''
    for (const b of bytes) binary += String.fromCharCode(b)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

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
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`
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
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
    return `${unsigned}.${base64url(new Uint8Array(sig))}`
}

async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
    const jwt = await createJWT(sa)
    const res = await fetch(sa.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    })
    if (!res.ok) throw new Error(`Google token: ${res.status} ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    return data.access_token as string
}

async function createFolder(token: string, name: string, parent: string) {
    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parent],
        }),
    })
    if (!res.ok) throw new Error(`Drive createFolder: ${res.status} ${(await res.text()).slice(0, 300)}`)
    return await res.json()
}

/** Upload multipart: metadados + conteúdo numa requisição só. */
async function uploadFile(token: string, folderId: string, name: string, mime: string, base64: string) {
    const boundary = 'briefing' + crypto.randomUUID().replace(/-/g, '')
    const meta = JSON.stringify({ name, parents: [folderId] })
    const head =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
        `--${boundary}\r\nContent-Type: ${mime || 'application/octet-stream'}\r\nContent-Transfer-Encoding: base64\r\n\r\n`
    const tail = `\r\n--${boundary}--`
    const body = head + base64 + tail

    const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body,
        }
    )
    if (!res.ok) throw new Error(`Drive upload: ${res.status} ${(await res.text()).slice(0, 300)}`)
    return await res.json()
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    try {
        const body = await req.json()
        const action = body.action || 'SUBMIT'

        const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if (!saJson) {
            return new Response(
                JSON.stringify({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON não configurado' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        const sa: ServiceAccountKey = JSON.parse(saJson)

        // ── UPLOAD: um arquivo por requisição (evita estourar o limite de body) ──
        //
        // Os arquivos vão para o Storage do Supabase, não para o Drive: uma service
        // account do Google não tem cota de armazenamento própria, então ela cria
        // pastas mas não consegue subir arquivos numa conta Gmail comum
        // ("Service Accounts do not have storage quota"). Isso só mudaria com
        // Google Workspace (Drive compartilhado) ou com OAuth da conta do usuário.
        if (action === 'UPLOAD') {
            const { briefing_id, name, mime, base64 } = body
            if (!briefing_id || !name || !base64) {
                return new Response(
                    JSON.stringify({ error: 'briefing_id, name e base64 são obrigatórios' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            // Garante o bucket (privado) na primeira execução
            const { data: buckets } = await supabaseAdmin.storage.listBuckets()
            if (!buckets?.some((b) => b.name === 'briefings')) {
                await supabaseAdmin.storage.createBucket('briefings', { public: false })
                console.log('🪣 bucket "briefings" criado')
            }

            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
            const limpo = name.replace(/[^\w.\-]+/g, '_')
            const path = `${briefing_id}/${Date.now()}_${limpo}`

            const { error: upErr } = await supabaseAdmin.storage
                .from('briefings')
                .upload(path, bytes, { contentType: mime || 'application/octet-stream', upsert: false })
            if (upErr) throw new Error(`Storage: ${upErr.message}`)

            // Link temporário de 1 ano para abrir direto do painel
            const { data: signed } = await supabaseAdmin.storage
                .from('briefings')
                .createSignedUrl(path, 60 * 60 * 24 * 365)

            // Anexa o arquivo à lista de anexos do briefing
            const { data: atual } = await supabaseAdmin
                .from('briefings')
                .select('respostas')
                .eq('id', briefing_id)
                .single()
            const respostasAtuais = (atual?.respostas as Record<string, unknown>) || {}
            const anexos = Array.isArray(respostasAtuais.anexos) ? respostasAtuais.anexos : []
            anexos.push({ nome: name, tamanho: bytes.length, path, url: signed?.signedUrl ?? null })
            await supabaseAdmin
                .from('briefings')
                .update({ respostas: { ...respostasAtuais, anexos } })
                .eq('id', briefing_id)

            console.log(`📎 upload ok: ${name} (${bytes.length} bytes) → ${path}`)
            return new Response(
                JSON.stringify({ success: true, file: { nome: name, path, url: signed?.signedUrl ?? null } }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ── SUBMIT: cria a pasta e grava o briefing ──
        const { respostas, nome, cidade, cargo } = body
        if (!respostas || !nome) {
            return new Response(
                JSON.stringify({ error: 'nome e respostas são obrigatórios' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const token = await getAccessToken(sa)
        const hoje = new Date().toISOString().split('T')[0]
        const cliente = respostas.instituicao || 'Briefing de Campanha'
        const folder = await createFolder(token, `[BRIEFING] ${cliente} - ${hoje} - ${nome}`, ROOT_FOLDER_ID)
        const folderUrl = folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`
        console.log(`📁 pasta criada: ${folder.id}`)

        const { data: saved, error: dbError } = await supabaseAdmin
            .from('briefings')
            .insert({
                nome,
                cidade: cidade || respostas.cidade || '—',
                cargo: cargo || respostas.cargo || null,
                respostas: { ...respostas, drive_folder_id: folder.id, drive_folder_url: folderUrl },
            })
            .select()
            .single()

        if (dbError) throw new Error(`Banco: ${dbError.message}`)

        return new Response(
            JSON.stringify({
                success: true,
                briefing_id: saved?.id ?? null,
                folder_id: folder.id,
                folder_url: folderUrl,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('briefing-campanha:', msg)
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
