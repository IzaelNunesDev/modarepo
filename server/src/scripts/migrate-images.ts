
import fs from 'fs';
import path from 'path';
import { uploadFile } from '../services/storage.service';
import { prisma } from '../lib/prisma';
import { ProductImage } from '@prisma/client';

// ============================================================
// Script de Migração de Imagens Locais -> Oracle Object Storage
// ============================================================

// Adjusted path to point correctly to the public/imgs folder from server/src/scripts
const LOCAL_IMAGES_DIR = path.join(__dirname, '../../../public/imgs');

async function migrateImages() {
    console.log('🚀 Iniciando migração de imagens para Oracle Object Storage...');

    // 1. Listar arquivos locais
    if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
        console.error('❌ Diretório de imagens locais não encontrado:', LOCAL_IMAGES_DIR);
        // List local directory to help debug path
        console.log('Current __dirname:', __dirname);
        return;
    }

    const files = fs.readdirSync(LOCAL_IMAGES_DIR);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    console.log(`📸 Encontradas ${imageFiles.length} imagens locais.`);

    const migrationMap: Record<string, string> = {};

    // 2. Fazer upload de cada imagem
    for (const file of imageFiles) {
        const filePath = path.join(LOCAL_IMAGES_DIR, file);
        const fileBuffer = fs.readFileSync(filePath);

        // Simples detecção de MIME type
        const ext = path.extname(file).toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === '.png') mimeType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        if (ext === '.webp') mimeType = 'image/webp';

        try {
            console.log(`📤 Enviando: ${file}...`);
            const publicUrl = await uploadFile(fileBuffer, file, mimeType);
            console.log(`✅ Sucesso: ${publicUrl}`);

            // Mapeia o caminho relativo antigo (ex: /imgs/foto.jpg) para a nova URL
            migrationMap[`/imgs/${file}`] = publicUrl;
        } catch (error) {
            console.error(`❌ Falha ao enviar ${file}:`, error);
        }
    }

    // 3. Atualizar URLs no Banco de Dados
    console.log('🔄 Atualizando banco de dados...');

    // Buscar todas as imagens de produtos
    const allImages = await prisma.productImage.findMany();
    let updatedCount = 0;

    for (const img of allImages) {
        // Verifica se a URL atual da imagem corresponde a alguma das locais migradas
        // Ex: img.url pode ser "/imgs/foto1.jpg"
        if (migrationMap[img.url]) {
            await prisma.productImage.update({
                where: { id: img.id },
                data: { url: migrationMap[img.url] }
            });
            console.log(`📝 Atualizado ID ${img.id}: ${img.url} -> ${migrationMap[img.url]}`);
            updatedCount++;
        }
    }

    console.log(`🏁 Migração concluída! ${updatedCount} registros atualizados no banco.`);
}

migrateImages()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
