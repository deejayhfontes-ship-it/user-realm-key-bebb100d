/**
 * sync-to-github.js
 * Script para sincronizar arquivos locais com o repositório GitHub
 * Uso: node sync-to-github.js [--token SEU_TOKEN] [--dry-run]
 * 
 * Variáveis de ambiente:
 *   GITHUB_TOKEN — Token de acesso ao GitHub
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO = 'deejayhfontes-ship-it/user-realm-key-bebb100d';

// Pastas/arquivos a ignorar
const IGNORE = [
    'node_modules', '.git', 'dist', '.env', '.env.local',
    'fix-blob.js', 'fix-missing.ps1', 'rebuild-tree.ps1',
    'upload-missing.ps1', 'error-422.json', 'sync-to-github.js'
];

// Extensões a ignorar
const IGNORE_EXT = ['.exe', '.zip', '.rar', '.7z', '.dmg', '.pkg'];

function getToken() {
    const args = process.argv;
    const idx = args.indexOf('--token');
    if (idx !== -1 && args[idx + 1]) return args[idx + 1];
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
    console.error('❌ Token não fornecido. Use: node sync-to-github.js --token SEU_TOKEN');
    process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run');
const TOKEN = getToken();

function api(method, endpoint, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${REPO}${endpoint}`,
            method,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'sync-script'
            }
        };
        if (data) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    reject(new Error(`${res.statusCode}: ${body.substring(0, 300)}`));
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function getAllFiles(dir, baseDir = dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir)) {
        if (IGNORE.includes(entry)) continue;
        const fullPath = path.join(dir, entry);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results.push(...getAllFiles(fullPath, baseDir));
        } else {
            if (IGNORE_EXT.includes(path.extname(entry).toLowerCase())) continue;
            results.push({ fullPath, relPath, size: stat.size });
        }
    }
    return results;
}

async function main() {
    console.log('🔄 Sincronizando com GitHub...\n');

    // 1. Obter tree atual do GitHub
    console.log('📥 Obtendo tree do GitHub...');
    const ref = await api('GET', '/git/refs/heads/main');
    const commit = await api('GET', `/git/commits/${ref.object.sha}`);
    const tree = await api('GET', `/git/trees/${commit.tree.sha}?recursive=1`);
    const remoteFiles = new Set(tree.tree.filter(t => t.type === 'blob').map(t => t.path));
    console.log(`   ${remoteFiles.size} arquivos no GitHub\n`);

    // 2. Obter arquivos locais
    const localFiles = getAllFiles('.');
    console.log(`📁 ${localFiles.length} arquivos locais\n`);

    // 3. Encontrar arquivos faltantes
    const missing = localFiles.filter(f => !remoteFiles.has(f.relPath));
    // 4. Encontrar arquivos modificados (por tamanho)
    const modified = localFiles.filter(f => {
        const remote = tree.tree.find(t => t.path === f.relPath);
        return remote && remote.size !== f.size;
    });

    const toUpload = [...missing, ...modified];

    if (toUpload.length === 0) {
        console.log('✅ Tudo sincronizado! Nenhum arquivo para enviar.');
        return;
    }

    console.log(`📤 ${missing.length} arquivos faltantes, ${modified.length} modificados:\n`);
    for (const f of toUpload) {
        const status = missing.includes(f) ? '🆕' : '📝';
        console.log(`   ${status} ${f.relPath} (${(f.size / 1024).toFixed(1)} KB)`);
    }

    if (isDryRun) {
        console.log('\n🔍 Modo dry-run — nenhum arquivo enviado.');
        return;
    }

    // 5. Criar blobs
    console.log('\n📤 Enviando arquivos...');
    const treeEntries = [];
    let errors = 0;

    for (const f of toUpload) {
        try {
            const content = fs.readFileSync(f.fullPath);
            const b64 = content.toString('base64');
            const blob = await api('POST', '/git/blobs', { content: b64, encoding: 'base64' });
            treeEntries.push({
                path: f.relPath,
                mode: '100644',
                type: 'blob',
                sha: blob.sha
            });
            console.log(`   ✅ ${f.relPath}`);
        } catch (err) {
            errors++;
            console.log(`   ❌ ${f.relPath}: ${err.message.substring(0, 100)}`);
            if (err.message.includes('Secret detected')) {
                console.log(`      ⚠️  DICA: Este arquivo contém um secret/token. Mova para variável de ambiente!`);
            }
        }
    }

    if (treeEntries.length === 0) {
        console.log('\n❌ Nenhum arquivo pôde ser enviado.');
        return;
    }

    // 6. Criar tree
    console.log('\n🌳 Criando tree...');
    const newTree = await api('POST', '/git/trees', {
        base_tree: commit.tree.sha,
        tree: treeEntries
    });

    // 7. Criar commit
    const msg = treeEntries.length === 1
        ? `fix: sync ${treeEntries[0].path}`
        : `fix: sync ${treeEntries.length} arquivos`;

    console.log(`📝 Commit: ${msg}`);
    const newCommit = await api('POST', '/git/commits', {
        message: msg,
        tree: newTree.sha,
        parents: [ref.object.sha]
    });

    // 8. Atualizar ref
    await api('PATCH', '/git/refs/heads/main', { sha: newCommit.sha });
    console.log(`\n🎉 Pronto! ${treeEntries.length} arquivo(s) enviado(s).`);
    if (errors > 0) console.log(`⚠️  ${errors} arquivo(s) com erro (verifique secrets/tokens).`);
    console.log(`\n🔗 Vercel fará deploy automaticamente em ~1 min.`);
    console.log(`   https://vercel.com/deejayhfontes-ship-its-projects/user-realm-key-bebb100d/deployments`);
}

main().catch(e => {
    console.error('\n❌ Erro fatal:', e.message);
    process.exit(1);
});
