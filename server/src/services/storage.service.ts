
// ============================================================
// Serviço de Upload (Compatível com S3 / Oracle Object Storage)
// ============================================================
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// Configuração do Cliente S3 (Apontando para Oracle Cloud)
const s3Client = new S3Client({
    region: process.env.ORACLE_REGION || "sa-saopaulo-1", // Ex: sa-saopaulo-1
    endpoint: process.env.ORACLE_ENDPOINT, // URL do Namespace Oracle
    credentials: {
        accessKeyId: process.env.ORACLE_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.ORACLE_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true, // Necessário para alguns serviços compatíveis com S3
});

const BUCKET_NAME = process.env.ORACLE_BUCKET_NAME || "imagens-site";

/**
 * Faz upload de um arquivo para o Object Storage
 * @param fileBuffer Buffer do arquivo
 * @param fileName Nome original do arquivo (opcional)
 * @param mimeType Tipo MIME (ex: image/jpeg)
 * @returns URL pública do arquivo
 */
export async function uploadFile(
    fileBuffer: Buffer,
    fileName: string = "upload.jpg",
    mimeType: string = "image/jpeg"
): Promise<string> {
    try {
        const fileExtension = fileName.split(".").pop();
        const uniqueKey = `${uuidv4()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueKey,
            Body: fileBuffer,
            ContentType: mimeType,
            ACL: "public-read", // Torna público se o bucket suportar
        });

        await s3Client.send(command);

        // Monta a URL pública (ajuste conforme seu padrão de URL da Oracle)
        // Padrão Oracle: https://objectstorage.{region}.oraclecloud.com/n/{namespace}/b/{bucket}/o/{object}
        // Mas se o endpoint for customizado, pode variar.
        // Vamos usar uma construção genérica baseada no endpoint se possível.

        // Se endpoint termina com .com, assumimos que é a base.
        const endpoint = process.env.ORACLE_ENDPOINT?.replace(/\/+$/, "");
        return `${endpoint}/${BUCKET_NAME}/${uniqueKey}`;

    } catch (error) {
        console.error("❌ Erro no upload para Oracle Object Storage:", error);
        throw new Error("Falha no upload de imagem");
    }
}
