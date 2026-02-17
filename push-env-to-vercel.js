/**
 * push-env-to-vercel.js
 * 
 * Lê o arquivo .env local e sobe TODAS as variáveis VITE_* para a Vercel.
 * Se a variável já existe, atualiza o valor.
 * 
 * Uso:
 *   node push-env-to-vercel.js
 * 
 * Configuração (edite abaixo ou use variáveis de ambiente):
 *   VERCEL_TOKEN — Token de acesso da Vercel
 *   VERCEL_PROJECT — Nome do projeto na Vercel
 */
const https = require('https');
const fs = require('fs');

// ===================== CONFIGURAÇÃO =====================
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_NAME = process.env.VERCEL_PROJECT || 'user-realm-key-bebb100d';
// ========================================================

function vercelApi(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.vercel.com',
            path,
            method,
            headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 400) {
                        reject({ status: res.statusCode, body: parsed });
                    } else {
                        resolve(parsed);
                    }
                } catch {
                    reject({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function parseEnvFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        // Remove aspas ao redor
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        vars[key] = value;
    }
    return vars;
}

async function main() {
    console.log('🚀 Push Env → Vercel\n');

    // 1. Ler .env
    if (!fs.existsSync('.env')) {
        console.error('❌ Arquivo .env não encontrado!');
        process.exit(1);
    }
    const envVars = parseEnvFile('.env');
    const keys = Object.keys(envVars);
    console.log(`📁 ${keys.length} variáveis encontradas no .env\n`);

    // 2. Achar o projeto na Vercel
    console.log('🔍 Buscando projeto na Vercel...');
    const projects = await vercelApi('GET', '/v9/projects?limit=50');
    const project = projects.projects.find(p =>
        p.name === PROJECT_NAME ||
        (p.link && p.link.repo === PROJECT_NAME)
    );

    if (!project) {
        console.error(`❌ Projeto "${PROJECT_NAME}" não encontrado na Vercel!`);
        console.log('Projetos disponíveis:');
        projects.projects.forEach(p => console.log(`  - ${p.name}`));
        process.exit(1);
    }
    console.log(`✅ Projeto encontrado: ${project.name} (${project.id})\n`);

    // 3. Obter variáveis existentes
    const existing = await vercelApi('GET', `/v9/projects/${project.id}/env`);
    const existingMap = {};
    if (existing.envs) {
        existing.envs.forEach(e => { existingMap[e.key] = e.id; });
    }

    // 4. Criar/atualizar cada variável
    let created = 0, updated = 0, skipped = 0;

    for (const key of keys) {
        const value = envVars[key];
        const isSecret = key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('key');

        if (existingMap[key]) {
            // Atualizar existente
            try {
                await vercelApi('PATCH', `/v9/projects/${project.id}/env/${existingMap[key]}`, {
                    value,
                    type: isSecret ? 'encrypted' : 'plain',
                    target: ['production', 'preview', 'development']
                });
                console.log(`  📝 ${key} — atualizado`);
                updated++;
            } catch (err) {
                console.log(`  ⚠️  ${key} — erro ao atualizar: ${JSON.stringify(err.body?.error?.message || err)}`);
                skipped++;
            }
        } else {
            // Criar nova
            try {
                await vercelApi('POST', `/v10/projects/${project.id}/env`, {
                    key,
                    value,
                    type: isSecret ? 'encrypted' : 'plain',
                    target: ['production', 'preview', 'development']
                });
                console.log(`  ✅ ${key} — criada`);
                created++;
            } catch (err) {
                if (err.body?.error?.code === 'ENV_ALREADY_EXISTS') {
                    console.log(`  ⏭️  ${key} — já existe`);
                    skipped++;
                } else {
                    console.log(`  ❌ ${key} — erro: ${JSON.stringify(err.body?.error?.message || err)}`);
                    skipped++;
                }
            }
        }
    }

    console.log(`\n📊 Resultado: ${created} criadas, ${updated} atualizadas, ${skipped} puladas`);
    console.log(`\n💡 Para aplicar, faça um redeploy na Vercel ou espere o próximo commit.`);
}

main().catch(e => {
    console.error('\n❌ Erro fatal:', e);
    process.exit(1);
});
