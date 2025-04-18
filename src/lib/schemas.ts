import * as z from "zod";

// Define Zod schema matching the form
export const sessionFormSchema = z.object({
  name: z.string().min(2, { message: "Session name must be at least 2 characters." }),
  description: z.string().optional(),
  duration: z.coerce.number().int({ message: "Duration must be a whole number." }).positive({ message: "Duration must be positive." }),
  price: z.coerce.number().positive({ message: "Price must be positive." }),
  deposit: z.coerce.number().nonnegative({ message: "Deposit cannot be negative." }).optional(),
  depositRequired: z.boolean().default(false),
  locationName: z.string().optional(),
  address: z.string().optional(),
  locationNotes: z.string().optional(),
  startTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, { message: "Invalid time format (HH:MM)." }),
  endTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, { message: "Invalid time format (HH:MM)." }),
  numberOfSpots: z.coerce.number().int().positive().default(1),
  gapBetweenSlots: z.coerce.number().int().nonnegative().default(0),
  sameStartTime: z.boolean().default(false),
}).refine(data => {
  // Validate that endTime is after startTime
  if (data.startTime && data.endTime) {
    const start = new Date(`1970-01-01T${data.startTime}:00`);
    const end = new Date(`1970-01-01T${data.endTime}:00`);
    return end > start;
  }
  return true;
}, {
  message: "End time must be after start time.",
  path: ["endTime"],
}).refine(data => {
  // Validate that there's enough time for all spots with gaps
  if (data.startTime && data.endTime && data.duration && data.numberOfSpots && data.gapBetweenSlots) {
    const start = new Date(`1970-01-01T${data.startTime}:00`);
    const end = new Date(`1970-01-01T${data.endTime}:00`);
    const totalMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
    const requiredMinutes = (data.duration * data.numberOfSpots) + (data.gapBetweenSlots * (data.numberOfSpots - 1));
    return totalMinutes >= requiredMinutes;
  }
  return true;
}, {
  message: "Not enough time for all spots with specified duration and gaps.",
  path: ["numberOfSpots"],
});

// Extended schema type that includes the dates array
export type SessionWithDatesFormData = z.infer<typeof sessionFormSchema> & {
  selectedDates: string[]; // Array of date strings in YYYY-MM-DD format
};

// Infer the type from the Zod schema for basic session data
export type SessionFormData = z.infer<typeof sessionFormSchema>; 