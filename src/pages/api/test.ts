export const prerender = false;
import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.ARIA_API_KEY,
  baseURL: "https://api.rhymes.ai/v1",
});

async function generateQuery(promptText: string) {
  const response = await openai.chat.completions.create({
    model: "aria",
    messages: [
      { role: "system", content: "You are a SQL query generator." },
      { role: "user", content: promptText },
    ],
    max_tokens: 100,
  });

  return response.choices[0].message.content;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const data = await generateQuery(
      "Generate a SQL query to select all columns from appointments where department is 'Cardiology'."
    );

    return new Response(JSON.stringify({ data }), {
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
