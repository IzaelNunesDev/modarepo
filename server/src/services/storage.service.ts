
// ============================================================
// Serviço de Upload (Compatível com S3 / Oracle Object Storage)
// ============================================================
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

// Configuração do Cliente S3 (Apontando para Oracle Cloud)
const s3Client = new S3Client({
    region: process.env.ORACLE_REGION || "sa-saopaulo-1",
    endpoint: process.env.ORACLE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ORACLE_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.ORACLE_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
});

const BUCKET_NAME = process.env.ORACLE_BUCKET_NAME || "imagens-site";

/**
 * Otimiza a imagem usando sharp e faz upload para o Object Storage
 */
export async function uploadFile(
    fileBuffer: Buffer,
    fileName: string = "upload.jpg"
): Promise<string> {
    try {
        // Otimização com Sharp
        // 1. Redimensionar para no máximo 1080px de largura (mantendo proporção)
        // 2. Converter para WebP para melhor compressão
        // 3. Otimizar qualidade
        const optimizedBuffer = await sharp(fileBuffer)
            .resize({
                width: 1080,
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 80 })
            .toBuffer();

        const uniqueKey = `${uuidv4()}.webp`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueKey,
            Body: optimizedBuffer,
            ContentType: "image/webp",
            ACL: "public-read",
        });

        await s3Client.send(command);

        const region = process.env.ORACLE_REGION || "sa-saopaulo-1";
        const namespace = process.env.ORACLE_NAMESPACE;

        if (!namespace) {
            console.warn("ORACLE_NAMESPACE not set, using S3 compat URL as fallback");
            const endpoint = process.env.ORACLE_ENDPOINT?.replace(/\/+$/, "");
            return `${endpoint}/${BUCKET_NAME}/${uniqueKey}`;
        }

        return `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${BUCKET_NAME}/o/${uniqueKey}`;

    } catch (error) {
        console.error("❌ Erro no processamento/upload de imagem:", error);
        throw new Error("Falha no upload de imagem");
    }
}

/**
 * Remove um arquivo do Object Storage pela sua URL ou Key
 */
export async function deleteFile(fileUrl: string): Promise<void> {
    try {
        // Extrair a key da URL
        // Ex: https://.../o/meu-arquivo.webp -> meu-arquivo.webp
        const parts = fileUrl.split("/o/");
        const key = parts.length > 1 ? parts[parts.length - 1] : fileUrl.split("/").pop();

        if (!key) return;

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`🗑️ [StorageService] Arquivo removido: ${key}`);
    } catch (error) {
        console.error("❌ Erro ao deletar arquivo do Oracle Cloud:", error);
        // Não lançamos erro aqui para não travar o fluxo principal se a deleção falhar
    }
}
