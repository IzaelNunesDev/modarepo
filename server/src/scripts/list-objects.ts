
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from server/.env
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

async function listFiles() {
    console.log(`Listing files in bucket: ${BUCKET_NAME}`);
    console.log(`Endpoint: ${process.env.ORACLE_ENDPOINT}`);

    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            MaxKeys: 10
        });

        const response = await s3Client.send(command);

        if (response.Contents) {
            console.log("Files found:");
            response.Contents.forEach((file) => {
                console.log(` - Key: ${file.Key}, Size: ${file.Size}`);
            });
        } else {
            console.log("No files found.");
        }
    } catch (error) {
        console.error("Error listing files:", error);
    }
}

listFiles();
