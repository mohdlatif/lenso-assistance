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

    // Initialize Vision client
    const visionClient = new ImageAnnotatorClient({
      credentials: credentials,
    });

    // Perform multiple detection tasks
    const [result] = await visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: "LABEL_DETECTION" },
        { type: "TEXT_DETECTION" },
        { type: "FACE_DETECTION" },
        { type: "OBJECT_LOCALIZATION" },
        { type: "IMAGE_PROPERTIES" },
      ],
    });

    // Process and structure the response
    const response = {
      labels:
        result.labelAnnotations?.map((label) => ({
          description: label.description,
          score: label.score,
        })) || [],
      text: result.fullTextAnnotation?.text || "",
      faces: result.faceAnnotations?.length || 0,
      objects:
        result.localizedObjectAnnotations?.map((obj) => ({
          name: obj.name,
          confidence: obj.score,
        })) || [],
      dominantColors:
        result.imagePropertiesAnnotation?.dominantColors?.colors?.map(
          (color) => ({
            color: color.color,
            score: color.score,
            pixelFraction: color.pixelFraction,
          })
        ) || [],
    };

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
