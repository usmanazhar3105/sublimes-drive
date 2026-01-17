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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          category: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          name: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          badge_color?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          name: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          badge_color?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          name?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      ad_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          name_ar: string | null
          name_zh: string | null
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          name_ar?: string | null
          name_zh?: string | null
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          name_zh?: string | null
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ad_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_activity_log: {
        Row: {
          agent_id: string
          created_at: string
          event_type: string
          id: number
          message: string | null
          post_id: string | null
          status: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          event_type: string
          id?: number
          message?: string | null
          post_id?: string | null
          status: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          event_type?: string
          id?: number
          message?: string | null
          post_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_activity_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_settings: {
        Row: {
          agent_id: string
          auto_reply_enabled: boolean
          community_id: string | null
          created_at: string
          id: number
          is_enabled: boolean
          language_default: string
          max_comment_len: number
          rate_per_day: number
          rate_per_hour: number
          rate_per_min: number
          safe_mode: boolean
          source_attribution: boolean
          updated_at: string
        }
        Insert: {
          agent_id: string
          auto_reply_enabled?: boolean
          community_id?: string | null
          created_at?: string
          id?: number
          is_enabled?: boolean
          language_default?: string
          max_comment_len?: number
          rate_per_day?: number
          rate_per_hour?: number
          rate_per_min?: number
          safe_mode?: boolean
          source_attribution?: boolean
          updated_at?: string
        }
        Update: {
          agent_id?: string
          auto_reply_enabled?: boolean
          community_id?: string | null
          created_at?: string
          id?: number
          is_enabled?: boolean
          language_default?: string
          max_comment_len?: number
          rate_per_day?: number
          rate_per_hour?: number
          rate_per_min?: number
          safe_mode?: boolean
          source_attribution?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_settings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_settings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          handle: string
          id: string
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          handle: string
          id?: string
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          handle?: string
          id?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_comment_threads: {
        Row: {
          agent_id: string
          created_at: string
          id: number
          post_id: string
          root_comment_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: number
          post_id: string
          root_comment_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: number
          post_id?: string
          root_comment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_comment_threads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_comment_threads_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_comment_threads_root_comment_id_fkey"
            columns: ["root_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_post_responses: {
        Row: {
          agent_id: string
          created_at: string
          id: number
          post_id: string
          reason: string | null
          root_comment_id: string | null
          status: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: number
          post_id: string
          reason?: string | null
          root_comment_id?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: number
          post_id?: string
          reason?: string | null
          root_comment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_post_responses_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_post_responses_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_post_responses_root_comment_id_fkey"
            columns: ["root_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          entity_id: string | null
          entity_type: string | null
          event_category: string | null
          event_name: string
          event_properties: Json | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          page_path: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_category?: string | null
          event_name: string
          event_properties?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_path?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_category?: string | null
          event_name?: string
          event_properties?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_path?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
          success: boolean | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          success?: boolean | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          rarity: string | null
          requirement_type: string | null
          requirement_value: number | null
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          rarity?: string | null
          requirement_type?: string | null
          requirement_value?: number | null
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          rarity?: string | null
          requirement_type?: string | null
          requirement_value?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          cta_label: string | null
          cta_link: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          order_index: number | null
          position: number | null
          start_date: string | null
          subtitle: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_label?: string | null
          cta_link?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          order_index?: number | null
          position?: number | null
          start_date?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_label?: string | null
          cta_link?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          order_index?: number | null
          position?: number | null
          start_date?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bid_repair: {
        Row: {
          accepted_reply_id: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          id: string
          images: string[] | null
          location: Json | null
          owner_id: string
          replies_count: number | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_info: Json
          views_count: number | null
        }
        Insert: {
          accepted_reply_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          images?: string[] | null
          location?: Json | null
          owner_id: string
          replies_count?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_info: Json
          views_count?: number | null
        }
        Update: {
          accepted_reply_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          images?: string[] | null
          location?: Json | null
          owner_id?: string
          replies_count?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_info?: Json
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_repair_replies: {
        Row: {
          accepted_at: string | null
          bid_id: string
          created_at: string | null
          estimated_time: string | null
          garage_owner_id: string
          id: string
          message: string | null
          quote_amount: number | null
          status: string | null
          warranty_offered: string | null
        }
        Insert: {
          accepted_at?: string | null
          bid_id: string
          created_at?: string | null
          estimated_time?: string | null
          garage_owner_id: string
          id?: string
          message?: string | null
          quote_amount?: number | null
          status?: string | null
          warranty_offered?: string | null
        }
        Update: {
          accepted_at?: string | null
          bid_id?: string
          created_at?: string | null
          estimated_time?: string | null
          garage_owner_id?: string
          id?: string
          message?: string | null
          quote_amount?: number | null
          status?: string | null
          warranty_offered?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_repair_replies_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bid_repair"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_repair_replies_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_wallet: {
        Row: {
          balance: number | null
          created_at: string | null
          garage_owner_id: string
          id: string
          last_topup: string | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          garage_owner_id: string
          id?: string
          last_topup?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          garage_owner_id?: string
          id?: string
          last_topup?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_wallet_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_entitlements: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          payment_id: string | null
          starts_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          starts_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          starts_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_packages: {
        Row: {
          created_at: string | null
          description: string | null
          description_ar: string | null
          description_zh: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string | null
          name_zh: string | null
          price: number
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          name_zh?: string | null
          price: number
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          name_zh?: string | null
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_type: string
          created_at: string | null
          created_by: string | null
          file_url: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          created_by?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          created_by?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_brands: {
        Row: {
          country_of_origin: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          country_of_origin?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          country_of_origin?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      car_models: {
        Row: {
          body_type: string | null
          brand_id: string
          created_at: string | null
          fuel_type: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          body_type?: string | null
          brand_id: string
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          body_type?: string | null
          brand_id?: string
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "car_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      car_owner_verifications: {
        Row: {
          admin_notes: string | null
          brand: string
          car_photos_urls: Json | null
          created_at: string | null
          emirate: string
          id: string
          license_url: string | null
          model: string
          plate_number: string
          registration_card_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          vin_number: string | null
          year: string
        }
        Insert: {
          admin_notes?: string | null
          brand: string
          car_photos_urls?: Json | null
          created_at?: string | null
          emirate: string
          id?: string
          license_url?: string | null
          model: string
          plate_number: string
          registration_card_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          vin_number?: string | null
          year: string
        }
        Update: {
          admin_notes?: string | null
          brand?: string
          car_photos_urls?: Json | null
          created_at?: string | null
          emirate?: string
          id?: string
          license_url?: string | null
          model?: string
          plate_number?: string
          registration_card_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vin_number?: string | null
          year?: string
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          credits_claimed: number | null
          current_progress: number | null
          id: string
          started_at: string | null
          status: string | null
          target_progress: number
          updated_at: string | null
          user_id: string
          xp_claimed: number | null
        }
        Insert: {
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          credits_claimed?: number | null
          current_progress?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
          target_progress: number
          updated_at?: string | null
          user_id: string
          xp_claimed?: number | null
        }
        Update: {
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          credits_claimed?: number | null
          current_progress?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
          target_progress?: number
          updated_at?: string | null
          user_id?: string
          xp_claimed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          bot_agent_id: string | null
          content: string
          created_at: string | null
          id: string
          is_bot: boolean
          likes_count: number
          parent_comment_id: string | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bot_agent_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_bot?: boolean
          likes_count?: number
          parent_comment_id?: string | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bot_agent_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_bot?: boolean
          likes_count?: number
          parent_comment_id?: string | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_bot_agent_id_fkey"
            columns: ["bot_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_ar: string | null
          description_zh: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_official: boolean | null
          member_count: number | null
          name: string
          name_ar: string | null
          name_zh: string | null
          post_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_official?: boolean | null
          member_count?: number | null
          name: string
          name_ar?: string | null
          name_zh?: string | null
          post_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_official?: boolean | null
          member_count?: number | null
          name?: string
          name_ar?: string | null
          name_zh?: string | null
          post_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          like_count: number | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          like_count?: number | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          like_count?: number | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string | null
          car_brand: string | null
          car_brand_id: string | null
          car_model: string | null
          car_model_id: string | null
          comment_count: number | null
          community_id: string | null
          content: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_anonymous: boolean | null
          is_deleted: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          location: string | null
          media_urls: Json | null
          poll_allow_multiple: boolean | null
          poll_duration_hours: number | null
          poll_ends_at: string | null
          poll_options: Json | null
          poll_question: string | null
          post_type: string | null
          share_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          urgency_level: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          car_brand?: string | null
          car_brand_id?: string | null
          car_model?: string | null
          car_model_id?: string | null
          comment_count?: number | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          location?: string | null
          media_urls?: Json | null
          poll_allow_multiple?: boolean | null
          poll_duration_hours?: number | null
          poll_ends_at?: string | null
          poll_options?: Json | null
          poll_question?: string | null
          post_type?: string | null
          share_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          car_brand?: string | null
          car_brand_id?: string | null
          car_model?: string | null
          car_model_id?: string | null
          comment_count?: number | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          location?: string | null
          media_urls?: Json | null
          poll_allow_multiple?: boolean | null
          poll_duration_hours?: number | null
          poll_ends_at?: string | null
          poll_options?: Json | null
          poll_question?: string | null
          post_type?: string | null
          share_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_car_brand_id_fkey"
            columns: ["car_brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_car_model_id_fkey"
            columns: ["car_model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          category: string
          challenge_date: string
          coins_reward: number
          created_at: string | null
          description: string
          difficulty: string
          end_time: string | null
          id: string
          is_active: boolean | null
          requirement_count: number
          requirement_type: string
          start_time: string | null
          title: string
          updated_at: string | null
          xp_reward: number
        }
        Insert: {
          category: string
          challenge_date: string
          coins_reward?: number
          created_at?: string | null
          description: string
          difficulty?: string
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          requirement_count?: number
          requirement_type: string
          start_time?: string | null
          title: string
          updated_at?: string | null
          xp_reward?: number
        }
        Update: {
          category?: string
          challenge_date?: string
          coins_reward?: number
          created_at?: string | null
          description?: string
          difficulty?: string
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          requirement_count?: number
          requirement_type?: string
          start_time?: string | null
          title?: string
          updated_at?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          scheduled_at: string | null
          segment_rules: Json | null
          status: string | null
          subject_override: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          segment_rules?: Json | null
          status?: string | null
          subject_override?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          segment_rules?: Json | null
          status?: string | null
          subject_override?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_deliveries: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          created_at: string | null
          email: string
          error_text: string | null
          id: string
          opened_at: string | null
          provider_message_id: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email: string
          error_text?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email?: string
          error_text?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_segments: {
        Row: {
          created_at: string | null
          description: string | null
          filters: Json
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filters: Json
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_suppressions: {
        Row: {
          created_at: string | null
          details: string | null
          email: string
          id: string
          reason: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          email: string
          id?: string
          reason: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          email?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          created_at: string | null
          id: string
          locale: string | null
          name: string
          subject: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          locale?: string | null
          name: string
          subject: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          locale?: string | null
          name?: string
          subject?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_likes: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_likes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_likes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          guests_count: number | null
          id: string
          payment_id: string | null
          payment_status: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          guests_count?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          guests_count?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_views: {
        Row: {
          event_id: string
          id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          event_id: string
          id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_views_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_views_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          description_ar: string | null
          description_zh: string | null
          end_datetime: string | null
          event_date: string | null
          event_type: string | null
          favorite_count: number | null
          id: string
          is_featured: boolean | null
          is_online: boolean | null
          is_paid: boolean | null
          latitude: number | null
          location: string | null
          location_id: string | null
          longitude: number | null
          max_attendees: number | null
          online_meeting_url: string | null
          organizer_id: string
          registration_deadline: string | null
          start_datetime: string
          status: string | null
          ticket_price: number | null
          title: string
          title_ar: string | null
          title_zh: string | null
          updated_at: string | null
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          attendee_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          end_datetime?: string | null
          event_date?: string | null
          event_type?: string | null
          favorite_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_online?: boolean | null
          is_paid?: boolean | null
          latitude?: number | null
          location?: string | null
          location_id?: string | null
          longitude?: number | null
          max_attendees?: number | null
          online_meeting_url?: string | null
          organizer_id: string
          registration_deadline?: string | null
          start_datetime: string
          status?: string | null
          ticket_price?: number | null
          title: string
          title_ar?: string | null
          title_zh?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          attendee_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          end_datetime?: string | null
          event_date?: string | null
          event_type?: string | null
          favorite_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_online?: boolean | null
          is_paid?: boolean | null
          latitude?: number | null
          location?: string | null
          location_id?: string | null
          longitude?: number | null
          max_attendees?: number | null
          online_meeting_url?: string | null
          organizer_id?: string
          registration_deadline?: string | null
          start_datetime?: string
          status?: string | null
          ticket_price?: number | null
          title?: string
          title_ar?: string | null
          title_zh?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_text: string | null
          file_path: string | null
          id: string
          kind: string
          params: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_text?: string | null
          file_path?: string | null
          id?: string
          kind: string
          params?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_text?: string | null
          file_path?: string | null
          id?: string
          kind?: string
          params?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          faq_item_id: string | null
          id: string
          user_id: string | null
          was_helpful: boolean
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          faq_item_id?: string | null
          id?: string
          user_id?: string | null
          was_helpful: boolean
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          faq_item_id?: string | null
          id?: string
          user_id?: string | null
          was_helpful?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "faq_feedback_faq_item_id_fkey"
            columns: ["faq_item_id"]
            isOneToOne: false
            referencedRelation: "faq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string | null
          created_by: string | null
          display_order: number | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          question: string
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          question: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          question?: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followee_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          followee_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          followee_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      garage_bid_responses: {
        Row: {
          created_at: string | null
          estimated_cost: number | null
          estimated_duration: string | null
          garage_id: string
          id: string
          message: string | null
          repair_bid_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_cost?: number | null
          estimated_duration?: string | null
          garage_id: string
          id?: string
          message?: string | null
          repair_bid_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_cost?: number | null
          estimated_duration?: string | null
          garage_id?: string
          id?: string
          message?: string | null
          repair_bid_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "garage_bid_responses_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "garage_bid_responses_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_bid_responses_repair_bid_id_fkey"
            columns: ["repair_bid_id"]
            isOneToOne: false
            referencedRelation: "repair_bids"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          garage_id: string
          helpful_count: number | null
          id: string
          images: string[] | null
          is_verified_visit: boolean | null
          rating: number
          responded_at: string | null
          response: string | null
          service_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          garage_id: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified_visit?: boolean | null
          rating: number
          responded_at?: string | null
          response?: string | null
          service_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          garage_id?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified_visit?: boolean | null
          rating?: number
          responded_at?: string | null
          response?: string | null
          service_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_reviews_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "garage_reviews_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_services: {
        Row: {
          created_at: string | null
          garage_id: string
          id: string
          service_category_id: string
        }
        Insert: {
          created_at?: string | null
          garage_id: string
          id?: string
          service_category_id: string
        }
        Update: {
          created_at?: string | null
          garage_id?: string
          id?: string
          service_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_services_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "garage_services_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          address: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          description_zh: string | null
          email: string | null
          favorite_count: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location_id: string | null
          logo_url: string | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_zh: string | null
          owner_id: string
          phone: string | null
          rating: number | null
          rating_avg: number | null
          rating_count: number | null
          review_count: number | null
          slug: string
          updated_at: string | null
          verification_documents: Json | null
          verification_status: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          email?: string | null
          favorite_count?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_id?: string | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_zh?: string | null
          owner_id: string
          phone?: string | null
          rating?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          review_count?: number | null
          slug: string
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          email?: string | null
          favorite_count?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_id?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_zh?: string | null
          owner_id?: string
          phone?: string | null
          rating?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          review_count?: number | null
          slug?: string
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "garages_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_97527403: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      leaderboard_periods: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          period_type: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          period_type: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          period_type?: string
          start_date?: string
        }
        Relationships: []
      }
      leaderboard_snapshots: {
        Row: {
          category: string
          created_at: string | null
          id: string
          metadata: Json | null
          period_id: string | null
          rank: number
          score: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_id?: string | null
          rank: number
          score: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_id?: string | null
          rank?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_snapshots_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          change_summary: string | null
          changed_at: string | null
          changed_by: string | null
          content: string
          document_id: string | null
          id: string
          title: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          content: string
          document_id?: string | null
          id?: string
          title: string
          version: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          content?: string
          document_id?: string | null
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          title: string
          type: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          title: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          content: string | null
          content_ar: string | null
          content_zh: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          title_ar: string | null
          title_zh: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content?: string | null
          content_ar?: string | null
          content_zh?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          title_ar?: string | null
          title_zh?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string | null
          content_ar?: string | null
          content_zh?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          title_ar?: string | null
          title_zh?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_media: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          position: number | null
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          position?: number | null
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          position?: number | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_saves: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_saves_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string | null
          name_zh: string | null
          parent_id: string | null
          slug: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar?: string | null
          name_zh?: string | null
          parent_id?: string | null
          slug: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string | null
          name_zh?: string | null
          parent_id?: string | null
          slug?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      market_listings: {
        Row: {
          boost_expires_at: string | null
          created_at: string | null
          currency: string | null
          data: Json | null
          description: string | null
          id: string
          is_boosted: boolean | null
          is_featured: boolean | null
          listing_type: string
          price: number
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          boost_expires_at?: string | null
          created_at?: string | null
          currency?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          is_boosted?: boolean | null
          is_featured?: boolean | null
          listing_type: string
          price: number
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          boost_expires_at?: string | null
          created_at?: string | null
          currency?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          is_boosted?: boolean | null
          is_featured?: boolean | null
          listing_type?: string
          price?: number
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_boosts: {
        Row: {
          boost_type: string
          cost: number
          created_at: string | null
          duration_days: number
          expires_at: string
          id: string
          listing_id: string | null
          payment_id: string | null
          started_at: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          boost_type: string
          cost: number
          created_at?: string | null
          duration_days: number
          expires_at: string
          id?: string
          listing_id?: string | null
          payment_id?: string | null
          started_at?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          boost_type?: string
          cost?: number
          created_at?: string | null
          duration_days?: number
          expires_at?: string
          id?: string
          listing_id?: string | null
          payment_id?: string | null
          started_at?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_with_seller"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listing_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          listing_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          listing_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          listing_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listing_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          body_type: string | null
          boost_cost: number | null
          boost_expires_at: string | null
          boost_package: string | null
          boost_payment_id: string | null
          brand: string | null
          car_brand: string | null
          car_condition: string | null
          car_fuel_type: string | null
          car_mileage: number | null
          car_model: string | null
          car_transmission: string | null
          car_year: number | null
          category: string | null
          color: string | null
          compatible_brands: string[] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          customs_cleared: boolean | null
          description: string
          doors: number | null
          engine_capacity: string | null
          estimated_delivery_days: number | null
          expires_at: string | null
          favorite_count: number | null
          featured_at: string | null
          featured_by: string | null
          features: string[] | null
          horsepower: number | null
          id: string
          images: string[] | null
          inquiry_count: number | null
          is_boosted: boolean | null
          is_featured: boolean | null
          is_overseas: boolean | null
          is_verified: boolean | null
          is_verified_vendor: boolean | null
          latitude: number | null
          listing_fee_amount: number | null
          listing_fee_paid: boolean | null
          listing_fee_payment_id: string | null
          listing_payment_amount: number | null
          listing_payment_id: string | null
          listing_type: string
          location: string
          logistics_handling: string | null
          longitude: number | null
          make: string | null
          mileage: number | null
          model: string | null
          origin_country: string | null
          part_type: string | null
          price: number
          price_negotiable: boolean | null
          rejection_reason: string | null
          saves: number | null
          seats: number | null
          seller_rating: number | null
          seller_verified: boolean | null
          shipping_available: boolean | null
          shipping_cost: number | null
          sold_at: string | null
          specs: Json | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          verification_badge: string | null
          view_count: number | null
          views: number | null
          warranty_available: boolean | null
          warranty_months: number | null
          whatsapp_number: string | null
          year: number | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          body_type?: string | null
          boost_cost?: number | null
          boost_expires_at?: string | null
          boost_package?: string | null
          boost_payment_id?: string | null
          brand?: string | null
          car_brand?: string | null
          car_condition?: string | null
          car_fuel_type?: string | null
          car_mileage?: number | null
          car_model?: string | null
          car_transmission?: string | null
          car_year?: number | null
          category?: string | null
          color?: string | null
          compatible_brands?: string[] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          customs_cleared?: boolean | null
          description: string
          doors?: number | null
          engine_capacity?: string | null
          estimated_delivery_days?: number | null
          expires_at?: string | null
          favorite_count?: number | null
          featured_at?: string | null
          featured_by?: string | null
          features?: string[] | null
          horsepower?: number | null
          id?: string
          images?: string[] | null
          inquiry_count?: number | null
          is_boosted?: boolean | null
          is_featured?: boolean | null
          is_overseas?: boolean | null
          is_verified?: boolean | null
          is_verified_vendor?: boolean | null
          latitude?: number | null
          listing_fee_amount?: number | null
          listing_fee_paid?: boolean | null
          listing_fee_payment_id?: string | null
          listing_payment_amount?: number | null
          listing_payment_id?: string | null
          listing_type: string
          location: string
          logistics_handling?: string | null
          longitude?: number | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          origin_country?: string | null
          part_type?: string | null
          price: number
          price_negotiable?: boolean | null
          rejection_reason?: string | null
          saves?: number | null
          seats?: number | null
          seller_rating?: number | null
          seller_verified?: boolean | null
          shipping_available?: boolean | null
          shipping_cost?: number | null
          sold_at?: string | null
          specs?: Json | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          verification_badge?: string | null
          view_count?: number | null
          views?: number | null
          warranty_available?: boolean | null
          warranty_months?: number | null
          whatsapp_number?: string | null
          year?: number | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          body_type?: string | null
          boost_cost?: number | null
          boost_expires_at?: string | null
          boost_package?: string | null
          boost_payment_id?: string | null
          brand?: string | null
          car_brand?: string | null
          car_condition?: string | null
          car_fuel_type?: string | null
          car_mileage?: number | null
          car_model?: string | null
          car_transmission?: string | null
          car_year?: number | null
          category?: string | null
          color?: string | null
          compatible_brands?: string[] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          customs_cleared?: boolean | null
          description?: string
          doors?: number | null
          engine_capacity?: string | null
          estimated_delivery_days?: number | null
          expires_at?: string | null
          favorite_count?: number | null
          featured_at?: string | null
          featured_by?: string | null
          features?: string[] | null
          horsepower?: number | null
          id?: string
          images?: string[] | null
          inquiry_count?: number | null
          is_boosted?: boolean | null
          is_featured?: boolean | null
          is_overseas?: boolean | null
          is_verified?: boolean | null
          is_verified_vendor?: boolean | null
          latitude?: number | null
          listing_fee_amount?: number | null
          listing_fee_paid?: boolean | null
          listing_fee_payment_id?: string | null
          listing_payment_amount?: number | null
          listing_payment_id?: string | null
          listing_type?: string
          location?: string
          logistics_handling?: string | null
          longitude?: number | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          origin_country?: string | null
          part_type?: string | null
          price?: number
          price_negotiable?: boolean | null
          rejection_reason?: string | null
          saves?: number | null
          seats?: number | null
          seller_rating?: number | null
          seller_verified?: boolean | null
          shipping_available?: boolean | null
          shipping_cost?: number | null
          sold_at?: string | null
          specs?: Json | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          verification_badge?: string | null
          view_count?: number | null
          views?: number | null
          warranty_available?: boolean | null
          warranty_months?: number | null
          whatsapp_number?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_offers: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          listing_id: string
          message: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          listing_id: string
          message?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_offers_backup: {
        Row: {
          accepted_at: string | null
          buyer_id: string
          counter_amount: number | null
          created_at: string | null
          expires_at: string | null
          favorite_count: number | null
          id: string
          is_boosted: boolean | null
          listing_id: string
          message: string | null
          offer_amount: number
          offer_type: string | null
          rejected_at: string | null
          response_message: string | null
          seller_id: string
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          buyer_id: string
          counter_amount?: number | null
          created_at?: string | null
          expires_at?: string | null
          favorite_count?: number | null
          id?: string
          is_boosted?: boolean | null
          listing_id: string
          message?: string | null
          offer_amount: number
          offer_type?: string | null
          rejected_at?: string | null
          response_message?: string | null
          seller_id: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          buyer_id?: string
          counter_amount?: number | null
          created_at?: string | null
          expires_at?: string | null
          favorite_count?: number | null
          id?: string
          is_boosted?: boolean | null
          listing_id?: string
          message?: string | null
          offer_amount?: number
          offer_type?: string | null
          rejected_at?: string | null
          response_message?: string | null
          seller_id?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_settings: {
        Row: {
          base_listing_fee: number | null
          boost_14_days_price: number | null
          boost_30_days_price: number | null
          boost_7_days_price: number | null
          featured_auto_rotate: boolean | null
          featured_rotation_seconds: number | null
          free_listing_end_date: string | null
          free_listing_message: string | null
          free_listing_promotion: boolean | null
          free_listing_start_date: string | null
          id: string
          listing_duration_days: number | null
          listing_fee_enabled: boolean | null
          max_featured_listings: number | null
          updated_at: string | null
          updated_by: string | null
          vat_enabled: boolean | null
          vat_percentage: number | null
        }
        Insert: {
          base_listing_fee?: number | null
          boost_14_days_price?: number | null
          boost_30_days_price?: number | null
          boost_7_days_price?: number | null
          featured_auto_rotate?: boolean | null
          featured_rotation_seconds?: number | null
          free_listing_end_date?: string | null
          free_listing_message?: string | null
          free_listing_promotion?: boolean | null
          free_listing_start_date?: string | null
          id?: string
          listing_duration_days?: number | null
          listing_fee_enabled?: boolean | null
          max_featured_listings?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vat_enabled?: boolean | null
          vat_percentage?: number | null
        }
        Update: {
          base_listing_fee?: number | null
          boost_14_days_price?: number | null
          boost_30_days_price?: number | null
          boost_7_days_price?: number | null
          featured_auto_rotate?: boolean | null
          featured_rotation_seconds?: number | null
          free_listing_end_date?: string | null
          free_listing_message?: string | null
          free_listing_promotion?: boolean | null
          free_listing_start_date?: string | null
          id?: string
          listing_duration_days?: number | null
          listing_fee_enabled?: boolean | null
          max_featured_listings?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vat_enabled?: boolean | null
          vat_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string | null
          conversation_id: string
          created_at: string | null
          deleted_by_receiver: boolean | null
          deleted_by_sender: boolean | null
          id: string
          is_deleted_by_recipient: boolean | null
          is_deleted_by_sender: boolean | null
          is_read: boolean | null
          media_urls: Json | null
          message_type: string | null
          read_at: string | null
          sender_id: string
          thread_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          content?: string | null
          conversation_id: string
          created_at?: string | null
          deleted_by_receiver?: boolean | null
          deleted_by_sender?: boolean | null
          id?: string
          is_deleted_by_recipient?: boolean | null
          is_deleted_by_sender?: boolean | null
          is_read?: boolean | null
          media_urls?: Json | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
          thread_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          deleted_by_receiver?: boolean | null
          deleted_by_sender?: boolean | null
          id?: string
          is_deleted_by_recipient?: boolean | null
          is_deleted_by_sender?: boolean | null
          is_read?: boolean | null
          media_urls?: Json | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "bid_repair"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          payload: Json | null
          read_at: string | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          payload?: Json | null
          read_at?: string | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          payload?: Json | null
          read_at?: string | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_analytics: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          offer_id: string
          session_id: string | null
          source: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          offer_id: string
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          offer_id?: string
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_analytics_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_daily_analytics: {
        Row: {
          claims: number | null
          click_through_rate: number | null
          clicks: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          id: string
          impressions: number | null
          offer_id: string
          shares: number | null
          unique_visitors: number | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          claims?: number | null
          click_through_rate?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          impressions?: number | null
          offer_id: string
          shares?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          claims?: number | null
          click_through_rate?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          impressions?: number | null
          offer_id?: string
          shares?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_daily_analytics_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_redemptions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          offer_id: string
          redeemed_at: string | null
          redemption_code: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          offer_id: string
          redeemed_at?: string | null
          redemption_code: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          offer_id?: string
          redeemed_at?: string | null
          redemption_code?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_redemptions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          category: string | null
          click_through_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          discount_percent: number | null
          discounted_price: number | null
          favorite_count: number
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          max_redemptions: number | null
          original_price: number | null
          provider_id: string | null
          provider_name: string | null
          redemption_count: number | null
          terms: string | null
          title: string
          total_clicks: number | null
          total_impressions: number | null
          total_views: number | null
          unique_visitors: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          vendor_id: string
        }
        Insert: {
          category?: string | null
          click_through_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_percent?: number | null
          discounted_price?: number | null
          favorite_count?: number
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          max_redemptions?: number | null
          original_price?: number | null
          provider_id?: string | null
          provider_name?: string | null
          redemption_count?: number | null
          terms?: string | null
          title: string
          total_clicks?: number | null
          total_impressions?: number | null
          total_views?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vendor_id: string
        }
        Update: {
          category?: string | null
          click_through_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_percent?: number | null
          discounted_price?: number | null
          favorite_count?: number
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          max_redemptions?: number | null
          original_price?: number | null
          provider_id?: string | null
          provider_name?: string | null
          redemption_count?: number | null
          terms?: string | null
          title?: string
          total_clicks?: number | null
          total_impressions?: number | null
          total_views?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          order_type: string
          payment_intent_id: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_type: string
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_type?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          post_id: string
          reason: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          post_id: string
          reason: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_saves: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_stats: {
        Row: {
          comment_count: number | null
          like_count: number | null
          post_id: string
          save_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          comment_count?: number | null
          like_count?: number | null
          post_id: string
          save_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          comment_count?: number | null
          like_count?: number | null
          post_id?: string
          save_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_stats_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          community_id: string | null
          content: string
          created_at: string | null
          favorite_count: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_pinned: boolean | null
          likes_count: number
          location: string | null
          media_urls: string[] | null
          mentions: string[] | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          share_count: number | null
          shares_count: number
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
          views_count: number | null
        }
        Insert: {
          comments_count?: number
          community_id?: string | null
          content: string
          created_at?: string | null
          favorite_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number
          location?: string | null
          media_urls?: string[] | null
          mentions?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          share_count?: number | null
          shares_count?: number
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          views_count?: number | null
        }
        Update: {
          comments_count?: number
          community_id?: string | null
          content?: string
          created_at?: string | null
          favorite_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number
          location?: string | null
          media_urls?: string[] | null
          mentions?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          share_count?: number | null
          shares_count?: number
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge_color: string | null
          banned_until: string | null
          bid_wallet_balance: number | null
          bio: string | null
          cars: Json | null
          cover_image: string | null
          cover_image_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_banned: boolean | null
          is_email_verified: boolean | null
          is_verified: boolean | null
          language: string | null
          last_active_at: string | null
          last_login_at: string | null
          last_verification_reminder: string | null
          level: number | null
          location: string | null
          location_id: string | null
          meetups_attended: number | null
          phone: string | null
          phone_number: string | null
          referral_code: string | null
          referrals_count: number | null
          referred_by: string | null
          role: string | null
          sub_role: string | null
          total_comments: number | null
          total_likes_received: number | null
          total_posts: number | null
          updated_at: string | null
          username: string | null
          verification_completed_at: string | null
          verification_completed_by: string | null
          verification_documents: Json | null
          verification_notes: string | null
          verification_requested_at: string | null
          verification_status: string | null
          verified: boolean | null
          wallet_balance: number | null
          xp: number
          xp_level: number | null
          xp_level_name: string | null
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          badge_color?: string | null
          banned_until?: string | null
          bid_wallet_balance?: number | null
          bio?: string | null
          cars?: Json | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_banned?: boolean | null
          is_email_verified?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_active_at?: string | null
          last_login_at?: string | null
          last_verification_reminder?: string | null
          level?: number | null
          location?: string | null
          location_id?: string | null
          meetups_attended?: number | null
          phone?: string | null
          phone_number?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          role?: string | null
          sub_role?: string | null
          total_comments?: number | null
          total_likes_received?: number | null
          total_posts?: number | null
          updated_at?: string | null
          username?: string | null
          verification_completed_at?: string | null
          verification_completed_by?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          verification_requested_at?: string | null
          verification_status?: string | null
          verified?: boolean | null
          wallet_balance?: number | null
          xp?: number
          xp_level?: number | null
          xp_level_name?: string | null
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          badge_color?: string | null
          banned_until?: string | null
          bid_wallet_balance?: number | null
          bio?: string | null
          cars?: Json | null
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          is_email_verified?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_active_at?: string | null
          last_login_at?: string | null
          last_verification_reminder?: string | null
          level?: number | null
          location?: string | null
          location_id?: string | null
          meetups_attended?: number | null
          phone?: string | null
          phone_number?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          role?: string | null
          sub_role?: string | null
          total_comments?: number | null
          total_likes_received?: number | null
          total_posts?: number | null
          updated_at?: string | null
          username?: string | null
          verification_completed_at?: string | null
          verification_completed_by?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          verification_requested_at?: string | null
          verification_status?: string | null
          verified?: boolean | null
          wallet_balance?: number | null
          xp?: number
          xp_level?: number | null
          xp_level_name?: string | null
          xp_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_verification_completed_by_fkey"
            columns: ["verification_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          scheduled_at: string | null
          segment_rules: Json | null
          status: string | null
          template_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          segment_rules?: Json | null
          status?: string | null
          template_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          segment_rules?: Json | null
          status?: string | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "push_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      push_deliveries: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          device_token: string | null
          error_text: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          device_token?: string | null
          error_text?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          device_token?: string | null
          error_text?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "push_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_providers: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      push_segments: {
        Row: {
          created_at: string | null
          description: string | null
          filters: Json
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filters: Json
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          data: Json | null
          id: string
          locale: string | null
          name: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          locale?: string | null
          name: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          locale?: string | null
          name?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_claimed: boolean | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_bids: {
        Row: {
          bid_count: number | null
          budget_max: number | null
          budget_min: number | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          location_id: string | null
          media_urls: Json | null
          service_category_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          urgency: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          bid_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          media_urls?: Json | null
          service_category_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          bid_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          media_urls?: Json | null
          service_category_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_bids_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_bids_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_bids_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "user_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_content: {
        Row: {
          action_taken: string | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          moderator_id: string | null
          moderator_notes: string | null
          reason: string | null
          reporter_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string | null
          reporter_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          reason: string
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          reason: string
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string | null
          name_zh: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          name_zh?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          name_zh?: string | null
          slug?: string
        }
        Relationships: []
      }
      service_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          mileage: number
          next_service_date: string | null
          next_service_mileage: number | null
          notes: string | null
          provider: string | null
          service_date: string
          service_type: string
          updated_at: string | null
          user_id: string
          vehicle_name: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          mileage: number
          next_service_date?: string | null
          next_service_mileage?: number | null
          notes?: string | null
          provider?: string | null
          service_date: string
          service_type: string
          updated_at?: string | null
          user_id: string
          vehicle_name: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          mileage?: number
          next_service_date?: string | null
          next_service_mileage?: number | null
          notes?: string | null
          provider?: string | null
          service_date?: string
          service_type?: string
          updated_at?: string | null
          user_id?: string
          vehicle_name?: string
        }
        Relationships: []
      }
      smtp_configs: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string | null
          host: string
          id: string
          is_active: boolean | null
          name: string
          password: string
          port: number
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name?: string | null
          host: string
          id?: string
          is_active?: boolean | null
          name: string
          password: string
          port: number
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          host?: string
          id?: string
          is_active?: boolean | null
          name?: string
          password?: string
          port?: number
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      support_information: {
        Row: {
          address: string | null
          business_hours: Json | null
          city: string | null
          community_forum_url: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          email_support: string
          emergency_email: string | null
          emergency_phone: string | null
          facebook_url: string | null
          help_center_url: string | null
          id: string
          instagram_url: string | null
          knowledge_base_url: string | null
          linkedin_url: string | null
          office_address: string | null
          office_location: Json | null
          phone: string | null
          phone_support: string | null
          response_time: string | null
          social_media: Json | null
          twitter_url: string | null
          updated_at: string | null
          updated_by: string | null
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          city?: string | null
          community_forum_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_support: string
          emergency_email?: string | null
          emergency_phone?: string | null
          facebook_url?: string | null
          help_center_url?: string | null
          id?: string
          instagram_url?: string | null
          knowledge_base_url?: string | null
          linkedin_url?: string | null
          office_address?: string | null
          office_location?: Json | null
          phone?: string | null
          phone_support?: string | null
          response_time?: string | null
          social_media?: Json | null
          twitter_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          city?: string | null
          community_forum_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_support?: string
          emergency_email?: string | null
          emergency_phone?: string | null
          facebook_url?: string | null
          help_center_url?: string | null
          id?: string
          instagram_url?: string | null
          knowledge_base_url?: string | null
          linkedin_url?: string | null
          office_address?: string | null
          office_location?: Json | null
          phone?: string | null
          phone_support?: string | null
          response_time?: string | null
          social_media?: Json | null
          twitter_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_boosts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          listing_id: string | null
          offer_id: string | null
          package_id: string
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          listing_id?: string | null
          offer_id?: string | null
          package_id: string
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          listing_id?: string | null
          offer_id?: string | null
          package_id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_boosts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_offers_backup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "boost_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cars: {
        Row: {
          brand: string
          color: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          model: string
          plate_number: string | null
          updated_at: string | null
          user_id: string
          year: string
        }
        Insert: {
          brand: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          model: string
          plate_number?: string | null
          updated_at?: string | null
          user_id: string
          year: string
        }
        Update: {
          brand?: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          model?: string
          plate_number?: string | null
          updated_at?: string | null
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      user_daily_progress: {
        Row: {
          challenge_date: string
          challenge_id: string
          coins_earned: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          progress_count: number | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          challenge_date: string
          challenge_id: string
          coins_earned?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress_count?: number | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          challenge_date?: string
          challenge_id?: string
          coins_earned?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress_count?: number | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_email_settings: {
        Row: {
          categories: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          event_id: string | null
          garage_id: string | null
          id: string
          item_id: string
          item_type: string
          listing_id: string | null
          offer_id: string | null
          post_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          garage_id?: string | null
          id?: string
          item_id: string
          item_type: string
          listing_id?: string | null
          offer_id?: string | null
          post_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          garage_id?: string | null
          id?: string
          item_id?: string
          item_type?: string
          listing_id?: string | null
          offer_id?: string | null
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "user_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "user_favorites_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_offers_backup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          progress: number | null
          reward_xp: number | null
          target: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          progress?: number | null
          reward_xp?: number | null
          target: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          progress?: number | null
          reward_xp?: number | null
          target?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_push_settings: {
        Row: {
          categories: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_push_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          provider_type: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          provider_type?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          provider_type?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_vehicles: {
        Row: {
          brand_id: string | null
          color: string | null
          created_at: string | null
          fuel_type: string | null
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          license_plate: string | null
          make: string
          mileage: number | null
          model: string
          model_id: string | null
          nickname: string | null
          notes: string | null
          purchase_date: string | null
          transmission: string | null
          updated_at: string | null
          user_id: string
          verification_documents: Json | null
          verification_status: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          brand_id?: string | null
          color?: string | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          license_plate?: string | null
          make: string
          mileage?: number | null
          model: string
          model_id?: string | null
          nickname?: string | null
          notes?: string | null
          purchase_date?: string | null
          transmission?: string | null
          updated_at?: string | null
          user_id: string
          verification_documents?: Json | null
          verification_status?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          brand_id?: string | null
          color?: string | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          license_plate?: string | null
          make?: string
          mileage?: number | null
          model?: string
          model_id?: string | null
          nickname?: string | null
          notes?: string | null
          purchase_date?: string | null
          transmission?: string | null
          updated_at?: string | null
          user_id?: string
          verification_documents?: Json | null
          verification_status?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_vehicles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_history: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          user_id: string
          xp_amount: number
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_verifications: {
        Row: {
          admin_notes: string | null
          business_address: string
          business_email: string
          business_name: string
          business_phone: string
          business_photos_urls: Json | null
          business_type: string
          created_at: string | null
          emirate: string
          id: string
          location: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tax_certificate_url: string | null
          trade_license_number: string
          trade_license_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_address: string
          business_email: string
          business_name: string
          business_phone: string
          business_photos_urls?: Json | null
          business_type: string
          created_at?: string | null
          emirate: string
          id?: string
          location: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tax_certificate_url?: string | null
          trade_license_number: string
          trade_license_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_address?: string
          business_email?: string
          business_name?: string
          business_phone?: string
          business_photos_urls?: Json | null
          business_type?: string
          created_at?: string | null
          emirate?: string
          id?: string
          location?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tax_certificate_url?: string | null
          trade_license_number?: string
          trade_license_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verification_history: {
        Row: {
          admin_id: string | null
          created_at: string | null
          documents: Json | null
          id: string
          new_status: string
          notes: string | null
          previous_status: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          new_status: string
          notes?: string | null
          previous_status?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          created_at: string | null
          data: Json
          documents: string[] | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          documents?: string[] | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_type: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          documents?: string[] | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_balance: {
        Row: {
          balance: number
          created_at: string | null
          currency: string | null
          id: string
          total_deposited: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          total_deposited?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          total_deposited?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          related_bid_id: string | null
          source: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          transaction_type: string
          type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          related_bid_id?: string | null
          source?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          transaction_type: string
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          related_bid_id?: string | null
          source?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_related_bid_id_fkey"
            columns: ["related_bid_id"]
            isOneToOne: false
            referencedRelation: "bid_repair"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          points?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_rules: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_per_day: number | null
          updated_at: string | null
          xp_amount: number
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_per_day?: number | null
          updated_at?: string | null
          xp_amount: number
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_per_day?: number | null
          updated_at?: string | null
          xp_amount?: number
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          related_id: string | null
          related_type: string | null
          source: string
          type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          source: string
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          source?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_marketplace_stats: {
        Row: {
          accessory_listings: number | null
          active_listings: number | null
          boosted_listings: number | null
          car_listings: number | null
          part_listings: number | null
          pending_listings: number | null
          service_listings: number | null
          sold_listings: number | null
          total_favorites: number | null
          total_inquiries: number | null
          total_listings: number | null
          total_views: number | null
        }
        Relationships: []
      }
      event_stats: {
        Row: {
          event_id: string | null
          going_count: number | null
          interested_count: number | null
          like_count: number | null
          view_count: number | null
        }
        Relationships: []
      }
      garage_stats: {
        Row: {
          avg_rating: number | null
          garage_id: string | null
          review_count: number | null
          service_count: number | null
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          avatar_url: string | null
          badge_color: string | null
          display_name: string | null
          id: string | null
          percentile: number | null
          rank: number | null
          referrals_count: number | null
          sub_role: string | null
          username: string | null
          xp_level: number | null
          xp_level_name: string | null
          xp_points: number | null
        }
        Relationships: []
      }
      leaderboard_community: {
        Row: {
          avatar_url: string | null
          comments_count: number | null
          display_name: string | null
          id: string | null
          posts_count: number | null
          rank: number | null
          total_likes: number | null
          username: string | null
          xp: number | null
        }
        Relationships: []
      }
      leaderboard_events: {
        Row: {
          avatar: string | null
          display_name: string | null
          rank: number | null
          role: string | null
          score: number | null
          user_id: string | null
          xp_points: number | null
        }
        Relationships: []
      }
      leaderboard_marketplace: {
        Row: {
          avatar: string | null
          display_name: string | null
          rank: number | null
          role: string | null
          score: number | null
          user_id: string | null
          xp_points: number | null
        }
        Relationships: []
      }
      leaderboard_overall: {
        Row: {
          avatar: string | null
          display_name: string | null
          event_count: number | null
          listing_count: number | null
          location: string | null
          post_count: number | null
          rank: number | null
          role: string | null
          score: number | null
          user_id: string | null
        }
        Relationships: []
      }
      leaderboard_posts: {
        Row: {
          avatar: string | null
          display_name: string | null
          rank: number | null
          role: string | null
          score: number | null
          user_id: string | null
          xp_points: number | null
        }
        Relationships: []
      }
      leaderboard_view: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          email: string | null
          id: string | null
          post_count: number | null
          rank: number | null
          role: string | null
          streak_days: number | null
          xp_points: number | null
        }
        Relationships: []
      }
      marketplace_listings_with_seller: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          body_type: string | null
          boost_expires_at: string | null
          boost_package: string | null
          boost_payment_id: string | null
          brand: string | null
          car_brand: string | null
          car_condition: string | null
          car_fuel_type: string | null
          car_mileage: number | null
          car_model: string | null
          car_transmission: string | null
          car_year: number | null
          category: string | null
          color: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          customs_cleared: boolean | null
          description: string | null
          doors: number | null
          engine_capacity: string | null
          estimated_delivery_days: number | null
          expires_at: string | null
          favorite_count: number | null
          features: string[] | null
          horsepower: number | null
          id: string | null
          images: string[] | null
          inquiry_count: number | null
          is_boosted: boolean | null
          is_featured: boolean | null
          is_overseas: boolean | null
          is_seller_verified: boolean | null
          is_verified: boolean | null
          latitude: number | null
          listing_fee_paid: boolean | null
          listing_payment_amount: number | null
          listing_payment_id: string | null
          listing_type: string | null
          location: string | null
          longitude: number | null
          make: string | null
          mileage: number | null
          model: string | null
          origin_country: string | null
          price: number | null
          price_negotiable: boolean | null
          rejection_reason: string | null
          saves: number | null
          seats: number | null
          seller_avatar: string | null
          seller_name: string | null
          seller_phone: string | null
          seller_rating: number | null
          seller_rating_value: number | null
          seller_verified: boolean | null
          shipping_available: boolean | null
          sold_at: string | null
          specs: Json | null
          status: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          verification_badge: string | null
          view_count: number | null
          views: number | null
          warranty_available: boolean | null
          warranty_months: number | null
          whatsapp_number: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_events"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_marketplace"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_overall"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_posts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_analytics_summary: {
        Row: {
          click_through_rate: number | null
          clicks_24h: number | null
          clicks_7d: number | null
          conversion_rate: number | null
          impressions_24h: number | null
          impressions_7d: number | null
          last_activity: string | null
          offer_id: string | null
          total_claims: number | null
          total_clicks: number | null
          total_impressions: number | null
          total_shares: number | null
          total_views: number | null
          unique_sessions: number | null
          unique_visitors: number | null
          views_24h: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_analytics_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_to_favorites: {
        Args: { p_item_id: string; p_item_type: string; p_user_id: string }
        Returns: string
      }
      aggregate_offer_daily_analytics: { Args: never; Returns: undefined }
      apply_marketplace_boost: {
        Args: {
          p_boost_type: string
          p_cost: number
          p_duration_days: number
          p_listing_id: string
          p_payment_id?: string
        }
        Returns: Json
      }
      approve_post: {
        Args: { p_admin_id?: string; p_post_id: string }
        Returns: boolean
      }
      calculate_listing_total_price: {
        Args: never
        Returns: {
          base_fee: number
          is_free: boolean
          total_price: number
          vat_amount: number
        }[]
      }
      create_current_period: {
        Args: { period_type_param: string }
        Returns: string
      }
      ensure_post_stats_row: { Args: { p_post_id: string }; Returns: undefined }
      expire_marketplace_boosts: { Args: never; Returns: undefined }
      filter_marketplace_listings: {
        Args: {
          p_listing_type?: string
          p_location?: string
          p_make?: string
          p_max_price?: number
          p_min_price?: number
          p_origin_country?: string
          p_overseas_only?: boolean
          p_status?: string
          p_verified_only?: boolean
        }
        Returns: {
          color: string
          created_at: string
          description: string
          id: string
          images: string[]
          is_boosted: boolean
          is_featured: boolean
          is_overseas: boolean
          listing_type: string
          location: string
          make: string
          mileage: number
          model: string
          origin_country: string
          price: number
          saves: number
          seller_avatar: string
          seller_name: string
          seller_rating: number
          seller_verified: boolean
          title: string
          user_id: string
          views: number
          year: number
        }[]
      }
      fn_accept_bid_reply: {
        Args: { p_bid_id: string; p_reply_id: string }
        Returns: Json
      }
      fn_add_comment:
        | {
            Args: {
              p_body: string
              p_media?: string[]
              p_parent_id?: string
              p_post_id: string
            }
            Returns: {
              bot_agent_id: string | null
              content: string
              created_at: string | null
              id: string
              is_bot: boolean
              likes_count: number
              parent_comment_id: string | null
              parent_id: string | null
              post_id: string
              updated_at: string | null
              user_id: string
            }
            SetofOptions: {
              from: "*"
              to: "comments"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              p_body: string
              p_media?: Json
              p_parent_id?: string
              p_post_id: string
            }
            Returns: string
          }
      fn_admin_approve_verification: {
        Args: { p_notes?: string; p_user_id: string }
        Returns: Json
      }
      fn_admin_reject_verification: {
        Args: { p_notes: string; p_user_id: string }
        Returns: Json
      }
      fn_admin_request_reupload: {
        Args: { p_notes: string; p_user_id: string }
        Returns: Json
      }
      fn_award_xp: {
        Args: {
          p_amount: number
          p_description?: string
          p_related_id?: string
          p_related_type?: string
          p_source: string
          p_user_id: string
        }
        Returns: Json
      }
      fn_ban_referral: {
        Args: { p_reason: string; p_referral_id: string }
        Returns: Json
      }
      fn_create_bid: {
        Args: {
          p_description: string
          p_images?: string[]
          p_location?: Json
          p_title: string
          p_vehicle_info: Json
        }
        Returns: Json
      }
      fn_create_report: {
        Args: {
          _description?: string
          _entity_id: string
          _entity_type: string
          _reason: string
        }
        Returns: Json
      }
      fn_deduct_xp: {
        Args: { p_amount: number; p_reason: string; p_user_id: string }
        Returns: Json
      }
      fn_dismiss_verification_reminder: { Args: never; Returns: undefined }
      fn_export_listings: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          created_at: string
          id: string
          listing_type: string
          price: number
          seller_email: string
          status: string
          title: string
        }[]
      }
      fn_export_posts: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          body: string
          comment_count: number
          created_at: string
          id: string
          like_count: number
          status: string
          user_email: string
        }[]
      }
      fn_export_users: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
          verification_status: string
        }[]
      }
      fn_export_verifications: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          created_at: string
          id: string
          reviewed_at: string
          status: string
          user_email: string
          verification_type: string
        }[]
      }
      fn_get_comments: {
        Args: { p_post_id: string }
        Returns: {
          bot_agent_id: string | null
          content: string
          created_at: string | null
          id: string
          is_bot: boolean
          likes_count: number
          parent_comment_id: string | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "comments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fn_get_leaderboard_position: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      fn_get_post_with_stats: { Args: { p_post_id: string }; Returns: Json }
      fn_get_todays_challenges: {
        Args: { p_user_id?: string }
        Returns: {
          challenge_id: string
          challenge_type: string
          completed_at: string
          description: string
          difficulty: string
          target_count: number
          title: string
          user_progress: number
          user_status: string
          xp_reward: number
        }[]
      }
      fn_get_top_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          badge_color: string
          display_name: string
          rank: number
          referrals_count: number
          sub_role: string
          user_id: string
          username: string
          xp_level: number
          xp_level_name: string
          xp_points: number
        }[]
      }
      fn_process_referral: {
        Args: { p_referred_id?: string; p_referrer_code: string }
        Returns: Json
      }
      fn_reply_to_bid: {
        Args: {
          p_bid_id: string
          p_estimated_time?: string
          p_message: string
          p_quote_amount: number
          p_warranty_offered?: string
        }
        Returns: Json
      }
      fn_send_message: {
        Args: {
          p_attachments?: string[]
          p_body: string
          p_message_type?: string
          p_receiver_id: string
          p_thread_id: string
        }
        Returns: Json
      }
      fn_should_show_verification_reminder: { Args: never; Returns: boolean }
      fn_submit_verification: {
        Args: { p_documents: Json; p_sub_role: string }
        Returns: Json
      }
      fn_toggle_comment_like: { Args: { p_comment_id: string }; Returns: Json }
      fn_toggle_like: { Args: { _post_id: string }; Returns: Json }
      fn_toggle_post_like: { Args: { p_post_id: string }; Returns: Json }
      fn_toggle_post_save: { Args: { p_post_id: string }; Returns: Json }
      fn_toggle_save: { Args: { _post_id: string }; Returns: Json }
      fn_topup_wallet: {
        Args: {
          p_amount: number
          p_garage_owner_id: string
          p_metadata?: Json
          p_stripe_payment_intent_id: string
        }
        Returns: Json
      }
      fn_track_share: {
        Args: { _post_id: string; _share_type: string }
        Returns: Json
      }
      fn_update_challenge_progress: {
        Args: { p_challenge_id: string; p_increment?: number }
        Returns: Json
      }
      generate_redemption_code: { Args: never; Returns: string }
      get_boost_prices: {
        Args: never
        Returns: {
          duration_14_days: number
          duration_30_days: number
          duration_7_days: number
        }[]
      }
      get_pending_verifications_count: {
        Args: never
        Returns: {
          car_owner_pending: number
          garage_owner_pending: number
          total_pending: number
          vendor_pending: number
        }[]
      }
      get_post_comment_count: { Args: { post_uuid: string }; Returns: number }
      get_post_like_count: { Args: { post_uuid: string }; Returns: number }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_favorites_count: {
        Args: { p_user_id: string }
        Returns: {
          events_count: number
          garages_count: number
          listings_count: number
          offers_count: number
          posts_count: number
          total_count: number
        }[]
      }
      get_user_rank: {
        Args: {
          category_param?: string
          period_param?: string
          user_id_param: string
        }
        Returns: {
          percentile: number
          rank: number
          score: number
          total_users: number
        }[]
      }
      get_user_verification_status: {
        Args: { p_user_id: string }
        Returns: {
          car_owner_status: string
          garage_owner_status: string
          vendor_status: string
        }[]
      }
      increment_offer_redemptions: {
        Args: { offer_id: string }
        Returns: undefined
      }
      increment_post_views: { Args: { post_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_favorited: {
        Args: { p_item_id: string; p_item_type: string; p_user_id: string }
        Returns: boolean
      }
      refresh_offer_analytics_summary: { Args: never; Returns: undefined }
      reject_post: {
        Args: { p_admin_id?: string; p_post_id: string; p_reason: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      toggle_favorite: {
        Args: { p_item_id: string; p_item_type: string; p_user_id: string }
        Returns: boolean
      }
      toggle_marketplace_favorite: {
        Args: { listing_uuid: string; user_uuid: string }
        Returns: Json
      }
      toggle_marketplace_featured: {
        Args: { p_featured: boolean; p_listing_id: string }
        Returns: Json
      }
      track_offer_analytics: {
        Args: {
          p_event_type: string
          p_offer_id: string
          p_session_id?: string
          p_source?: string
        }
        Returns: undefined
      }
      update_challenge_progress: {
        Args: {
          p_challenge_id: string
          p_increment?: number
          p_user_id: string
        }
        Returns: {
          challenge_date: string
          challenge_id: string
          coins_earned: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          progress_count: number | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        SetofOptions: {
          from: "*"
          to: "user_daily_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_leaderboard_snapshot: { Args: never; Returns: undefined }
      user_has_favorited: {
        Args: { item_uuid: string; type: string; user_uuid: string }
        Returns: boolean
      }
      user_has_liked_post: {
        Args: { post_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
