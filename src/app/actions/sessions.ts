"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// Define Zod schema matching the form
export const sessionFormSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  deposit: z.number().nonnegative().optional(),
  depositRequired: z.boolean().default(false),
  locationName: z.string().optional(),
  address: z.string().optional(),
  locationNotes: z.string().optional(),
});

// Infer the type from the Zod schema
export type SessionFormData = z.infer<typeof sessionFormSchema>;

export async function createSession(formData: SessionFormData) {
  const supabase = await createClient();

  // Validate the input data using the Zod schema
  const validatedData = sessionFormSchema.safeParse(formData);

  if (!validatedData.success) {
    console.error("Validation Error:", validatedData.error);
    return { error: "Invalid form data provided.", data: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Use validated data for insertion, mapping form names to DB columns
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        user_id: user.id,
        name: validatedData.data.name,
        description: validatedData.data.description,
        duration: validatedData.data.duration,
        price: validatedData.data.price,
        deposit: validatedData.data.deposit,
        deposit_required: validatedData.data.depositRequired,
        location_name: validatedData.data.locationName,
        address: validatedData.data.address,
        location_notes: validatedData.data.locationNotes,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase Insert Error:", error);
    return { error: `Database error: ${error.message}`, data: null };
  }

  // Revalidate paths that display session lists or details
  revalidatePath("/dashboard"); // Assuming dashboard might show summary
  // Add other relevant paths if needed, e.g., a dedicated "/sessions" page

  console.log("Session created successfully:", data);
  return { data, error: null };
}

export async function getSessionsByUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getSessionById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
