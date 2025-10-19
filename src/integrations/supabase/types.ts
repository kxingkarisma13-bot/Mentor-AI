export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      big_purchase_plans: {
        Row: {
          created_at: string
          current_savings: number | null
          id: string
          monthly_budget: number | null
          notes: string | null
          purchase_type: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_savings?: number | null
          id?: string
          monthly_budget?: number | null
          notes?: string | null
          purchase_type: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_savings?: number | null
          id?: string
          monthly_budget?: number | null
          notes?: string | null
          purchase_type?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultation_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          created_at: string
          duration_minutes: number
          ended_at: string | null
          id: string
          notes: string | null
          professional_id: string
          scheduled_at: string | null
          specialty: Database["public"]["Enums"]["professional_specialty"]
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_status"]
          stripe_payment_intent_id: string | null
          stripe_payment_status: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          professional_id: string
          scheduled_at?: string | null
          specialty: Database["public"]["Enums"]["professional_specialty"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          professional_id?: string
          scheduled_at?: string | null
          specialty?: Database["public"]["Enums"]["professional_specialty"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          value: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          value: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          is_active: boolean | null
          plan_data: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          plan_data: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          plan_data?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          emotion: string | null
          id: string
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion?: string | null
          id?: string
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: string | null
          id?: string
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professional_reviews: {
        Row: {
          consultation_id: string
          created_at: string
          id: string
          professional_id: string
          rating: number
          review_text: string | null
          user_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: string
          professional_id: string
          rating: number
          review_text?: string | null
          user_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: string
          professional_id?: string
          rating?: number
          review_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          average_rating: number | null
          bio: string
          certifications: string[] | null
          created_at: string
          display_name: string
          hourly_rate: number
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          profile_image_url: string | null
          specialties: Database["public"]["Enums"]["professional_specialty"][]
          total_consultations: number | null
          updated_at: string
          user_id: string
          years_experience: number
        }
        Insert: {
          average_rating?: number | null
          bio: string
          certifications?: string[] | null
          created_at?: string
          display_name: string
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          profile_image_url?: string | null
          specialties: Database["public"]["Enums"]["professional_specialty"][]
          total_consultations?: number | null
          updated_at?: string
          user_id: string
          years_experience: number
        }
        Update: {
          average_rating?: number | null
          bio?: string
          certifications?: string[] | null
          created_at?: string
          display_name?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          profile_image_url?: string | null
          specialties?: Database["public"]["Enums"]["professional_specialty"][]
          total_consultations?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          id: string
          monthly_contribution: number | null
          status: string
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          monthly_contribution?: number | null
          status?: string
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          monthly_contribution?: number | null
          status?: string
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_fitness_profiles: {
        Row: {
          created_at: string
          dietary_preferences: string[] | null
          fitness_goals: string[] | null
          fitness_level: string | null
          health_conditions: string[] | null
          height_cm: number | null
          id: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          dietary_preferences?: string[] | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          dietary_preferences?: string[] | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          status: string | null
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          location: string | null
          occupation: string | null
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          professional_id: string | null
          verified_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          professional_id?: string | null
          verified_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          professional_id?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_audit_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          is_active: boolean | null
          plan_data: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          plan_data: Json
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          plan_data?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_records: {
        Row: {
          calories_burned: number
          completed_at: string
          created_at: string
          duration_minutes: number
          exercises_completed: Json
          id: string
          user_id: string
          workout_name: string
          workout_plan_id: string | null
        }
        Insert: {
          calories_burned: number
          completed_at?: string
          created_at?: string
          duration_minutes: number
          exercises_completed?: Json
          id?: string
          user_id: string
          workout_name: string
          workout_plan_id?: string | null
        }
        Update: {
          calories_burned?: number
          completed_at?: string
          created_at?: string
          duration_minutes?: number
          exercises_completed?: Json
          id?: string
          user_id?: string
          workout_name?: string
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_records_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      detect_sensitive_data: {
        Args: { input_text: string }
        Returns: boolean
      }
      get_my_security_events: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          created_at: string
          details: Json
          id: string
          table_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      consultation_status: "pending" | "active" | "completed" | "cancelled"
      professional_specialty:
        | "finance"
        | "mental_wellness"
        | "life_skills"
        | "career"
        | "legal"
        | "health"
        | "education"
        | "technology"
        | "business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      consultation_status: ["pending", "active", "completed", "cancelled"],
      professional_specialty: [
        "finance",
        "mental_wellness",
        "life_skills",
        "career",
        "legal",
        "health",
        "education",
        "technology",
        "business",
      ],
    },
  },
} as const
