import { Storage } from "@google-cloud/storage";
import type { APIRoute } from "astro";
export const prerender = false;

const storage = new Storage({
  keyFilename: import.meta.env.GOOGLE_CLOUD_STORAGE_KEY_FILE,
  projectId: import.meta.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = import.meta.env.GOOGLE_CLOUD_BUCKET_NAME;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const post = data.get("post");

    const file = data.get("file") as File;
    const folder = data.get("folder") as string;

    if (!post) {
      return new Response(
        JSON.stringify({
          message: "Missing required fields",
        }),
        { status: 400 }
      );
    }
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(`${folder}/${file.name}`);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file
    await blob.save(buffer, {
      contentType: file.type,
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file public and get URL
    await blob.makePublic();
    const url = blob.publicUrl();

    return new Response(
      JSON.stringify({
        url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return new Response(
      JSON.stringify({
        error: "Upload failed",
      }),
      { status: 500 }
    );
  }
};
