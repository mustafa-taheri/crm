export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          role: "admin" | "salesperson";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          role?: "admin" | "salesperson";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          role?: "admin" | "salesperson";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          company: string | null;
          email: string | null;
          city: string | null;
          industry: string | null;
          source: string | null;
          status: Database["public"]["Enums"]["customer_status"];
          primary_owner_id: string | null;
          marketing_opt_out: boolean;
          last_contact_at: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string | null;
          email?: string | null;
          city?: string | null;
          industry?: string | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["customer_status"];
          primary_owner_id?: string | null;
          marketing_opt_out?: boolean;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string | null;
          email?: string | null;
          city?: string | null;
          industry?: string | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["customer_status"];
          primary_owner_id?: string | null;
          marketing_opt_out?: boolean;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_primary_owner_id_fkey";
            columns: ["primary_owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_phones: {
        Row: {
          id: string;
          customer_id: string;
          phone_number: string;
          country_code: string;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          phone_number: string;
          country_code?: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          phone_number?: string;
          country_code?: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_phones_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      whatsapp_identities: {
        Row: {
          id: string;
          customer_id: string;
          customer_phone_id: string | null;
          whatsapp_identifier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          customer_phone_id?: string | null;
          whatsapp_identifier: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          customer_phone_id?: string | null;
          whatsapp_identifier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_identities_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_status_history: {
        Row: {
          id: string;
          customer_id: string;
          from_status: Database["public"]["Enums"]["customer_status"] | null;
          to_status: Database["public"]["Enums"]["customer_status"];
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          from_status?: Database["public"]["Enums"]["customer_status"] | null;
          to_status: Database["public"]["Enums"]["customer_status"];
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          from_status?: Database["public"]["Enums"]["customer_status"] | null;
          to_status?: Database["public"]["Enums"]["customer_status"];
          changed_by?: string | null;
          changed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_status_history_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      customer_tags: {
        Row: {
          customer_id: string;
          tag_id: string;
        };
        Insert: {
          customer_id: string;
          tag_id: string;
        };
        Update: {
          customer_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_tags_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      import_jobs: {
        Row: {
          id: string;
          created_by: string | null;
          status: "pending" | "processing" | "completed" | "failed";
          total_rows: number;
          valid_rows: number;
          warnings: number;
          errors: number;
          duplicates: number;
          imported: number;
          error_details: Json | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          status?: "pending" | "processing" | "completed" | "failed";
          total_rows?: number;
          valid_rows?: number;
          warnings?: number;
          errors?: number;
          duplicates?: number;
          imported?: number;
          error_details?: Json | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          status?: "pending" | "processing" | "completed" | "failed";
          total_rows?: number;
          valid_rows?: number;
          warnings?: number;
          errors?: number;
          duplicates?: number;
          imported?: number;
          error_details?: Json | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          customer_id: string;
          whatsapp_identity_id: string | null;
          assigned_user_id: string | null;
          state: Database["public"]["Enums"]["conversation_state"];
          last_message_at: string | null;
          last_customer_message_at: string | null;
          unread_count: number;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          whatsapp_identity_id?: string | null;
          assigned_user_id?: string | null;
          state?: Database["public"]["Enums"]["conversation_state"];
          last_message_at?: string | null;
          last_customer_message_at?: string | null;
          unread_count?: number;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          whatsapp_identity_id?: string | null;
          assigned_user_id?: string | null;
          state?: Database["public"]["Enums"]["conversation_state"];
          last_message_at?: string | null;
          last_customer_message_at?: string | null;
          unread_count?: number;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_assigned_user_id_fkey";
            columns: ["assigned_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          customer_id: string;
          sender_user_id: string | null;
          direction: Database["public"]["Enums"]["message_direction"];
          message_type: Database["public"]["Enums"]["message_type"];
          content: string | null;
          whatsapp_message_id: string | null;
          status: Database["public"]["Enums"]["message_status"];
          campaign_id: string | null;
          attributed_campaign_id: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          customer_id: string;
          sender_user_id?: string | null;
          direction: Database["public"]["Enums"]["message_direction"];
          message_type?: Database["public"]["Enums"]["message_type"];
          content?: string | null;
          whatsapp_message_id?: string | null;
          status?: Database["public"]["Enums"]["message_status"];
          campaign_id?: string | null;
          attributed_campaign_id?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          customer_id?: string;
          sender_user_id?: string | null;
          direction?: Database["public"]["Enums"]["message_direction"];
          message_type?: Database["public"]["Enums"]["message_type"];
          content?: string | null;
          whatsapp_message_id?: string | null;
          status?: Database["public"]["Enums"]["message_status"];
          campaign_id?: string | null;
          attributed_campaign_id?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey";
            columns: ["sender_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      message_media: {
        Row: {
          id: string;
          message_id: string;
          media_type: "image" | "video" | "document" | "pdf";
          file_url: string | null;
          mime_type: string | null;
          file_name: string | null;
          file_size: number | null;
          whatsapp_media_id: string | null;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          media_type: "image" | "video" | "document" | "pdf";
          file_url?: string | null;
          mime_type?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          whatsapp_media_id?: string | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          media_type?: "image" | "video" | "document" | "pdf";
          file_url?: string | null;
          mime_type?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          whatsapp_media_id?: string | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_media_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
        ];
      };
      whatsapp_templates: {
        Row: {
          id: string;
          name: string;
          content: string;
          status: Database["public"]["Enums"]["template_status"];
          created_by: string | null;
          approved_by: string | null;
          provider_template_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          status?: Database["public"]["Enums"]["template_status"];
          created_by?: string | null;
          approved_by?: string | null;
          provider_template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          content?: string;
          status?: Database["public"]["Enums"]["template_status"];
          created_by?: string | null;
          approved_by?: string | null;
          provider_template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_templates_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          template_id: string | null;
          status: Database["public"]["Enums"]["campaign_status"];
          created_by: string | null;
          approved_by: string | null;
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          template_id?: string | null;
          status?: Database["public"]["Enums"]["campaign_status"];
          created_by?: string | null;
          approved_by?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          template_id?: string | null;
          status?: Database["public"]["Enums"]["campaign_status"];
          created_by?: string | null;
          approved_by?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "whatsapp_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaigns_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaigns_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_recipients: {
        Row: {
          id: string;
          campaign_id: string;
          customer_id: string;
          whatsapp_identity_id: string | null;
          status:
            | "pending"
            | "sending"
            | "sent"
            | "delivered"
            | "read"
            | "replied"
            | "failed"
            | "opted_out"
            | "cancelled";
          message_id: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          replied_at: string | null;
          failed_at: string | null;
          opted_out_at: string | null;
          error_details: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          customer_id: string;
          whatsapp_identity_id?: string | null;
          status?:
            | "pending"
            | "sending"
            | "sent"
            | "delivered"
            | "read"
            | "replied"
            | "failed"
            | "opted_out"
            | "cancelled";
          message_id?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          replied_at?: string | null;
          failed_at?: string | null;
          opted_out_at?: string | null;
          error_details?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          customer_id?: string;
          whatsapp_identity_id?: string | null;
          status?:
            | "pending"
            | "sending"
            | "sent"
            | "delivered"
            | "read"
            | "replied"
            | "failed"
            | "opted_out"
            | "cancelled";
          message_id?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          replied_at?: string | null;
          failed_at?: string | null;
          opted_out_at?: string | null;
          error_details?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_media: {
        Row: {
          id: string;
          campaign_id: string;
          media_type: "pdf" | "image" | "video";
          file_url: string | null;
          file_name: string | null;
          mime_type: string | null;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          media_type: "pdf" | "image" | "video";
          file_url?: string | null;
          file_name?: string | null;
          mime_type?: string | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          media_type?: "pdf" | "image" | "video";
          file_url?: string | null;
          file_name?: string | null;
          mime_type?: string | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_media_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      followups: {
        Row: {
          id: string;
          customer_id: string;
          assigned_user_id: string | null;
          description: string;
          due_date: string;
          due_time: string | null;
          reminder_minutes: number;
          priority: Database["public"]["Enums"]["followup_priority"];
          status: Database["public"]["Enums"]["followup_status"];
          created_by: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          assigned_user_id?: string | null;
          description: string;
          due_date: string;
          due_time?: string | null;
          reminder_minutes?: number;
          priority?: Database["public"]["Enums"]["followup_priority"];
          status?: Database["public"]["Enums"]["followup_status"];
          created_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          assigned_user_id?: string | null;
          description?: string;
          due_date?: string;
          due_time?: string | null;
          reminder_minutes?: number;
          priority?: Database["public"]["Enums"]["followup_priority"];
          status?: Database["public"]["Enums"]["followup_status"];
          created_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "followups_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "followups_assigned_user_id_fkey";
            columns: ["assigned_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "followups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          customer_id: string;
          conversation_id: string | null;
          created_by: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          conversation_id?: string | null;
          created_by?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          conversation_id?: string | null;
          created_by?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          customer_id: string | null;
          conversation_id: string | null;
          user_id: string | null;
          activity_type: string;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          conversation_id?: string | null;
          user_id?: string | null;
          activity_type: string;
          description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          conversation_id?: string | null;
          user_id?: string | null;
          activity_type?: string;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          total_customers: number;
          active_chats: number;
          active_campaigns: number;
          unread_replies: number;
          followups_today: number;
          overdue_followups: number;
        };
        Relationships: [];
      };
      pipeline_counts: {
        Row: {
          status: Database["public"]["Enums"]["customer_status"];
          count: number;
        };
        Relationships: [];
      };
      campaign_analytics: {
        Row: {
          id: string;
          name: string;
          status: Database["public"]["Enums"]["campaign_status"];
          created_at: string;
          audience: number;
          sent: number;
          delivered: number;
          read: number;
          replied: number;
          failed: number;
          opted_out: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      handle_new_user: {
        Args: {
          new: object;
        };
        Returns: object;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: object;
      };
    };
    Enums: {
      customer_status:
        | "new_reply"
        | "interested"
        | "quotation"
        | "negotiation"
        | "won"
        | "lost";
      conversation_state: "open" | "closed" | "archived";
      message_direction: "inbound" | "outbound";
      message_type: "text" | "image" | "document" | "video";
      message_status: "sending" | "sent" | "delivered" | "read" | "failed";
      campaign_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "scheduled"
        | "running"
        | "paused"
        | "completed"
        | "cancelled"
        | "failed";
      template_status: "draft" | "pending" | "approved" | "rejected";
      followup_status: "pending" | "completed";
      followup_priority: "low" | "medium" | "high";
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
}
