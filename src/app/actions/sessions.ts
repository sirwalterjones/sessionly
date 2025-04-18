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
  // Add new time fields 
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

// Extended schema type that includes the dates array
export type SessionWithDatesFormData = z.infer<typeof sessionFormSchema> & {
  selectedDates: string[]; // Array of date strings in YYYY-MM-DD format
};

// Infer the type from the Zod schema for basic session data
export type SessionFormData = z.infer<typeof sessionFormSchema>;

export async function createSession(formData: SessionWithDatesFormData) {
  const supabase = await createClient();

  // Destructure the selected dates from the form data
  const { selectedDates, ...sessionData } = formData;

  // Validate the session data using the Zod schema
  const validatedData = sessionFormSchema.safeParse(sessionData);

  if (!validatedData.success) {
    console.error("Validation Error:", validatedData.error);
    return { error: "Invalid form data provided.", data: null };
  }

  // Verify at least one date is selected
  if (!selectedDates || selectedDates.length === 0) {
    return { error: "At least one session date must be selected.", data: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Create the main session record first
  const { data: sessionRecord, error: sessionError } = await supabase
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

  if (sessionError) {
    console.error("Supabase Session Insert Error:", sessionError);
    return { error: `Database error: ${sessionError.message}`, data: null };
  }

  // Now create availability records for each selected date
  const availabilityRecords = selectedDates.map(date => ({
    session_id: sessionRecord.id,
    available_date: date,
    start_time: validatedData.data.startTime,
    end_time: validatedData.data.endTime,
  }));

  const { error: availabilityError } = await supabase
    .from("session_availability")
    .insert(availabilityRecords);

  if (availabilityError) {
    console.error("Supabase Availability Insert Error:", availabilityError);
    
    // Attempt to clean up the session record if availability insert fails
    await supabase.from("sessions").delete().eq("id", sessionRecord.id);
    
    return { error: `Failed to create session availability: ${availabilityError.message}`, data: null };
  }

  // Handle image uploads if provided (would be implemented in a separate step)
  // This would likely involve uploading to Supabase Storage and linking to the session

  // Revalidate paths that display session lists or details
  revalidatePath("/dashboard");
  
  console.log("Session created successfully:", sessionRecord);
  return { data: sessionRecord, error: null };
}

// Calculate available time slots for a session based on start time, end time, and duration
export async function calculateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): Promise<string[]> {
  const slots: string[] = [];
  
  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Convert to minutes for easier calculation
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  // Generate slots
  for (let slotStart = startTotalMinutes; slotStart + durationMinutes <= endTotalMinutes; slotStart += durationMinutes) {
    const slotHour = Math.floor(slotStart / 60);
    const slotMinute = slotStart % 60;
    
    // Format: HH:MM
    const formattedHour = slotHour.toString().padStart(2, '0');
    const formattedMinute = slotMinute.toString().padStart(2, '0');
    
    slots.push(`${formattedHour}:${formattedMinute}`);
  }
  
  return slots;
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

  // Get session data with availability join
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      session_availability(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Add a new function to get available dates and times for a session
export async function getSessionAvailability(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_availability")
    .select("*")
    .eq("session_id", sessionId)
    .order("available_date", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
