import { Storage } from "@google-cloud/storage";
import type { APIRoute } from "astro";
import { Readable } from "stream";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "application/pdf",
];

// Initialize storage with credentials from env
const credentials = JSON.parse(import.meta.env.GOOGLE_CLOUD_STORAGE_KEY_FILE);
const storage = new Storage({
  credentials,
  projectId: credentials.project_id,
});

const bucketName = import.meta.env.GOOGLE_CLOUD_BUCKET_NAME;

// Helper function to handle file upload
const uploadFile = async (
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: contentType,
        cacheControl: "public, max-age=31536000",
      },
    });

    blobStream
      .on("error", (error) => {
        reject(error);
      })
      .on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
        resolve(publicUrl);
      });

    // Create a readable stream from the buffer and pipe it to the blob stream
    const readable = new Readable();
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(buffer);
    readable.push(null);

    readable.pipe(blobStream);
  });
};

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;
    const folder = data.get("folder") as string;

    // Validation
    if (!file) {
      return new Response(JSON.stringify({ message: "No file provided" }), {
        status: 400,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ message: "File size exceeds limit" }),
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ message: "File type not allowed" }),
        { status: 400 }
      );
    }

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "_");
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;
    const filePath = `${sanitizedFolder}/${safeFileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file using our helper function
    const url = await uploadFile(buffer, filePath, file.type);

    return new Response(
      JSON.stringify({
        url,
        path: filePath,
        size: file.size,
        type: file.type,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
