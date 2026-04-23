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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      benchmarks: {
        Row: {
          entity_id: string | null
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string | null
          unit: string | null
        }
        Insert: {
          entity_id?: string | null
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          unit?: string | null
        }
        Update: {
          entity_id?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benchmarks_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          svg: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          svg?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          svg?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      entities: {
        Row: {
          built_on_id: string | null
          company_id: string | null
          company_logo_char: string | null
          company_name: string
          created_at: string | null
          description: Json | null
          embedding: string | null
          github_url: string | null
          id: string
          is_featured: boolean | null
          is_primitive: boolean | null
          license: Database["public"]["Enums"]["license_type"] | null
          logo_url: string | null
          name: string
          redeem_url: string | null
          related_stack_id: string | null
          slug: string
          star_count: number | null
          svg: string | null
          tagline: string | null
          type: Database["public"]["Enums"]["entry_type"]
          updated_at: string | null
          verified_node: boolean | null
          website_url: string | null
        }
        Insert: {
          built_on_id?: string | null
          company_id?: string | null
          company_logo_char?: string | null
          company_name: string
          created_at?: string | null
          description?: Json | null
          embedding?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_primitive?: boolean | null
          license?: Database["public"]["Enums"]["license_type"] | null
          logo_url?: string | null
          name: string
          redeem_url?: string | null
          related_stack_id?: string | null
          slug: string
          star_count?: number | null
          svg?: string | null
          tagline?: string | null
          type: Database["public"]["Enums"]["entry_type"]
          updated_at?: string | null
          verified_node?: boolean | null
          website_url?: string | null
        }
        Update: {
          built_on_id?: string | null
          company_id?: string | null
          company_logo_char?: string | null
          company_name?: string
          created_at?: string | null
          description?: Json | null
          embedding?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_primitive?: boolean | null
          license?: Database["public"]["Enums"]["license_type"] | null
          logo_url?: string | null
          name?: string
          redeem_url?: string | null
          related_stack_id?: string | null
          slug?: string
          star_count?: number | null
          svg?: string | null
          tagline?: string | null
          type?: Database["public"]["Enums"]["entry_type"]
          updated_at?: string | null
          verified_node?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entities_built_on_id_fkey"
            columns: ["built_on_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entities_related_stack_id_fkey"
            columns: ["related_stack_id"]
            isOneToOne: false
            referencedRelation: "user_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_layers: {
        Row: {
          blog_urls: Json | null
          capabilities: Json | null
          deprecation_notice: string | null
          documentation_url: string | null
          entity_id: string
          getting_started_url: string | null
          is_deprecated: boolean | null
          is_primary: boolean | null
          last_verified_at: string | null
          layer_description: string | null
          layer_id: number
          learning_resources: Json | null
          metadata: Json | null
          pricing_model: string | null
          pricing_notes: string | null
          services: Json | null
          tags: Json | null
          use_cases: Json | null
          verified_by: string | null
          version: string | null
        }
        Insert: {
          blog_urls?: Json | null
          capabilities?: Json | null
          deprecation_notice?: string | null
          documentation_url?: string | null
          entity_id: string
          getting_started_url?: string | null
          is_deprecated?: boolean | null
          is_primary?: boolean | null
          last_verified_at?: string | null
          layer_description?: string | null
          layer_id: number
          learning_resources?: Json | null
          metadata?: Json | null
          pricing_model?: string | null
          pricing_notes?: string | null
          services?: Json | null
          tags?: Json | null
          use_cases?: Json | null
          verified_by?: string | null
          version?: string | null
        }
        Update: {
          blog_urls?: Json | null
          capabilities?: Json | null
          deprecation_notice?: string | null
          documentation_url?: string | null
          entity_id?: string
          getting_started_url?: string | null
          is_deprecated?: boolean | null
          is_primary?: boolean | null
          last_verified_at?: string | null
          layer_description?: string | null
          layer_id?: number
          learning_resources?: Json | null
          metadata?: Json | null
          pricing_model?: string | null
          pricing_notes?: string | null
          services?: Json | null
          tags?: Json | null
          use_cases?: Json | null
          verified_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_layers_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_layers_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
        ]
      }
      layers: {
        Row: {
          color_gradient: string | null
          created_at: string | null
          description: string | null
          featured_entity_ids: string[] | null
          icon_name: string | null
          id: number
          name: string
          rank: number
          slug: string
        }
        Insert: {
          color_gradient?: string | null
          created_at?: string | null
          description?: string | null
          featured_entity_ids?: string[] | null
          icon_name?: string | null
          id?: number
          name: string
          rank: number
          slug: string
        }
        Update: {
          color_gradient?: string | null
          created_at?: string | null
          description?: string | null
          featured_entity_ids?: string[] | null
          icon_name?: string | null
          id?: number
          name?: string
          rank?: number
          slug?: string
        }
        Relationships: []
      }
      meetups: {
        Row: {
          city: string
          country_code: string | null
          created_at: string | null
          end_time: string | null
          host_name: string | null
          id: string
          name: string
          primary_layer_id: number | null
          registration_url: string | null
          slug: string
          start_time: string
        }
        Insert: {
          city: string
          country_code?: string | null
          created_at?: string | null
          end_time?: string | null
          host_name?: string | null
          id?: string
          name: string
          primary_layer_id?: number | null
          registration_url?: string | null
          slug: string
          start_time: string
        }
        Update: {
          city?: string
          country_code?: string | null
          created_at?: string | null
          end_time?: string | null
          host_name?: string | null
          id?: string
          name?: string
          primary_layer_id?: number | null
          registration_url?: string | null
          slug?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetups_primary_layer_id_fkey"
            columns: ["primary_layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          related_layer_id: number | null
          related_stack_id: string | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          related_layer_id?: number | null
          related_stack_id?: string | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          related_layer_id?: number | null
          related_stack_id?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_related_layer_id_fkey"
            columns: ["related_layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_related_stack_id_fkey"
            columns: ["related_stack_id"]
            isOneToOne: false
            referencedRelation: "user_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing: {
        Row: {
          entity_id: string | null
          id: string
          is_free_tier: boolean | null
          model_type: string | null
          price_usd: number | null
        }
        Insert: {
          entity_id?: string | null
          id?: string
          is_free_tier?: boolean | null
          model_type?: string | null
          price_usd?: number | null
        }
        Update: {
          entity_id?: string | null
          id?: string
          is_free_tier?: boolean | null
          model_type?: string | null
          price_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          github_handle: string | null
          headline: string | null
          id: string
          primary_layer_id: number | null
          twitter_handle: string | null
          updated_at: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          github_handle?: string | null
          headline?: string | null
          id: string
          primary_layer_id?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          github_handle?: string | null
          headline?: string | null
          id?: string
          primary_layer_id?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_layer_id_fkey"
            columns: ["primary_layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_updates: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          importance_score: number | null
          related_entity_id: string | null
          related_layer_id: number | null
          source_name: string | null
          title: string
          type: Database["public"]["Enums"]["news_type"]
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          importance_score?: number | null
          related_entity_id?: string | null
          related_layer_id?: number | null
          source_name?: string | null
          title: string
          type?: Database["public"]["Enums"]["news_type"]
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          importance_score?: number | null
          related_entity_id?: string | null
          related_layer_id?: number | null
          source_name?: string | null
          title?: string
          type?: Database["public"]["Enums"]["news_type"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pulse_updates_related_entity_id_fkey"
            columns: ["related_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_updates_related_layer_id_fkey"
            columns: ["related_layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
        ]
      }
      stack_compositions: {
        Row: {
          attached_url: string | null
          entity_id: string
          layer_id: number
          stack_id: string
          user_note: string | null
        }
        Insert: {
          attached_url?: string | null
          entity_id: string
          layer_id: number
          stack_id: string
          user_note?: string | null
        }
        Update: {
          attached_url?: string | null
          entity_id?: string
          layer_id?: number
          stack_id?: string
          user_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stack_compositions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stack_compositions_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stack_compositions_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "user_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_notes: string | null
          company_name: string | null
          converted_entity_id: string | null
          created_at: string | null
          critical_pitch: string
          description: string | null
          github_url: string | null
          id: string
          logo_url: string | null
          startup_name: string
          status: Database["public"]["Enums"]["audit_status"] | null
          submitter_id: string | null
          target_layer_id: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          company_name?: string | null
          converted_entity_id?: string | null
          created_at?: string | null
          critical_pitch: string
          description?: string | null
          github_url?: string | null
          id?: string
          logo_url?: string | null
          startup_name: string
          status?: Database["public"]["Enums"]["audit_status"] | null
          submitter_id?: string | null
          target_layer_id?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          company_name?: string | null
          converted_entity_id?: string | null
          created_at?: string | null
          critical_pitch?: string
          description?: string | null
          github_url?: string | null
          id?: string
          logo_url?: string | null
          startup_name?: string
          status?: Database["public"]["Enums"]["audit_status"] | null
          submitter_id?: string | null
          target_layer_id?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_converted_entity_id_fkey"
            columns: ["converted_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_target_layer_id_fkey"
            columns: ["target_layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_endorsements: {
        Row: {
          created_at: string | null
          entity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_endorsements_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_endorsements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stacks: {
        Row: {
          card_theme_color: string | null
          created_at: string | null
          description: string | null
          entities_id: string[] | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          card_theme_color?: string | null
          created_at?: string | null
          description?: string | null
          entities_id?: string[] | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          card_theme_color?: string | null
          created_at?: string | null
          description?: string | null
          entities_id?: string[] | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uuidv7: { Args: never; Returns: string }
    }
    Enums: {
      audit_status: "pending" | "approved" | "rejected"
      entry_type:
        | "model"
        | "tool"
        | "platform"
        | "infrastructure"
        | "framework"
        | "startup"
      license_type: "open_source" | "proprietary" | "source_available"
      news_type:
        | "release"
        | "benchmark"
        | "market"
        | "policy"
        | "security"
        | "feature"
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
      audit_status: ["pending", "approved", "rejected"],
      entry_type: [
        "model",
        "tool",
        "platform",
        "infrastructure",
        "framework",
        "startup",
      ],
      license_type: ["open_source", "proprietary", "source_available"],
      news_type: [
        "release",
        "benchmark",
        "market",
        "policy",
        "security",
        "feature",
      ],
    },
  },
} as const
