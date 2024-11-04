import { getCompanyProfile } from "@/lib/supabase";
import type { AstroGlobal } from "astro";

export const prerender = false;
export async function GET({ request }: AstroGlobal) {
  const url = new URL(request.url);
  const uuid = url.searchParams.get("uuid");
  if (!uuid) {
    return new Response(JSON.stringify({ error: "UUID is required" }), {
      status: 400,
    });
  }
  const companyData = await getCompanyProfile(uuid);

  return new Response(JSON.stringify({ companyData }));
}
