export const prerender = false;
import { ImageAnnotatorClient } from "@google-cloud/vision";
import type { APIRoute } from "astro";

const credentials = JSON.parse(import.meta.env.GOOGLE_CLOUD_STORAGE_KEY_FILE);

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = locals.auth().userId;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 });
    }

    const visionClient = new ImageAnnotatorClient({
      credentials: credentials,
    });

    const [result] = await visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: "LABEL_DETECTION", maxResults: 3 },
        { type: "TEXT_DETECTION" },
        { type: "OBJECT_LOCALIZATION" },
      ],
    });

    // Get only label descriptions
    const labels = (result.labelAnnotations || []).map(
      (label) => label.description || ""
    );

    const response = {
      labels,
      objects: result.localizedObjectAnnotations?.map((obj) => obj.name) || [],
      text: result.fullTextAnnotation?.text || "",
    };

    console.log("Vision AI response:", response); // Debug log

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Vision AI Error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
