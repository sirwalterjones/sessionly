export interface Session {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  deposit: number | null;
  deposit_required: boolean;
  location_name: string | null;
  address: string | null;
  location_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  session_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  session_id: string;
  time_slot_id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  notes: string | null;
  status: string;
  deposit_paid: boolean;
  payment_status: string;
  total_paid: number;
  created_at: string;
  updated_at: string;
}

export interface SessionImage {
  id: string;
  session_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}
