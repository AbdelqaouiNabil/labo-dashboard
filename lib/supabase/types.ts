export type Contact = {
  id: string;
  phone: string;
  name: string;
  language: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  contact_id: string;
  mode: "ai" | "human";
  assigned_to: string | null;
  last_message_at: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  contact_id: string;
  direction: "inbound" | "outbound";
  message: string;
  type: string;
  media_url: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  contact_id: string;
  reservation_type: "home_kenitra" | "home_outside" | "onsite";
  service: string;
  total_price: number;
  travel_fee: number;
  final_price: number;
  status: "pending" | "confirmed" | "cancelled";
  appointment_date: string;
  notes: string | null;
  patient_name: string | null;
  adresse: string | null;
  phone: number | null;
  created_at: string;
};

export type Analysis = {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  sous_categorie: string | null;
  coefficient_b: number;
  prix: number | null;
  synonymes: string[];
  created_at: string;
};

export type Document = {
  id: string;
  contact_id: string;
  type: string;
  file_url: string;
  extracted_text: string | null;
  created_at: string;
};

export type ConversationWithContact = Conversation & {
  contacts: Contact;
};

export type MessageWithContact = Message & {
  contacts: Contact;
};

export type AppointmentWithContact = Appointment & {
  contacts: Contact;
};

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, "id" | "created_at">;
        Update: Partial<Omit<Contact, "id" | "created_at">>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at">;
        Update: Partial<Omit<Conversation, "id" | "created_at">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Omit<Message, "id" | "created_at">>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at">;
        Update: Partial<Omit<Appointment, "id" | "created_at">>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, "id" | "created_at">;
        Update: Partial<Omit<Document, "id" | "created_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
