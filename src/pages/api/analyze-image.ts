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
        { type: "LABEL_DETECTION" },
        { type: "TEXT_DETECTION" },
        { type: "FACE_DETECTION" },
        { type: "OBJECT_LOCALIZATION" },
      ],
    });

    // Combine all labels and objects into simplified arrays
    const labelDescriptions =
      result.labelAnnotations?.map((label) => label.description) || [];

    const objectNames =
      result.localizedObjectAnnotations?.map((obj) => obj.name) || [];

    // Create simplified response
    const response = {
      labels: labelDescriptions,
      objects: objectNames,
      text: result.fullTextAnnotation?.text || "",
      faces: result.faceAnnotations?.length || 0,
    };

    console.log("Combined Vision AI results:", {
      labels: labelDescriptions.join(", "),
      objects: objectNames.join(", "),
    });

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
