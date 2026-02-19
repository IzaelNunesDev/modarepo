
import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";
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
const TEST_KEY = "ccffaa66-e4a8-4cc4-a106-127120b9f929.jpg";

async function setAcl() {
    try {
        console.log(`Setting public-read ACL for ${TEST_KEY}...`);
        const command = new PutObjectAclCommand({
            Bucket: BUCKET_NAME,
            Key: TEST_KEY,
            ACL: "public-read",
        });

        await s3Client.send(command);
        console.log("ACL set successfully!");
    } catch (error) {
        console.error("Error setting ACL:", error);
    }
}

setAcl();
