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
      blog_likes: {
        Row: {
          blog_slug: string
          created_at: string
          id: string
          likes_count: number
          updated_at: string
        }
        Insert: {
          blog_slug: string
          created_at?: string
          id?: string
          likes_count?: number
          updated_at?: string
        }
        Update: {
          blog_slug?: string
          created_at?: string
          id?: string
          likes_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_user_likes: {
        Row: {
          blog_slug: string
          created_at: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          blog_slug: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          blog_slug?: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          category: string
          created_at: string
          date: string
          id: number
          match_card: string
          overall_impression: string | null
          player_comments: string | null
          score: string
          updated_at: string
          user_id: string
          venue: string
          videos: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          id?: number
          match_card: string
          overall_impression?: string | null
          player_comments?: string | null
          score: string
          updated_at?: string
          user_id: string
          venue: string
          videos?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: number
          match_card?: string
          overall_impression?: string | null
          player_comments?: string | null
          score?: string
          updated_at?: string
          user_id?: string
          venue?: string
          videos?: string[] | null
        }
        Relationships: []
      }
      draft_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          age: number | null
          batting_hand: string | null
          career_path: Json | null
          category: string
          created_at: string
          evaluations: string[] | null
          height: number | null
          hometown: string | null
          id: number
          is_favorite: boolean
          main_position: string | null
          memo: string | null
          name: string
          position: string
          recommended_teams: string[] | null
          team: string
          throwing_hand: string | null
          updated_at: string
          usage: string | null
          user_id: string
          videos: string[] | null
          weight: number | null
          year: number | null
        }
        Insert: {
          age?: number | null
          batting_hand?: string | null
          career_path?: Json | null
          category: string
          created_at?: string
          evaluations?: string[] | null
          height?: number | null
          hometown?: string | null
          id?: number
          is_favorite?: boolean
          main_position?: string | null
          memo?: string | null
          name: string
          position: string
          recommended_teams?: string[] | null
          team: string
          throwing_hand?: string | null
          updated_at?: string
          usage?: string | null
          user_id: string
          videos?: string[] | null
          weight?: number | null
          year?: number | null
        }
        Update: {
          age?: number | null
          batting_hand?: string | null
          career_path?: Json | null
          category?: string
          created_at?: string
          evaluations?: string[] | null
          height?: number | null
          hometown?: string | null
          id?: number
          is_favorite?: boolean
          main_position?: string | null
          memo?: string | null
          name?: string
          position?: string
          recommended_teams?: string[] | null
          team?: string
          throwing_hand?: string | null
          updated_at?: string
          usage?: string | null
          user_id?: string
          videos?: string[] | null
          weight?: number | null
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          social_links: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          social_links?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          social_links?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_player_imports: {
        Row: {
          created_at: string
          id: string
          public_player_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          public_player_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          public_player_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_player_imports_public_player_id_fkey"
            columns: ["public_player_id"]
            isOneToOne: false
            referencedRelation: "public_players"
            referencedColumns: ["id"]
          },
        ]
      }
      public_player_views: {
        Row: {
          created_at: string
          id: string
          public_player_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          public_player_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          public_player_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_player_views_public_player_id_fkey"
            columns: ["public_player_id"]
            isOneToOne: false
            referencedRelation: "public_players"
            referencedColumns: ["id"]
          },
        ]
      }
      public_players: {
        Row: {
          age: number | null
          batting_hand: string | null
          career_path: Json | null
          category: string
          created_at: string
          evaluations: string[] | null
          height: number | null
          hometown: string | null
          id: string
          import_count: number
          is_favorite: boolean
          main_position: string | null
          memo: string | null
          name: string
          original_player_id: number | null
          position: string
          recommended_teams: string[] | null
          team: string
          throwing_hand: string | null
          updated_at: string
          usage: string | null
          user_id: string
          videos: string[] | null
          view_count: number
          weight: number | null
          year: number | null
        }
        Insert: {
          age?: number | null
          batting_hand?: string | null
          career_path?: Json | null
          category: string
          created_at?: string
          evaluations?: string[] | null
          height?: number | null
          hometown?: string | null
          id?: string
          import_count?: number
          is_favorite?: boolean
          main_position?: string | null
          memo?: string | null
          name: string
          original_player_id?: number | null
          position: string
          recommended_teams?: string[] | null
          team: string
          throwing_hand?: string | null
          updated_at?: string
          usage?: string | null
          user_id: string
          videos?: string[] | null
          view_count?: number
          weight?: number | null
          year?: number | null
        }
        Update: {
          age?: number | null
          batting_hand?: string | null
          career_path?: Json | null
          category?: string
          created_at?: string
          evaluations?: string[] | null
          height?: number | null
          hometown?: string | null
          id?: string
          import_count?: number
          is_favorite?: boolean
          main_position?: string | null
          memo?: string | null
          name?: string
          original_player_id?: number | null
          position?: string
          recommended_teams?: string[] | null
          team?: string
          throwing_hand?: string | null
          updated_at?: string
          usage?: string | null
          user_id?: string
          videos?: string[] | null
          view_count?: number
          weight?: number | null
          year?: number | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_player_import_count: {
        Args: { player_id: string }
        Returns: undefined
      }
      increment_player_view_count: {
        Args: { player_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
