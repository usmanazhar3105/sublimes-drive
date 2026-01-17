Initialising login role...
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
      ad_campaigns: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
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
      ad_placements: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          created_at: string | null
          id: string
          image_url: string | null
          impressions: number | null
          link_url: string | null
          placement_type: string
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          link_url?: string | null
          placement_type: string
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          link_url?: string | null
          placement_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_stats: {
        Row: {
          clicks: number | null
          cost: number | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          placement_id: string | null
          revenue: number | null
        }
        Insert: {
          clicks?: number | null
          cost?: number | null
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          placement_id?: string | null
          revenue?: number | null
        }
        Update: {
          clicks?: number | null
          cost?: number | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          placement_id?: string | null
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_stats_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "ad_placements"
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
        Relationships: []
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
      ai_activity_log_freya: {
        Row: {
          agent_id: string
          comment_id: string | null
          created_at: string
          event_type: string
          id: number
          language: string | null
          latency_ms: number | null
          message: string | null
          post_id: string | null
          sources: Json | null
          status: string
          thread_root_id: string | null
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          agent_id: string
          comment_id?: string | null
          created_at?: string
          event_type: string
          id?: number
          language?: string | null
          latency_ms?: number | null
          message?: string | null
          post_id?: string | null
          sources?: Json | null
          status: string
          thread_root_id?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          agent_id?: string
          comment_id?: string | null
          created_at?: string
          event_type?: string
          id?: number
          language?: string | null
          latency_ms?: number | null
          message?: string | null
          post_id?: string | null
          sources?: Json | null
          status?: string
          thread_root_id?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_activity_log_freya_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents_freya"
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
      ai_agent_settings_freya: {
        Row: {
          agent_id: string
          community_id: string | null
          id: number
          is_enabled: boolean
          language_default: string
          max_comment_len: number
          rate_per_day: number
          rate_per_hour: number
          rate_per_min: number
          safe_mode: boolean
          source_attribution: boolean
        }
        Insert: {
          agent_id: string
          community_id?: string | null
          id?: number
          is_enabled?: boolean
          language_default?: string
          max_comment_len?: number
          rate_per_day?: number
          rate_per_hour?: number
          rate_per_min?: number
          safe_mode?: boolean
          source_attribution?: boolean
        }
        Update: {
          agent_id?: string
          community_id?: string | null
          id?: number
          is_enabled?: boolean
          language_default?: string
          max_comment_len?: number
          rate_per_day?: number
          rate_per_hour?: number
          rate_per_min?: number
          safe_mode?: boolean
          source_attribution?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_settings_freya_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents_freya"
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
      ai_agents_freya: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          gender: string | null
          handle: string
          id: string
          is_enabled: boolean
          name: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          handle: string
          id?: string
          is_enabled?: boolean
          name: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          handle?: string
          id?: string
          is_enabled?: boolean
          name?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_freya_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      ai_comment_threads_freya: {
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
            foreignKeyName: "ai_comment_threads_freya_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents_freya"
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
      ai_post_responses_freya: {
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
            foreignKeyName: "ai_post_responses_freya_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents_freya"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_rate_limits: {
        Row: {
          agent_id: string
          bucket: string
          count: number
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          bucket: string
          count?: number
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          bucket?: string
          count?: number
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_rate_limits_freya: {
        Row: {
          agent_id: string
          bucket: string
          count: number
          created_at: string
          id: number
        }
        Insert: {
          agent_id: string
          bucket: string
          count?: number
          created_at?: string
          id?: number
        }
        Update: {
          agent_id?: string
          bucket?: string
          count?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_freya_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents_freya"
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
        Relationships: []
      }
      article_translations: {
        Row: {
          article_id: string | null
          content: string
          id: string
          locale: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          content: string
          id?: string
          locale: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          content?: string
          id?: string
          locale?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log_enterprise: {
        Row: {
          action: string
          actor: string | null
          actor_email: string | null
          actor_role: string | null
          created_at: string | null
          details: Json | null
          entity: string
          entity_id: string | null
          environment: string | null
          id: number
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          actor_email?: string | null
          actor_role?: string | null
          created_at?: string | null
          details?: Json | null
          entity: string
          entity_id?: string | null
          environment?: string | null
          id?: number
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          actor_email?: string | null
          actor_role?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string
          entity_id?: string | null
          environment?: string | null
          id?: number
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string | null
          details: Json | null
          entity: string
          entity_id: string | null
          entity_type: string | null
          id: string
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string | null
          details?: Json | null
          entity: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string | null
          details?: Json | null
          entity?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      auto_approval_rules: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_json: Json | null
          scope: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_json?: Json | null
          scope: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_json?: Json | null
          scope?: string
          updated_at?: string | null
        }
        Relationships: []
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
      bid_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "bid_threads"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        ]
      }
      bid_replies: {
        Row: {
          bid_id: string | null
          created_at: string | null
          eta_days: number | null
          garage_id: string | null
          id: string
          message: string | null
          price: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bid_id?: string | null
          created_at?: string | null
          eta_days?: number | null
          garage_id?: string | null
          id?: string
          message?: string | null
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_id?: string | null
          created_at?: string | null
          eta_days?: number | null
          garage_id?: string | null
          id?: string
          message?: string | null
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_replies_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_requests: {
        Row: {
          body: string | null
          car_meta: Json | null
          created_at: string | null
          id: string
          owner_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          car_meta?: Json | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          car_meta?: Json | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bid_threads: {
        Row: {
          bid_reply_id: string
          bid_request_id: string
          created_at: string | null
          garage_owner_id: string
          id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          bid_reply_id: string
          bid_request_id: string
          created_at?: string | null
          garage_owner_id: string
          id?: string
          requester_id: string
          status?: string | null
        }
        Update: {
          bid_reply_id?: string
          bid_request_id?: string
          created_at?: string | null
          garage_owner_id?: string
          id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_threads_bid_reply_id_fkey"
            columns: ["bid_reply_id"]
            isOneToOne: false
            referencedRelation: "bid_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_threads_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      bid_wallet_ledger: {
        Row: {
          created_at: string | null
          delta: number
          garage_id: string | null
          id: string
          reason: string | null
          ref: string | null
        }
        Insert: {
          created_at?: string | null
          delta: number
          garage_id?: string | null
          id?: string
          reason?: string | null
          ref?: string | null
        }
        Update: {
          created_at?: string | null
          delta?: number
          garage_id?: string | null
          id?: string
          reason?: string | null
          ref?: string | null
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          created_at: string | null
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          hosted_invoice_url: string | null
          id: string
          order_id: string | null
          pdf_url: string | null
          status: string | null
          stripe_invoice_id: string | null
          total: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          order_id?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          total?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          order_id?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          total?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_prices: {
        Row: {
          active: boolean | null
          created_at: string | null
          currency: string | null
          id: string
          interval: string | null
          meta: Json | null
          nickname: string | null
          product_id: string | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          id: string
          interval?: string | null
          meta?: Json | null
          nickname?: string | null
          product_id?: string | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          id?: string
          interval?: string | null
          meta?: Json | null
          nickname?: string | null
          product_id?: string | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_products: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          kind: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id: string
          kind: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          kind?: string
          name?: string
        }
        Relationships: []
      }
      billing_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          owner_id: string
          owner_type: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          owner_id: string
          owner_type: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          owner_id?: string
          owner_type?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_active: boolean | null
          reason: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_active?: boolean | null
          reason: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_ips_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
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
        Relationships: []
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
      boosts: {
        Row: {
          active_until: string
          created_at: string | null
          duration_days: number
          id: string
          is_featured: boolean | null
          order_id: string | null
          placement: string | null
          plan_name: string | null
          price_id: string | null
          starts_at: string | null
          status: string | null
          target_id: string
          target_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active_until: string
          created_at?: string | null
          duration_days: number
          id?: string
          is_featured?: boolean | null
          order_id?: string | null
          placement?: string | null
          plan_name?: string | null
          price_id?: string | null
          starts_at?: string | null
          status?: string | null
          target_id: string
          target_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active_until?: string
          created_at?: string | null
          duration_days?: number
          id?: string
          is_featured?: boolean | null
          order_id?: string | null
          placement?: string | null
          plan_name?: string | null
          price_id?: string | null
          starts_at?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boosts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boosts_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      brand_colors: {
        Row: {
          created_at: string | null
          hex: string
          id: string
          is_active: boolean | null
          name: string
          usage: string | null
        }
        Insert: {
          created_at?: string | null
          hex: string
          id?: string
          is_active?: boolean | null
          name: string
          usage?: string | null
        }
        Update: {
          created_at?: string | null
          hex?: string
          id?: string
          is_active?: boolean | null
          name?: string
          usage?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          is_completed: boolean | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_completed?: boolean | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_completed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
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
        ]
      }
      comments: {
        Row: {
          bot_agent_id: string | null
          content: string
          created_at: string | null
          id: string
          is_bot: boolean
          is_edited: boolean | null
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
          is_edited?: boolean | null
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
          is_edited?: boolean | null
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
        Relationships: []
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
        ]
      }
      content_moderation_queue: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          reported_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          reported_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          reported_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_queue_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
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
        Relationships: []
      }
      core_app_config: {
        Row: {
          created_at: string | null
          data_type: string
          description: string | null
          is_secret: boolean | null
          key: string
          scope: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          data_type?: string
          description?: string | null
          is_secret?: boolean | null
          key: string
          scope?: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          data_type?: string
          description?: string | null
          is_secret?: boolean | null
          key?: string
          scope?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string | null
          discount_applied: number | null
          id: string
          order_id: string | null
          redeemed_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          discount_applied?: number | null
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          discount_applied?: number | null
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
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
      design_tokens: {
        Row: {
          created_at: string | null
          description: string | null
          group_name: string
          mode: string
          palette: string
          subgroup: string | null
          token: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_name: string
          mode?: string
          palette?: string
          subgroup?: string | null
          token: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_name?: string
          mode?: string
          palette?: string
          subgroup?: string | null
          token?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
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
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
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
            foreignKeyName: "event_likes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
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
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          event_id: string
          id: string
          owner_id: string
          qr_token: string
          status: string | null
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          owner_id: string
          qr_token: string
          status?: string | null
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          owner_id?: string
          qr_token?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_tickets_owner_id_fkey"
            columns: ["owner_id"]
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
            foreignKeyName: "event_views_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
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
          end_time: string | null
          ends_at: string | null
          event_date: string | null
          event_type: string | null
          favorite_count: number | null
          featured: boolean | null
          id: string
          images: Json | null
          is_featured: boolean | null
          is_online: boolean | null
          is_paid: boolean | null
          latitude: number | null
          location: string | null
          location_id: string | null
          location_lat: number | null
          location_lng: number | null
          location_point: unknown
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
          end_time?: string | null
          ends_at?: string | null
          event_date?: string | null
          event_type?: string | null
          favorite_count?: number | null
          featured?: boolean | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_online?: boolean | null
          is_paid?: boolean | null
          latitude?: number | null
          location?: string | null
          location_id?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_point?: unknown
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
          end_time?: string | null
          ends_at?: string | null
          event_date?: string | null
          event_type?: string | null
          favorite_count?: number | null
          featured?: boolean | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_online?: boolean | null
          is_paid?: boolean | null
          latitude?: number | null
          location?: string | null
          location_id?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_point?: unknown
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
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_variants: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          experiment_key: string
          id: string
          is_active: boolean | null
          start_date: string | null
          traffic_allocation: number | null
          updated_at: string | null
          variant_config: Json
          variant_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          experiment_key: string
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          traffic_allocation?: number | null
          updated_at?: string | null
          variant_config?: Json
          variant_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          experiment_key?: string
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          traffic_allocation?: number | null
          updated_at?: string | null
          variant_config?: Json
          variant_name?: string
        }
        Relationships: []
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
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
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
      feature_flags: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          enabled: boolean
          environment: string | null
          key: string
          targeting: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          enabled?: boolean
          environment?: string | null
          key: string
          targeting?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          enabled?: boolean
          environment?: string | null
          key?: string
          targeting?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      featured_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          created_by: string | null
          featured_until: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          created_by?: string | null
          featured_until?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          featured_until?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      freya_budget: {
        Row: {
          created_at: string
          day: string
          id: number
          tokens_used: number
        }
        Insert: {
          created_at?: string
          day: string
          id?: number
          tokens_used?: number
        }
        Update: {
          created_at?: string
          day?: string
          id?: number
          tokens_used?: number
        }
        Relationships: []
      }
      freya_image_assets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          storage_path?: string
        }
        Relationships: []
      }
      freya_post_state: {
        Row: {
          auto_comment_id: string | null
          created_at: string
          liked: boolean
          post_id: string
          summary_reply_comment_id: string | null
          updated_at: string
        }
        Insert: {
          auto_comment_id?: string | null
          created_at?: string
          liked?: boolean
          post_id: string
          summary_reply_comment_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_comment_id?: string | null
          created_at?: string
          liked?: boolean
          post_id?: string
          summary_reply_comment_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      freya_runs: {
        Row: {
          action: string
          cost_estimate: number | null
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          model: string | null
          post_id: string
          provider: string | null
          reason: string | null
          status: string
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          action: string
          cost_estimate?: number | null
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          model?: string | null
          post_id: string
          provider?: string | null
          reason?: string | null
          status?: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          action?: string
          cost_estimate?: number | null
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          model?: string | null
          post_id?: string
          provider?: string | null
          reason?: string | null
          status?: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: []
      }
      freya_secrets: {
        Row: {
          api_key: string
          created_at: string
          id: string
          provider: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          provider: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      freya_settings: {
        Row: {
          brand_whitelist: string
          created_at: string
          daily_token_cap: number
          id: string
          image_annotation_enabled: boolean
          locale: string
          model_text: string
          model_vision: string
          provider: string
          updated_at: string
        }
        Insert: {
          brand_whitelist?: string
          created_at?: string
          daily_token_cap?: number
          id?: string
          image_annotation_enabled?: boolean
          locale?: string
          model_text?: string
          model_vision?: string
          provider?: string
          updated_at?: string
        }
        Update: {
          brand_whitelist?: string
          created_at?: string
          daily_token_cap?: number
          id?: string
          image_annotation_enabled?: boolean
          locale?: string
          model_text?: string
          model_vision?: string
          provider?: string
          updated_at?: string
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
      garage_favorites: {
        Row: {
          created_at: string | null
          garage_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          garage_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          garage_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_favorites_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "garage_favorites_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_media: {
        Row: {
          caption: string | null
          created_at: string | null
          garage_id: string
          id: string
          sort_order: number | null
          thumbnail_url: string | null
          type: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          garage_id: string
          id?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          type?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          garage_id?: string
          id?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_media_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "garage_media_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
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
      garage_staff: {
        Row: {
          created_at: string | null
          garage_id: string
          id: string
          is_active: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          garage_id: string
          id?: string
          is_active?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          garage_id?: string
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_staff_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "garage_staff_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          address: string | null
          boost_expires_at: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          description_zh: string | null
          email: string | null
          favorite_count: number | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          is_boosted: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location_id: string | null
          location_point: unknown
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
          services: string[] | null
          slug: string
          updated_at: string | null
          verification_documents: Json | null
          verification_status: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          boost_expires_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          email?: string | null
          favorite_count?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_id?: string | null
          location_point?: unknown
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
          services?: string[] | null
          slug: string
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          boost_expires_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_zh?: string | null
          email?: string | null
          favorite_count?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_id?: string | null
          location_point?: unknown
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
          services?: string[] | null
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
        ]
      }
      home_banners: {
        Row: {
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      i18n_brandkit: {
        Row: {
          created_at: string | null
          default_locale: string | null
          fallback_chain: string[] | null
          fonts: Json | null
          id: boolean
          numbering: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_locale?: string | null
          fallback_chain?: string[] | null
          fonts?: Json | null
          id?: boolean
          numbering?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_locale?: string | null
          fallback_chain?: string[] | null
          fonts?: Json | null
          id?: boolean
          numbering?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i18n_brandkit_default_locale_fkey"
            columns: ["default_locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      i18n_entity_translations: {
        Row: {
          entity_id: string
          entity_type: string
          field: string
          id: string
          locale: string | null
          source_locale: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          field: string
          id?: string
          locale?: string | null
          source_locale?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          field?: string
          id?: string
          locale?: string | null
          source_locale?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "i18n_entity_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      i18n_key_translations: {
        Row: {
          key: string
          locale: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          key: string
          locale: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          key?: string
          locale?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "i18n_key_translations_key_fkey"
            columns: ["key"]
            isOneToOne: false
            referencedRelation: "i18n_keys"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "i18n_key_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      i18n_keys: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
        }
        Relationships: []
      }
      i18n_locales: {
        Row: {
          code: string
          created_at: string | null
          enabled: boolean | null
          name: string
          rtl: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          enabled?: boolean | null
          name: string
          rtl?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          enabled?: boolean | null
          name?: string
          rtl?: boolean | null
        }
        Relationships: []
      }
      i18n_media_text: {
        Row: {
          alt: string | null
          bucket: string
          caption: string | null
          id: string
          locale: string | null
          object_path: string
          updated_at: string | null
        }
        Insert: {
          alt?: string | null
          bucket: string
          caption?: string | null
          id?: string
          locale?: string | null
          object_path: string
          updated_at?: string | null
        }
        Update: {
          alt?: string | null
          bucket?: string
          caption?: string | null
          id?: string
          locale?: string | null
          object_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i18n_media_text_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      i18n_slugs: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          locale: string | null
          slug: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          locale?: string | null
          slug: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          locale?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "i18n_slugs_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      i18n_strings: {
        Row: {
          category: string | null
          context: Json | null
          created_at: string | null
          is_html: boolean | null
          key: string
          locale: string
          text: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          context?: Json | null
          created_at?: string | null
          is_html?: boolean | null
          key: string
          locale?: string
          text: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          context?: Json | null
          created_at?: string | null
          is_html?: boolean | null
          key?: string
          locale?: string
          text?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      instant_meetups: {
        Row: {
          created_at: string | null
          event_id: string | null
          expires_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          max_participants: number | null
          radius_km: number | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          expires_at: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          max_participants?: number | null
          radius_km?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          expires_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          max_participants?: number | null
          radius_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instant_meetups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "instant_meetups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instant_meetups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
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
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          garage_id: string
          id: string
          job_id: string
          paid_at: string | null
          status: string | null
          total_amount: number
          vat_amount: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id: string
          garage_id: string
          id?: string
          job_id: string
          paid_at?: string | null
          status?: string | null
          total_amount: number
          vat_amount?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          garage_id?: string
          id?: string
          job_id?: string
          paid_at?: string | null
          status?: string | null
          total_amount?: number
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "invoices_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "repair_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      item_comments: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          item_id: string
          item_type: string
          like_count: number | null
          parent_comment_id: string | null
          reply_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          item_id: string
          item_type: string
          like_count?: number | null
          parent_comment_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          item_id?: string
          item_type?: string
          like_count?: number | null
          parent_comment_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "item_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      item_likes: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      item_saves: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      item_shares: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          platform: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          platform?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          platform?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_messages: {
        Row: {
          created_at: string | null
          id: string
          is_from_garage: boolean | null
          job_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_from_garage?: boolean | null
          job_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_from_garage?: boolean | null
          job_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "repair_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          body: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          helpful_count: number | null
          id: string
          is_public: boolean | null
          slug: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          slug?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          slug?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      kb_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      kv_store_5d51a2fa: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
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
        ]
      }
      listing_analytics: {
        Row: {
          created_at: string | null
          event: string
          id: string
          ip_hash: string | null
          listing_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          ip_hash?: string | null
          listing_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          ip_hash?: string | null
          listing_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        ]
      }
      listing_stats: {
        Row: {
          listing_id: string
          save_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          listing_id: string
          save_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          listing_id?: string
          save_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_stats_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_views: {
        Row: {
          anon_hash: string | null
          id: string
          listing_id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          anon_hash?: string | null
          id?: string
          listing_id: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          anon_hash?: string | null
          id?: string
          listing_id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
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
        Relationships: []
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
        ]
      }
      marketplace_brands: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          location_point: unknown
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
          location_point?: unknown
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
          location_point?: unknown
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
        Relationships: []
      }
      marketplace_models: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          title: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          title: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "marketplace_brands"
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: Json | null
          bucket: string
          created_at: string | null
          created_by: string | null
          filename: string
          height: number | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          path: string
          purpose: string
          size_bytes: number | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          alt_text?: Json | null
          bucket: string
          created_at?: string | null
          created_by?: string | null
          filename: string
          height?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          path: string
          purpose: string
          size_bytes?: number | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: Json | null
          bucket?: string
          created_at?: string | null
          created_by?: string | null
          filename?: string
          height?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          path?: string
          purpose?: string
          size_bytes?: number | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_assets_registry: {
        Row: {
          alt_text: Json | null
          bucket: string
          created_at: string | null
          created_by: string | null
          filename: string
          height: number | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          path: string
          purpose: string
          size_bytes: number | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          alt_text?: Json | null
          bucket: string
          created_at?: string | null
          created_by?: string | null
          filename: string
          height?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          path: string
          purpose: string
          size_bytes?: number | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: Json | null
          bucket?: string
          created_at?: string | null
          created_by?: string | null
          filename?: string
          height?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          path?: string
          purpose?: string
          size_bytes?: number | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
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
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "bid_repair"
            referencedColumns: ["id"]
          },
        ]
      }
      mk_attributes: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_required: boolean | null
          name: string
          options: Json | null
          sort_order: number | null
          type: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          options?: Json | null
          sort_order?: number | null
          type?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          options?: Json | null
          sort_order?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mk_attributes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mk_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      mk_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mk_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mk_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          category: string | null
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          locale: string
          subject: string | null
          template_key: string
          updated_at: string | null
          updated_by: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          category?: string | null
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string
          subject?: string | null
          template_key: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          category?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string
          subject?: string | null
          template_key?: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notification_templates_unified: {
        Row: {
          body: string
          category: string | null
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          locale: string
          subject: string | null
          template_key: string
          updated_at: string | null
          updated_by: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          category?: string | null
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string
          subject?: string | null
          template_key: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          category?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string
          subject?: string | null
          template_key?: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json | null
        }
        Relationships: []
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
        Relationships: []
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
        ]
      }
      offer_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
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
      offer_favorites_new: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_favorites_new_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_favorites_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_locations: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          location_point: unknown
          name: string
          offer_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          location_point?: unknown
          name: string
          offer_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          location_point?: unknown
          name?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_locations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_media: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string
          sort_order: number | null
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          sort_order?: number | null
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
          sort_order?: number | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_media_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers_complete"
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
          redemption_status: string | null
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
          redemption_status?: string | null
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
          redemption_status?: string | null
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
        ]
      }
      offer_redemptions_new: {
        Row: {
          created_at: string | null
          id: string
          location_id: string | null
          offer_id: string
          qr_code: string | null
          redeemed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_id?: string | null
          offer_id: string
          qr_code?: string | null
          redeemed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_id?: string | null
          offer_id?: string
          qr_code?: string | null
          redeemed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_redemptions_new_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "offer_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_new_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_new_user_id_fkey"
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
          discount_percentage: number | null
          discounted_price: number | null
          favorite_count: number
          id: string
          image_url: string | null
          image_urls: Json | null
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          location_point: unknown
          max_redemptions: number | null
          offer_price: number | null
          original_price: number | null
          provider_id: string | null
          provider_name: string | null
          redemption_count: number | null
          redemptions_count: number | null
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
          views: number | null
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
          discount_percentage?: number | null
          discounted_price?: number | null
          favorite_count?: number
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          location_point?: unknown
          max_redemptions?: number | null
          offer_price?: number | null
          original_price?: number | null
          provider_id?: string | null
          provider_name?: string | null
          redemption_count?: number | null
          redemptions_count?: number | null
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
          views?: number | null
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
          discount_percentage?: number | null
          discounted_price?: number | null
          favorite_count?: number
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          location_point?: unknown
          max_redemptions?: number | null
          offer_price?: number | null
          original_price?: number | null
          provider_id?: string | null
          provider_name?: string | null
          redemption_count?: number | null
          redemptions_count?: number | null
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
          views?: number | null
        }
        Relationships: []
      }
      offers_complete: {
        Row: {
          category_id: string | null
          code: string | null
          created_at: string | null
          description: string
          discount_type: string | null
          discount_value: number | null
          final_price: number | null
          id: string
          is_exclusive: boolean | null
          is_featured: boolean | null
          location_point: unknown
          max_redemptions: number | null
          original_price: number | null
          redemption_count: number | null
          status: string | null
          terms: string | null
          title: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          vendor_id: string
        }
        Insert: {
          category_id?: string | null
          code?: string | null
          created_at?: string | null
          description: string
          discount_type?: string | null
          discount_value?: number | null
          final_price?: number | null
          id?: string
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          location_point?: unknown
          max_redemptions?: number | null
          original_price?: number | null
          redemption_count?: number | null
          status?: string | null
          terms?: string | null
          title: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vendor_id: string
        }
        Update: {
          category_id?: string | null
          code?: string | null
          created_at?: string | null
          description?: string
          discount_type?: string | null
          discount_value?: number | null
          final_price?: number | null
          id?: string
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          location_point?: unknown
          max_redemptions?: number | null
          original_price?: number | null
          redemption_count?: number | null
          status?: string | null
          terms?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_complete_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "offer_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_complete_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          meta: Json | null
          name: string | null
          order_id: string | null
          price_id: string | null
          quantity: number | null
          unit_amount: number | null
        }
        Insert: {
          id?: string
          meta?: Json | null
          name?: string | null
          order_id?: string | null
          price_id?: string | null
          quantity?: number | null
          unit_amount?: number | null
        }
        Update: {
          id?: string
          meta?: Json | null
          name?: string | null
          order_id?: string | null
          price_id?: string | null
          quantity?: number | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          kind: string
          meta: Json | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          kind: string
          meta?: Json | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          kind?: string
          meta?: Json | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      part_orders: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          order_id: string | null
          seller_id: string | null
          shipping_address: Json | null
          status: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          seller_id?: string | null
          shipping_address?: Json | null
          status?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          seller_id?: string | null
          shipping_address?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_orders_seller_id_fkey"
            columns: ["seller_id"]
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
        Relationships: []
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
        ]
      }
      post_stats: {
        Row: {
          comment_count: number | null
          like_count: number | null
          post_id: string
          save_count: number | null
          share_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          comment_count?: number | null
          like_count?: number | null
          post_id: string
          save_count?: number | null
          share_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          comment_count?: number | null
          like_count?: number | null
          post_id?: string
          save_count?: number | null
          share_count?: number | null
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
      post_views: {
        Row: {
          anon_hash: string | null
          id: string
          post_id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          anon_hash?: string | null
          id?: string
          post_id: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          anon_hash?: string | null
          id?: string
          post_id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          category: string | null
          comments_count: number
          community_id: string | null
          content: string
          created_at: string | null
          favorite_count: number | null
          featured: boolean | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_pinned: boolean | null
          likes_count: number
          location: string | null
          media: Json | null
          media_urls: string[] | null
          mentions: string[] | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          pinned: boolean | null
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
          body?: string | null
          category?: string | null
          comments_count?: number
          community_id?: string | null
          content: string
          created_at?: string | null
          favorite_count?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number
          location?: string | null
          media?: Json | null
          media_urls?: string[] | null
          mentions?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          pinned?: boolean | null
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
          body?: string | null
          category?: string | null
          comments_count?: number
          community_id?: string | null
          content?: string
          created_at?: string | null
          favorite_count?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number
          location?: string | null
          media?: Json | null
          media_urls?: string[] | null
          mentions?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          pinned?: boolean | null
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
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge_color: string | null
          badge_tier: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          garage_credit_balance: number | null
          id: string
          is_premium: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          last_seen: string | null
          level: number | null
          location: string | null
          meta: Json | null
          phone: string | null
          preferences: Json | null
          premium_expires_at: string | null
          presence: string | null
          referrals_count: number | null
          role: string | null
          sub_role: string | null
          updated_at: string | null
          username: string | null
          verification_status: string | null
          verified_at: string | null
          wallet_balance: number | null
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          badge_color?: string | null
          badge_tier?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          garage_credit_balance?: number | null
          id: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_seen?: string | null
          level?: number | null
          location?: string | null
          meta?: Json | null
          phone?: string | null
          preferences?: Json | null
          premium_expires_at?: string | null
          presence?: string | null
          referrals_count?: number | null
          role?: string | null
          sub_role?: string | null
          updated_at?: string | null
          username?: string | null
          verification_status?: string | null
          verified_at?: string | null
          wallet_balance?: number | null
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          badge_color?: string | null
          badge_tier?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          garage_credit_balance?: number | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_seen?: string | null
          level?: number | null
          location?: string | null
          meta?: Json | null
          phone?: string | null
          preferences?: Json | null
          premium_expires_at?: string | null
          presence?: string | null
          referrals_count?: number | null
          role?: string | null
          sub_role?: string | null
          updated_at?: string | null
          username?: string | null
          verification_status?: string | null
          verified_at?: string | null
          wallet_balance?: number | null
          xp_points?: number | null
        }
        Relationships: []
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
          points_awarded: number | null
          referred_id: string
          referrer_id: string
          reward_claimed: boolean | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          referred_id: string
          referrer_id: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          referred_id?: string
          referrer_id?: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          origin_id: string | null
          origin_type: string | null
          processed_at: string | null
          reason: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          origin_id?: string | null
          origin_type?: string | null
          processed_at?: string | null
          reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          origin_id?: string | null
          origin_type?: string | null
          processed_at?: string | null
          reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            foreignKeyName: "repair_bids_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "user_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_jobs: {
        Row: {
          awarded_garage_id: string | null
          created_at: string | null
          description: string
          id: string
          location_city: string | null
          location_point: unknown
          requester_id: string
          service_type: string
          status: string | null
          title: string
          vehicle_id: string | null
        }
        Insert: {
          awarded_garage_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          location_city?: string | null
          location_point?: unknown
          requester_id: string
          service_type: string
          status?: string | null
          title: string
          vehicle_id?: string | null
        }
        Update: {
          awarded_garage_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location_city?: string | null
          location_point?: unknown
          requester_id?: string
          service_type?: string
          status?: string | null
          title?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_jobs_awarded_garage_id_fkey"
            columns: ["awarded_garage_id"]
            isOneToOne: false
            referencedRelation: "garage_stats"
            referencedColumns: ["garage_id"]
          },
          {
            foreignKeyName: "repair_jobs_awarded_garage_id_fkey"
            columns: ["awarded_garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_jobs_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_jobs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
        Relationships: []
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
        Relationships: []
      }
      role_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string | null
          creator_id: string | null
          distance_km: number | null
          duration_min: number | null
          id: string
          is_public: boolean | null
          route_data: Json | null
          title: string
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          distance_km?: number | null
          duration_min?: number | null
          id?: string
          is_public?: boolean | null
          route_data?: Json | null
          title: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          distance_km?: number | null
          duration_min?: number | null
          id?: string
          is_public?: boolean | null
          route_data?: Json | null
          title?: string
        }
        Relationships: []
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
        Relationships: []
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
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_settings: {
        Row: {
          id: boolean
          lockout_duration_mins: number | null
          max_login_attempts: number | null
          require_2fa_admin: boolean | null
          session_timeout_mins: number | null
          updated_at: string | null
        }
        Insert: {
          id?: boolean
          lockout_duration_mins?: number | null
          max_login_attempts?: number | null
          require_2fa_admin?: boolean | null
          session_timeout_mins?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: boolean
          lockout_duration_mins?: number | null
          max_login_attempts?: number | null
          require_2fa_admin?: boolean | null
          session_timeout_mins?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_defaults: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          description: string | null
          keywords: string[] | null
          locale: string
          og_description: string | null
          og_image_id: string | null
          og_title: string | null
          og_type: string | null
          robots: string | null
          route: string
          schema_markup: Json | null
          title: string
          twitter_card: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          description?: string | null
          keywords?: string[] | null
          locale?: string
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          og_type?: string | null
          robots?: string | null
          route: string
          schema_markup?: Json | null
          title: string
          twitter_card?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          description?: string | null
          keywords?: string[] | null
          locale?: string
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          og_type?: string | null
          robots?: string | null
          route?: string
          schema_markup?: Json | null
          title?: string
          twitter_card?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_defaults_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media_assets_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          created_at: string | null
          difficulty: number | null
          id: string
          keyword: string
          page_id: string | null
          search_volume: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: number | null
          id?: string
          keyword: string
          page_id?: string | null
          search_volume?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty?: number | null
          id?: string
          keyword?: string
          page_id?: string | null
          search_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "seo_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_metrics: {
        Row: {
          avg_position: number | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          page_id: string | null
        }
        Insert: {
          avg_position?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          page_id?: string | null
        }
        Update: {
          avg_position?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          page_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_metrics_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "seo_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          description: string | null
          id: string
          keywords: string[] | null
          og_image: string | null
          path: string
          robots: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image?: string | null
          path: string
          robots?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image?: string | null
          path?: string
          robots?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value_json: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value_json?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value_json?: Json | null
        }
        Relationships: []
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
      support_messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      system_constants: {
        Row: {
          category: string
          created_at: string | null
          is_active: boolean | null
          key: string
          label: Json
          metadata: Json | null
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          category: string
          created_at?: string | null
          is_active?: boolean | null
          key: string
          label?: Json
          metadata?: Json | null
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          category?: string
          created_at?: string | null
          is_active?: boolean | null
          key?: string
          label?: Json
          metadata?: Json | null
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          category: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          level: string
          message: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          level: string
          message: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          level?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      ticket_tiers: {
        Row: {
          capacity: number
          created_at: string | null
          event_id: string
          id: string
          is_free: boolean | null
          name: string
          price: number
          sold: number | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          event_id: string
          id?: string
          is_free?: boolean | null
          name: string
          price?: number
          sold?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          event_id?: string
          id?: string
          is_free?: boolean | null
          name?: string
          price?: number
          sold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
          },
        ]
      }
      typography_scales: {
        Row: {
          created_at: string | null
          font_family: string
          font_size_px: number
          id: string
          line_height: number | null
          name: string
          usage: string | null
        }
        Insert: {
          created_at?: string | null
          font_family: string
          font_size_px: number
          id?: string
          line_height?: number | null
          name: string
          usage?: string | null
        }
        Update: {
          created_at?: string | null
          font_family?: string
          font_size_px?: number
          id?: string
          line_height?: number | null
          name?: string
          usage?: string | null
        }
        Relationships: []
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
      user_consents: {
        Row: {
          consent_given: boolean | null
          consented_at: string | null
          id: string
          ip_address: string | null
          legal_page_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_given?: boolean | null
          consented_at?: string | null
          id?: string
          ip_address?: string | null
          legal_page_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean | null
          consented_at?: string | null
          id?: string
          ip_address?: string | null
          legal_page_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_legal_page_id_fkey"
            columns: ["legal_page_id"]
            isOneToOne: false
            referencedRelation: "legal_pages"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
            foreignKeyName: "user_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_stats"
            referencedColumns: ["event_id"]
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
        Relationships: []
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
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          device_type: string | null
          ended_at: string | null
          id: string
          ip_address: unknown
          last_activity_at: string | null
          os: string | null
          session_id: string
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          os?: string | null
          session_id: string
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          os?: string | null
          session_id?: string
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
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
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          model: string
          owner_id: string
          plate_number: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          model: string
          owner_id: string
          plate_number?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          model?: string
          owner_id?: string
          plate_number?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_staff: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_staff_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          username: string | null
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
          username?: string | null
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
          username?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          banner_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          business_address: string | null
          business_license: string | null
          business_name: string | null
          car_photos: string[] | null
          chassis_number: string | null
          created_at: string | null
          data: Json
          documents: string[] | null
          id: string
          registration_number: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string | null
          trade_license: string | null
          type: string
          updated_at: string | null
          user_id: string
          verification_type: string
        }
        Insert: {
          admin_notes?: string | null
          business_address?: string | null
          business_license?: string | null
          business_name?: string | null
          car_photos?: string[] | null
          chassis_number?: string | null
          created_at?: string | null
          data?: Json
          documents?: string[] | null
          id?: string
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string | null
          trade_license?: string | null
          type?: string
          updated_at?: string | null
          user_id: string
          verification_type: string
        }
        Update: {
          admin_notes?: string | null
          business_address?: string | null
          business_license?: string | null
          business_name?: string | null
          car_photos?: string[] | null
          chassis_number?: string | null
          created_at?: string | null
          data?: Json
          documents?: string[] | null
          id?: string
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string | null
          trade_license?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          verification_type?: string
        }
        Relationships: []
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
        Relationships: []
      }
      wallet_ledger: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          kind: string
          meta: Json | null
          ref_id: string | null
          ref_type: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          kind: string
          meta?: Json | null
          ref_id?: string | null
          ref_type?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          kind?: string
          meta?: Json | null
          ref_id?: string | null
          ref_type?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_ledger_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "billing_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          ref_type: string | null
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
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          ref_type?: string | null
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
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          ref_type?: string | null
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
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          points?: number
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          points?: number
          type?: string | null
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
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
      v_app_stats_day: {
        Row: {
          active_users: number | null
          sessions: number | null
          stat_date: string | null
          total_events: number | null
        }
        Relationships: []
      }
      v_config_overview: {
        Row: {
          description: string | null
          key: string | null
          scope: string | null
          source: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_event_stats: {
        Row: {
          attendee_count: number | null
          event_id: string | null
          like_count: number | null
          view_count: number | null
        }
        Relationships: []
      }
      v_i18n_completion: {
        Row: {
          available_locales: string[] | null
          key: string | null
          last_updated: string | null
          locale_count: number | null
        }
        Relationships: []
      }
      v_module_stats_day: {
        Row: {
          event_count: number | null
          event_name: string | null
          stat_date: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      vw_verifications_union: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          documents: string[] | null
          id: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: never
          created_at?: string | null
          documents?: string[] | null
          id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: never
          created_at?: string | null
          documents?: string[] | null
          id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      add_to_favorites: {
        Args: { p_item_id: string; p_item_type: string; p_user_id: string }
        Returns: string
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
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
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      ensure_post_stats_row: { Args: { p_post_id: string }; Returns: undefined }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
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
      fn_accept_bid:
        | { Args: { p_reply_id: string }; Returns: Json }
        | { Args: { p_bid_id: string; p_reply_id: string }; Returns: boolean }
      fn_accept_bid_reply: {
        Args: { p_bid_id: string; p_reply_id: string }
        Returns: Json
      }
      fn_add_comment: {
        Args: { p_content: string; p_parent_id?: string; p_post_id: string }
        Returns: Json
      }
      fn_add_item_comment: {
        Args: {
          _content: string
          _item_id: string
          _item_type: string
          _parent_comment_id?: string
        }
        Returns: Json
      }
      fn_admin_approve_verification: {
        Args: { p_notes?: string; p_user_id: string }
        Returns: Json
      }
      fn_admin_boost_approve: { Args: { p_boost_id: string }; Returns: boolean }
      fn_admin_boost_refund: { Args: { p_boost_id: string }; Returns: boolean }
      fn_admin_pin_feature:
        | {
            Args: { p_action: string; p_post_id: string; p_value: boolean }
            Returns: boolean
          }
        | {
            Args: {
              p_entity_id: string
              p_entity_type: string
              p_is_featured?: boolean
              p_is_pinned?: boolean
            }
            Returns: boolean
          }
        | { Args: { p_action: string; p_post_id: string }; Returns: Json }
      fn_admin_reject_verification: {
        Args: { p_notes: string; p_user_id: string }
        Returns: Json
      }
      fn_admin_request_reupload: {
        Args: { p_notes: string; p_user_id: string }
        Returns: Json
      }
      fn_admin_set_listing_status:
        | {
            Args: { p_listing_id: string; p_notes?: string; p_status: string }
            Returns: Json
          }
        | { Args: { p_listing_id: string; p_status: string }; Returns: Json }
      fn_admin_set_post_status: {
        Args: { p_post_id: string; p_status: string }
        Returns: Json
      }
      fn_admin_verify:
        | {
            Args: {
              p_decision: string
              p_id: string
              p_reason?: string
              p_type: string
            }
            Returns: undefined
          }
        | {
            Args: { p_notes?: string; p_request_id: string; p_status: string }
            Returns: Json
          }
      fn_ai_get_thread_root: {
        Args: { p_agent_id: string; p_post_id: string }
        Returns: string
      }
      fn_ai_increment_rate: {
        Args: { p_agent_id: string; p_bucket: string }
        Returns: boolean
      }
      fn_ai_is_in_thread: {
        Args: { p_comment_id: string; p_thread_root_id: string }
        Returns: boolean
      }
      fn_ai_should_respond: {
        Args: { p_agent_id: string; p_post_id: string }
        Returns: boolean
      }
      fn_award_bid: {
        Args: { p_bid_id: string; p_job_id: string }
        Returns: Json
      }
      fn_award_referral_xp: {
        Args: { p_referred_id: string; p_referrer_id: string }
        Returns: boolean
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
      fn_can_message: {
        Args: { p_request_id: string; p_user_id: string }
        Returns: boolean
      }
      fn_claim_challenge: { Args: { p_challenge_id: string }; Returns: Json }
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
      fn_create_bid_request:
        | {
            Args: {
              p_budget_max?: number
              p_budget_min?: number
              p_description: string
              p_images?: Json
              p_location?: string
              p_title: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_budget?: number
              p_category?: string
              p_description: string
              p_images?: string[]
              p_title: string
            }
            Returns: Json
          }
      fn_create_garage: {
        Args: {
          p_address?: string
          p_city?: string
          p_description?: string
          p_email?: string
          p_name: string
          p_phone?: string
        }
        Returns: Json
      }
      fn_create_post: {
        Args: {
          p_body: string
          p_community_id?: string
          p_media?: Json
          p_tags?: string[]
          p_title: string
        }
        Returns: string
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
      fn_delete_comment: { Args: { p_comment_id: string }; Returns: boolean }
      fn_delete_item_comment: { Args: { _comment_id: string }; Returns: Json }
      fn_dismiss_verification_reminder: { Args: never; Returns: undefined }
      fn_edit_comment: {
        Args: { p_comment_id: string; p_content: string }
        Returns: Json
      }
      fn_email_preview: {
        Args: { p_template_id: string; p_variables?: Json }
        Returns: Json
      }
      fn_email_resolve_segment: {
        Args: { p_segment_filter: Json }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      fn_email_schedule: {
        Args: { p_campaign_id: string; p_schedule_for: string }
        Returns: boolean
      }
      fn_email_send_now: { Args: { p_campaign_id: string }; Returns: boolean }
      fn_email_unsubscribe: {
        Args: { p_email: string; p_reason?: string }
        Returns: boolean
      }
      fn_events_search_radius: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km: number
        }
        Returns: {
          distance_km: number
          event_id: string
        }[]
      }
      fn_export_events: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          attendee_count: number
          id: string
          organizer_email: string
          start_date: string
          title: string
        }[]
      }
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
      fn_export_run: { Args: { kind: string; params: Json }; Returns: string }
      fn_export_transactions: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          amount: number
          created_at: string
          id: string
          transaction_type: string
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
      fn_export_verifications:
        | {
            Args: { p_status?: string }
            Returns: {
              created_at: string
              id: string
              status: string
              user_email: string
              verification_type: string
            }[]
          }
        | {
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
      fn_garage_search_radius: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km: number
        }
        Returns: {
          distance_km: number
          garage_id: string
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
          is_edited: boolean | null
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
      fn_get_pending_verifications_count: { Args: never; Returns: Json }
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
      fn_grant_boost_after_payment:
        | {
            Args: {
              p_boost_type: string
              p_duration_days: number
              p_entity_id: string
              p_entity_type: string
              p_stripe_payment_id: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: { p_days: number; p_entity_id: string; p_entity_type: string }
            Returns: Json
          }
      fn_marketplace_search_radius: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km: number
        }
        Returns: {
          distance_km: number
          listing_id: string
        }[]
      }
      fn_meetup_search_radius: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km: number
        }
        Returns: {
          distance_km: number
          meetup_id: string
        }[]
      }
      fn_post_bid: {
        Args: {
          p_description: string
          p_media?: string[]
          p_title: string
          p_vehicle_info?: Json
        }
        Returns: string
      }
      fn_process_referral: {
        Args: { p_referred_id?: string; p_referrer_code: string }
        Returns: Json
      }
      fn_push_preview: {
        Args: { p_template_id: string; p_variables?: Json }
        Returns: Json
      }
      fn_push_resolve_segment:
        | { Args: { p_segment_id: string }; Returns: number }
        | { Args: { p_segment_filter: Json }; Returns: string[] }
      fn_push_schedule: {
        Args: { p_campaign_id: string; p_schedule_for: string }
        Returns: boolean
      }
      fn_push_send_now: { Args: { p_campaign_id: string }; Returns: boolean }
      fn_register_event_view:
        | {
            Args: { p_event_id: string; p_ip_address?: unknown }
            Returns: Json
          }
        | {
            Args: { p_event_id: string; p_viewer_id?: string }
            Returns: boolean
          }
      fn_register_listing_view:
        | {
            Args: { p_ip_address?: unknown; p_listing_id: string }
            Returns: Json
          }
        | {
            Args: { p_anon_hash?: string; p_listing_id: string }
            Returns: boolean
          }
      fn_register_post_view:
        | { Args: { p_ip_address?: unknown; p_post_id: string }; Returns: Json }
        | {
            Args: { p_anon_hash?: string; p_post_id: string }
            Returns: boolean
          }
      fn_reply_bid: {
        Args: {
          p_bid_id: string
          p_estimated_duration?: string
          p_estimated_price?: number
          p_media?: string[]
          p_message: string
        }
        Returns: string
      }
      fn_reply_to_bid:
        | {
            Args: {
              p_bid_id: string
              p_estimated_time?: string
              p_message: string
              p_quote_amount: number
              p_warranty_offered?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_bid_request_id: string
              p_estimated_duration_hours?: number
              p_garage_id: string
              p_message: string
              p_price: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_amount: number
              p_estimated_days?: number
              p_message: string
              p_request_id: string
            }
            Returns: Json
          }
      fn_rsvp_event: {
        Args: { p_event_id: string; p_status?: string }
        Returns: Json
      }
      fn_select_role: { Args: { p_sub_role: string }; Returns: Json }
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
      fn_set_role_and_verify_prompt: { Args: { p_role: string }; Returns: Json }
      fn_should_show_verification_reminder: { Args: never; Returns: boolean }
      fn_submit_listing_for_review: {
        Args: { p_listing_id: string }
        Returns: Json
      }
      fn_toggle_comment_like: { Args: { p_comment_id: string }; Returns: Json }
      fn_toggle_event_like: { Args: { p_event_id: string }; Returns: boolean }
      fn_toggle_item_like: {
        Args: { _item_id: string; _item_type: string }
        Returns: Json
      }
      fn_toggle_item_save: {
        Args: { _item_id: string; _item_type: string }
        Returns: Json
      }
      fn_toggle_like: { Args: { p_post_id: string }; Returns: Json }
      fn_toggle_listing_save: { Args: { p_listing_id: string }; Returns: Json }
      fn_toggle_post_like: { Args: { p_post_id: string }; Returns: Json }
      fn_toggle_post_save: { Args: { p_post_id: string }; Returns: Json }
      fn_toggle_save: { Args: { p_post_id: string }; Returns: Json }
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
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
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
      gettransactionid: { Args: never; Returns: unknown }
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
      log_event: { Args: { p_name: string; p_props?: Json }; Returns: string }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      refresh_offer_analytics_summary: { Args: never; Returns: undefined }
      reject_post: {
        Args: { p_admin_id?: string; p_post_id: string; p_reason: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
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
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
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
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
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
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
