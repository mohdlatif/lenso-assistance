export const prerender = false;
import { Storage } from "@google-cloud/storage";
import type { APIRoute } from "astro";

const credentials = JSON.parse(import.meta.env.GOOGLE_CLOUD_STORAGE_KEY_FILE);
const storage = new Storage({
  credentials,
  projectId: credentials.project_id,
});

const bucketName = import.meta.env.GOOGLE_CLOUD_BUCKET_NAME;

export const GET: APIRoute = async ({ locals }) => {
  const userId = locals.auth().userId;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: `${userId}/`,
    });

    const folders = new Set<string>();
    const fileItems = files.map((file) => {
      const parts = file.name.split("/");
      const folderName = parts[1]; // Assuming the structure is userId/folderName/fileName
      const fileName = parts[2];

      if (folderName) {
        folders.add(folderName);
      }

      return {
        name: fileName,
        url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
        type: file.metadata.contentType,
        folderId: folderName,
      };
    });

    return new Response(
      JSON.stringify({
        folders: Array.from(folders),
        files: fileItems,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch files" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
