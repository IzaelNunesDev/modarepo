import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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
const TEST_KEY = "ccffaa66-e4a8-4cc4-a106-127120b9f929.jpg"; // Use one from the list

async function checkUrl() {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: TEST_KEY,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log("Presigned URL (expires in 1h):");
        console.log(url);
    } catch (error) {
        console.error("Error generating URL:", error);
    }
}

checkUrl();
