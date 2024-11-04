export const prerender = false;
import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.ARIA_API_KEY,
  baseURL: "https://api.rhymes.ai/v1",
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { labels, objects } = body;

    // Convert labels array to comma-separated string
    const labelString = Array.isArray(labels)
      ? labels.join(", ")
      : Object.values(labels || {}).join(", ");

    // Convert objects array to comma-separated string
    const objectString = Array.isArray(objects)
      ? objects.join(", ")
      : Object.values(objects || {})
          .map((obj: any) => obj.name || obj)
          .join(", ");

    const prompt = `Based on the following elements detected in an image:
Labels: ${labelString}
Objects: ${objectString}

Please provide exactly one sentence describing what this image likely represents.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
    });

    const description = response.choices[0].message.content
      ?.replace(/<\|im_end\|>/g, "")
      .trim();

    return new Response(
      JSON.stringify({
        description: description || "No description available",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in aria API:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate description",
        details: error instanceof Error ? error.message : String(error),
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
