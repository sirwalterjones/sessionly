"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";

export type SessionFormData = {
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  locationDetails?: string;
  startDate?: string;
  endDate?: string;
  timeSlots?: { start: string; end: string }[];
  images?: string[];
  attachments?: string[];
  published: boolean;
};

export async function createSession(formData: SessionFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        location: formData.location,
        location_details: formData.locationDetails,
        start_date: formData.startDate,
        end_date: formData.endDate,
        time_slots: formData.timeSlots,
        images: formData.images,
        attachments: formData.attachments,
        published: formData.published,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard");

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
