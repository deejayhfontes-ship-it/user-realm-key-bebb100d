<<<<<<< HEAD
/**
 * Script de Migração: Upload das imagens do siteantigo2 para Supabase
 * 
 * Execução: node scripts/migrate-portfolio.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase config (anon key - mesma do client.ts)
const SUPABASE_URL = 'https://nzngwbknezmfthbyfjmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bmd3YmtuZXptZnRoYnlmam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODU5MDIsImV4cCI6MjA4NDc2MTkwMn0.S_2Hr2KEqrEj1nHIot1fBr2U1ihojl_f-owxDhf-iAk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Caminho das imagens do siteantigo2
const IMAGES_DIR = path.resolve(__dirname, '../../siteantigo2/charming-bill-forge-main/src/assets/portfolio');

// Função para formatar nome do arquivo em título legível
function formatTitle(filename) {
    const name = path.parse(filename).name;
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Função para detectar o content type
function getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
    };
    return types[ext] || 'image/jpeg';
}

async function migrate() {
    console.log('🚀 Iniciando migração do portfólio...\n');

    // Verificar se o diretório existe
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ Diretório não encontrado: ${IMAGES_DIR}`);
        process.exit(1);
    }

    // Listar imagens
    const files = fs.readdirSync(IMAGES_DIR)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort();

    console.log(`📁 Encontradas ${files.length} imagens\n`);

    let success = 0;
    let errors = 0;

    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const filePath = path.join(IMAGES_DIR, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const contentType = getContentType(filename);
        const fileSizeKb = Math.round(fileBuffer.length / 1024);
        const title = formatTitle(filename);

        // Nome único no storage
        const storagePath = `artes-flyers/${Date.now()}-${filename}`;

        console.log(`[${i + 1}/${files.length}] Uploading: ${filename} (${fileSizeKb}KB)...`);

        // 1. Upload para Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolio-images')
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            console.error(`  ❌ Erro no upload: ${uploadError.message}`);
            errors++;
            continue;
        }

        // 2. Obter URL pública
        const { data: urlData } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // 3. Inserir na tabela portfolio_cases
        const { error: insertError } = await supabase
            .from('portfolio_cases')
            .insert({
                title,
                client_name: 'Fontes Graphics',
                category: 'Artes/Flyers',
                description: `Flyer de evento - ${title}`,
                thumbnail_url: publicUrl,
                gallery_urls: [publicUrl],
                results: null,
                featured: false,
                order_index: i,
                status: 'published',
                thumbnail_original_name: filename,
                file_size_kb: fileSizeKb,
            });

        if (insertError) {
            console.error(`  ❌ Erro no insert: ${insertError.message}`);
            errors++;
            continue;
        }

        console.log(`  ✅ OK → ${title}`);
        success++;

        // Pequeno delay para não sobrecarregar
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Migrados com sucesso: ${success}`);
    if (errors > 0) console.log(`❌ Erros: ${errors}`);
    console.log(`Total: ${files.length}`);
    console.log('='.repeat(50));
}

migrate().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
});
=======
/**
 * Script de Migração: Upload das imagens do siteantigo2 para Supabase
 * 
 * Execução: node scripts/migrate-portfolio.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase config (anon key - mesma do client.ts)
const SUPABASE_URL = 'https://nzngwbknezmfthbyfjmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bmd3YmtuZXptZnRoYnlmam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODU5MDIsImV4cCI6MjA4NDc2MTkwMn0.S_2Hr2KEqrEj1nHIot1fBr2U1ihojl_f-owxDhf-iAk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Caminho das imagens do siteantigo2
const IMAGES_DIR = path.resolve(__dirname, '../../siteantigo2/charming-bill-forge-main/src/assets/portfolio');

// Função para formatar nome do arquivo em título legível
function formatTitle(filename) {
    const name = path.parse(filename).name;
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Função para detectar o content type
function getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
    };
    return types[ext] || 'image/jpeg';
}

async function migrate() {
    console.log('🚀 Iniciando migração do portfólio...\n');

    // Verificar se o diretório existe
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ Diretório não encontrado: ${IMAGES_DIR}`);
        process.exit(1);
    }

    // Listar imagens
    const files = fs.readdirSync(IMAGES_DIR)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort();

    console.log(`📁 Encontradas ${files.length} imagens\n`);

    let success = 0;
    let errors = 0;

    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const filePath = path.join(IMAGES_DIR, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const contentType = getContentType(filename);
        const fileSizeKb = Math.round(fileBuffer.length / 1024);
        const title = formatTitle(filename);

        // Nome único no storage
        const storagePath = `artes-flyers/${Date.now()}-${filename}`;

        console.log(`[${i + 1}/${files.length}] Uploading: ${filename} (${fileSizeKb}KB)...`);

        // 1. Upload para Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolio-images')
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            console.error(`  ❌ Erro no upload: ${uploadError.message}`);
            errors++;
            continue;
        }

        // 2. Obter URL pública
        const { data: urlData } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // 3. Inserir na tabela portfolio_cases
        const { error: insertError } = await supabase
            .from('portfolio_cases')
            .insert({
                title,
                client_name: 'Fontes Graphics',
                category: 'Artes/Flyers',
                description: `Flyer de evento - ${title}`,
                thumbnail_url: publicUrl,
                gallery_urls: [publicUrl],
                results: null,
                featured: false,
                order_index: i,
                status: 'published',
                thumbnail_original_name: filename,
                file_size_kb: fileSizeKb,
            });

        if (insertError) {
            console.error(`  ❌ Erro no insert: ${insertError.message}`);
            errors++;
            continue;
        }

        console.log(`  ✅ OK → ${title}`);
        success++;

        // Pequeno delay para não sobrecarregar
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Migrados com sucesso: ${success}`);
    if (errors > 0) console.log(`❌ Erros: ${errors}`);
    console.log(`Total: ${files.length}`);
    console.log('='.repeat(50));
}

migrate().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
});
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
