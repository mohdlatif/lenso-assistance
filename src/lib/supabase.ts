import { supabase } from "@/lib/dbConnect";

async function getOrCreateUser(email: string) {
  if (!email) {
    throw new Error("Email is required");
  }

  try {
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found, not an error
      throw fetchError;
    }

    if (user) {
      // User exists, return their ID
      return user.id;
    }

    // User doesn't exist, create a new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ email })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    // Return the ID of the newly created user
    return newUser.id;
  } catch (error) {
    console.error(
      "Error in getOrCreateUser:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function upsertCompanyProfile(companyData: any) {
  try {
    // Extract and clean up data
    const {
      company_name,
      website_url,
      logo_url,
      industry,
      company_size,
      tone_of_voice,
      primary_language,
      target_audience,
      key_products_services,
      content_topics,
      uuid,
    } = companyData;

    // Prepare data for upsert
    const profileData = {
      company_name,
      company_size,
      content_topics,
      industry,
      key_products_services,
      logo_url,
      primary_language,
      target_audience,
      tone_of_voice,
      user_id: uuid,
      website_url,
    };

    // Upsert data into the company_profiles table

    const { data, error } = await supabase
      .from("company_profiles") //@ts-ignore
      .upsert(profileData, { onConflict: ["user_id"] });

    if (error) {
      console.error("Error upserting company profile:", error);

      return { error };
    }

    return { data };
  } catch (err) {
    console.error("Unexpected error:", err);

    return { error: err };
  }
}

async function getCompanyProfile(userId: string) {
  try {
    // Query to get company data by user_id
    const { data, error } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", userId)
      .single(); // Get a single record

    if (error) {
      console.error("Error fetching company profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
}

export { getOrCreateUser, upsertCompanyProfile, getCompanyProfile };
