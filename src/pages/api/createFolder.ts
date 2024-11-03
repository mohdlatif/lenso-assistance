export const prerender = false;
import { Storage } from "@google-cloud/storage";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, request }) => {
  const userId = locals.auth().userId;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const bucketName = import.meta.env.GOOGLE_CLOUD_BUCKET_NAME;
  const credentials = JSON.parse(import.meta.env.GOOGLE_CLOUD_STORAGE_KEY_FILE);
  const storage = new Storage({
    credentials,
    projectId: credentials.project_id,
  });

  try {
    const { folderName } = await request.json();
    const bucket = storage.bucket(bucketName);

    // Create an empty file to represent the folder
    const folderFile = bucket.file(`${userId}/${folderName}/.folder`);
    await folderFile.save("");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create folder" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
