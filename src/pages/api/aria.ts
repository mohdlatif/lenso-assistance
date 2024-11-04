export const prerender = false;
import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.ARIA_API_KEY,
  baseURL: "https://api.rhymes.ai/v1",
});
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const description = await generateDescription(data);

    return new Response(JSON.stringify({ description }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate description" }),
      { status: 500 }
    );
  }
};

async function generateDescription(data: any) {
  const labels = Array.isArray(data.labels)
    ? data.labels.join(", ")
    : Object.values(data.labels).join(", ");

  const objects = Array.isArray(data.objects)
    ? data.objects.join(", ")
    : Object.values(data.objects)
        .map((obj: any) => obj.name || obj)
        .join(", ");

  const prompt = `Based on the following elements detected in an image:
Labels: ${labels}
Objects: ${objects}

Please provide exactly one sentences describing what this image likely represents.`;

  const response = await openai.chat.completions.create({
    model: "aria",
    messages: [
      { role: "system", content: "You are an image analyzer." },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 1024,
    top_p: 0,
  });

  const cleanedContent =
    response.choices[0].message?.content?.trim().replace(/<\|im_end\|>/g, "") ||
    "";

  return cleanedContent;
}
