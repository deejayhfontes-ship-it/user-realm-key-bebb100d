const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'deejayhfontes-ship-it/user-realm-key-bebb100d';

function apiCall(method, endpoint, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${REPO}${endpoint}`,
            method: method,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'node-script',
                'Content-Type': 'application/json',
            }
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    reject(new Error(`${res.statusCode}: ${body}`));
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

async function main() {
    try {
        // Read file
        const filePath = path.resolve(__dirname, 'src/components/prefeitura/FormularioSolicitacao.tsx');
        const content = fs.readFileSync(filePath);
        const b64 = content.toString('base64');
        console.log(`File size: ${content.length} bytes, Base64: ${b64.length} chars`);

        // Create blob
        console.log('Creating blob...');
        const blob = await apiCall('POST', '/git/blobs', {
            content: b64,
            encoding: 'base64'
        });
        console.log(`Blob SHA: ${blob.sha}`);

        // Get current ref
        const ref = await apiCall('GET', '/git/refs/heads/main');
        const parentSha = ref.object.sha;
        console.log(`Parent: ${parentSha}`);

        // Get parent commit
        const parentCommit = await apiCall('GET', `/git/commits/${parentSha}`);

        // Create tree
        console.log('Creating tree...');
        const tree = await apiCall('POST', '/git/trees', {
            base_tree: parentCommit.tree.sha,
            tree: [{
                path: 'src/components/prefeitura/FormularioSolicitacao.tsx',
                mode: '100644',
                type: 'blob',
                sha: blob.sha
            }]
        });
        console.log(`Tree: ${tree.sha}`);

        // Create commit
        console.log('Creating commit...');
        const commit = await apiCall('POST', '/git/commits', {
            message: 'fix: add FormularioSolicitacao.tsx to fix Vercel build',
            tree: tree.sha,
            parents: [parentSha]
        });
        console.log(`Commit: ${commit.sha}`);

        // Update ref
        console.log('Updating ref...');
        await apiCall('PATCH', '/git/refs/heads/main', {
            sha: commit.sha
        });
        console.log('REF UPDATED!');

        // Verify
        console.log('Verifying...');
        const newTree = await apiCall('GET', `/git/trees/${tree.sha}?recursive=1`);
        const found = newTree.tree.find(f => f.path.includes('FormularioSolicitacao'));
        if (found) {
            console.log(`VERIFIED: ${found.path} IS IN TREE!`);
        } else {
            console.log('NOT FOUND IN TREE!');
        }

    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

main();
