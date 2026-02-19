
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

const BUCKET_NAME = process.env.ORACLE_BUCKET_NAME || "imagens-site";
const REGION = process.env.ORACLE_REGION || "sa-saopaulo-1";
const NAMESPACE = process.env.ORACLE_NAMESPACE;

if (!NAMESPACE) {
    console.error("ORACLE_NAMESPACE is not defined in .env");
    process.exit(1);
}

const OLD_DOMAIN = `${NAMESPACE}.compat.objectstorage.${REGION}.oraclecloud.com`;
const NEW_BASE_URL = `https://objectstorage.${REGION}.oraclecloud.com/n/${NAMESPACE}/b/${BUCKET_NAME}/o`;

async function main() {
    console.log("Starting URL migration...");

    // Get all product images
    const images = await prisma.productImage.findMany();
    console.log(`Found ${images.length} images.`);

    let updatedCount = 0;

    for (const img of images) {
        if (img.url.includes(OLD_DOMAIN)) {
            // Extract the key (filename) from the old URL
            // Old URL format: https://.../bucket/key
            const parts = img.url.split('/');
            const key = parts[parts.length - 1];

            const newUrl = `${NEW_BASE_URL}/${key}`;

            await prisma.productImage.update({
                where: { id: img.id },
                data: { url: newUrl }
            });
            updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} images to Native OCI format.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
