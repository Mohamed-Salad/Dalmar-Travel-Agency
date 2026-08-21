export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: { id: string; name: string; email: string; phone: string | null; created_at: string; status: 'pending' | 'approved' };
        // `status` is deliberately not client-settable — it defaults to 'pending' in the
        // database and only an admin flips it, never the signing-up user.
        Insert: { id: string; name: string; email: string; phone?: string | null };
        Update: { name?: string; email?: string; phone?: string | null };
      };
      customers: {
        Row: { id: string; name: string; phone: string; email: string | null; created_at: string };
        Insert: { name: string; phone: string; email?: string | null };
        Update: { name?: string; phone?: string; email?: string | null };
      };
      booking_requests: {
        Row: {
          id: string; customer_id: string; departure_city: string; destination_city: string;
          earliest_departure: string; latest_departure: string;
          earliest_return: string | null; latest_return: string | null;
          notes: string | null; status: 'pending' | 'responded' | 'booked' | 'cancelled';
          claimed_by_agent_id: string | null; created_at: string;
          adults: number; youth: number; children: number; infants: number;
        };
        Insert: {
          customer_id: string; departure_city: string; destination_city: string;
          earliest_departure: string; latest_departure: string;
          earliest_return?: string | null; latest_return?: string | null;
          notes?: string | null;
          adults?: number; youth?: number; children?: number; infants?: number;
        };
        Update: {
          status?: 'pending' | 'responded' | 'booked' | 'cancelled';
          claimed_by_agent_id?: string | null;
        };
      };
      fare_options: {
        Row: {
          id: string; booking_request_id: string; departure_date: string;
          return_date: string | null; price: number; airline: string | null;
          notes: string | null; created_at: string; reservation_expiry: string | null;
          reservation_date: string;
        };
        Insert: {
          booking_request_id: string; departure_date: string; return_date?: string | null;
          price: number; airline?: string | null; notes?: string | null; reservation_expiry?: string | null;
          reservation_date?: string;
        };
        Update: { price?: number; airline?: string | null; notes?: string | null };
      };
      bookings: {
        Row: {
          id: string; booking_request_id: string; fare_option_id: string;
          reservation_expiry: string | null;
          payment_status: 'unpaid' | 'paid';
          payment_method: 'cash' | 'card' | 'bank_transfer' | null;
          payment_date: string | null; ticket_sent: boolean; card_made: boolean;
          created_at: string;
        };
        Insert: {
          booking_request_id: string; fare_option_id: string;
          reservation_expiry?: string | null;
          payment_method?: 'cash' | 'card' | 'bank_transfer' | null;
        };
        Update: {
          reservation_expiry?: string | null;
          payment_status?: 'unpaid' | 'paid';
          payment_method?: 'cash' | 'card' | 'bank_transfer' | null;
          payment_date?: string | null; ticket_sent?: boolean; card_made?: boolean;
        };
      };
      payments: {
        Row: {
          id: string; booking_id: string; agent_id: string; amount: number;
          method: 'cash' | 'card' | 'bank_transfer'; notes: string | null; created_at: string;
        };
        Insert: {
          booking_id: string; agent_id: string; amount: number;
          method: 'cash' | 'card' | 'bank_transfer'; notes?: string | null;
        };
        Update: never;
      };
      interactions: {
        Row: { id: string; booking_id: string; agent_id: string; note: string; created_at: string };
        Insert: { booking_id: string; agent_id: string; note: string };
        Update: never;
      };
    };
  };
}

export type Agent = Database['public']['Tables']['agents']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type BookingRequest = Database['public']['Tables']['booking_requests']['Row'];
export type FareOption = Database['public']['Tables']['fare_options']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];
