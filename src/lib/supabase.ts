import { supabase } from "@/lib/dbConnect";

import { useStore } from "@nanostores/react";
import { $userStore } from "@clerk/astro/client";

async function getOrCreateUser(email: string) {
  if (!email) {
    throw new Error("Email is required");
  }
  const user = useStore($userStore);
  const emailAddress = user?.emailAddresses[0].emailAddress;

  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingUser) {
      return existingUser.id;
    }

    // User doesn't exist, create a new user with emailAddress
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email: emailAddress || email, // Use emailAddress if available, fallback to email
        id: user?.id, // Use Clerk user ID
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return newUser.id;
  } catch (error) {
    console.error(
      "Error in getOrCreateUser:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function saveFileData({
  userId,
  fileName,
  fileUrl,
  labels,
  ariaDescription,
}: {
  userId: string;
  fileName: string;
  fileUrl: string;
  labels: string[];
  ariaDescription: string;
}) {
  try {
    const { data, error } = await supabase.from("data").insert({
      user_id: userId,
      file_name: fileName,
      file_url: fileUrl,
      labels: labels.join(", "), // Convert array to comma-separated string
      analyze: ariaDescription,
    });

    if (error) {
      console.error("Error saving file data:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error saving file data:", error);
    throw error;
  }
}

export { getOrCreateUser, saveFileData };
