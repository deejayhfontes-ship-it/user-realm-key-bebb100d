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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_providers: {
        Row: {
          api_key_encrypted: string | null
          api_type: string
          created_at: string | null
          created_by: string | null
          custom_headers: Json | null
          endpoint_url: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_error: string | null
          last_test_at: string | null
          last_test_success: boolean | null
          max_tokens: number | null
          model_name: string | null
          name: string
          request_template: Json | null
          response_path: string | null
          slug: string
          supports_images: boolean | null
          system_prompt: string | null
          temperature: number | null
          timeout_seconds: number | null
          total_requests: number | null
          total_tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_type?: string
          created_at?: string | null
          created_by?: string | null
          custom_headers?: Json | null
          endpoint_url: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_error?: string | null
          last_test_at?: string | null
          last_test_success?: boolean | null
          max_tokens?: number | null
          model_name?: string | null
          name: string
          request_template?: Json | null
          response_path?: string | null
          slug: string
          supports_images?: boolean | null
          system_prompt?: string | null
          temperature?: number | null
          timeout_seconds?: number | null
          total_requests?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_type?: string
          created_at?: string | null
          created_by?: string | null
          custom_headers?: Json | null
          endpoint_url?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_error?: string | null
          last_test_at?: string | null
          last_test_success?: boolean | null
          max_tokens?: number | null
          model_name?: string | null
          name?: string
          request_template?: Json | null
          response_path?: string | null
          slug?: string
          supports_images?: boolean | null
          system_prompt?: string | null
          temperature?: number | null
          timeout_seconds?: number | null
          total_requests?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_providers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      art_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          editable_layers: Json | null
          file_size_bytes: number | null
          file_url: string
          generator_id: string
          height: number
          id: string
          name: string
          preview_url: string
          width: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          editable_layers?: Json | null
          file_size_bytes?: number | null
          file_url: string
          generator_id: string
          height: number
          id?: string
          name: string
          preview_url: string
          width: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          editable_layers?: Json | null
          file_size_bytes?: number | null
          file_url?: string
          generator_id?: string
          height?: number
          id?: string
          name?: string
          preview_url?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "art_templates_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generator_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "art_templates_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generators"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          arquivo_urls: Json | null
          assigned_to: string | null
          budget_id: string | null
          created_at: string | null
          descricao: string
          email: string
          empresa: string | null
          id: string
          nome: string
          notas_internas: string | null
          prazo: string | null
          prioridade: string | null
          proposal_id: string | null
          referencias: string | null
          status: string | null
          telefone: string | null
          tipo_projeto: string | null
          updated_at: string | null
        }
        Insert: {
          arquivo_urls?: Json | null
          assigned_to?: string | null
          budget_id?: string | null
          created_at?: string | null
          descricao: string
          email: string
          empresa?: string | null
          id?: string
          nome: string
          notas_internas?: string | null
          prazo?: string | null
          prioridade?: string | null
          proposal_id?: string | null
          referencias?: string | null
          status?: string | null
          telefone?: string | null
          tipo_projeto?: string | null
          updated_at?: string | null
        }
        Update: {
          arquivo_urls?: Json | null
          assigned_to?: string | null
          budget_id?: string | null
          created_at?: string | null
          descricao?: string
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          notas_internas?: string | null
          prazo?: string | null
          prioridade?: string | null
          proposal_id?: string | null
          referencias?: string | null
          status?: string | null
          telefone?: string | null
          tipo_projeto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefings_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefings_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_lines: {
        Row: {
          budget_id: string | null
          catalog_item_id: string | null
          created_at: string | null
          description: string
          discount_type: string | null
          discount_value: number | null
          id: string
          quantity: number | null
          sort_order: number | null
          total: number
          unit_price: number
        }
        Insert: {
          budget_id?: string | null
          catalog_item_id?: string | null
          created_at?: string | null
          description: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          quantity?: number | null
          sort_order?: number | null
          total: number
          unit_price: number
        }
        Update: {
          budget_id?: string | null
          catalog_item_id?: string | null
          created_at?: string | null
          description?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          quantity?: number | null
          sort_order?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          budget_number: string
          client_address: string | null
          client_document: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          global_discount_type: string | null
          global_discount_value: number | null
          id: string
          notes: string | null
          shipping: number | null
          status: string | null
          subtotal: number
          terms_and_conditions: string | null
          total: number
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          budget_number: string
          client_address?: string | null
          client_document?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          global_discount_type?: string | null
          global_discount_value?: number | null
          id?: string
          notes?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          budget_number?: string
          client_address?: string | null
          client_document?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          global_discount_type?: string | null
          global_discount_value?: number | null
          id?: string
          notes?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: []
      }
      catalog_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_price: number
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sku: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_price: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_price?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_generators: {
        Row: {
          allowed_weekdays: number[] | null
          assigned_at: string | null
          assigned_by: string | null
          client_id: string
          credits_limit: number | null
          credits_used: number | null
          enabled: boolean | null
          generator_id: string
          id: string
          time_limit_end: string | null
          time_limit_start: string | null
        }
        Insert: {
          allowed_weekdays?: number[] | null
          assigned_at?: string | null
          assigned_by?: string | null
          client_id: string
          credits_limit?: number | null
          credits_used?: number | null
          enabled?: boolean | null
          generator_id: string
          id?: string
          time_limit_end?: string | null
          time_limit_start?: string | null
        }
        Update: {
          allowed_weekdays?: number[] | null
          assigned_at?: string | null
          assigned_by?: string | null
          client_id?: string
          credits_limit?: number | null
          credits_used?: number | null
          enabled?: boolean | null
          generator_id?: string
          id?: string
          time_limit_end?: string | null
          time_limit_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_generators_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_generators_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_generators_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_generators_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generator_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_generators_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generators"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          access_expires_at: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          id: string
          logo_url: string | null
          monthly_credits: number | null
          name: string
          notes: string | null
          package_credits: number | null
          package_credits_used: number | null
          package_type: string | null
          phone: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          access_expires_at?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          monthly_credits?: number | null
          name: string
          notes?: string | null
          package_credits?: number | null
          package_credits_used?: number | null
          package_type?: string | null
          phone?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          access_expires_at?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          monthly_credits?: number | null
          name?: string
          notes?: string | null
          package_credits?: number | null
          package_credits_used?: number | null
          package_type?: string | null
          phone?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          company_address: string | null
          company_document: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          default_notes: string | null
          id: string
          logo_url: string | null
          show_criate_logo: boolean | null
          show_fontes_logo: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_address?: string | null
          company_document?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          default_notes?: string | null
          id?: string
          logo_url?: string | null
          show_criate_logo?: boolean | null
          show_fontes_logo?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_address?: string | null
          company_document?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          default_notes?: string | null
          id?: string
          logo_url?: string | null
          show_criate_logo?: boolean | null
          show_fontes_logo?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generations: {
        Row: {
          base_image_url: string | null
          client_id: string
          created_at: string | null
          error_message: string | null
          generated_images: Json | null
          generator_id: string
          id: string
          input_data: Json | null
          ip_address: unknown
          processing_time_ms: number | null
          prompt: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          base_image_url?: string | null
          client_id: string
          created_at?: string | null
          error_message?: string | null
          generated_images?: Json | null
          generator_id: string
          id?: string
          input_data?: Json | null
          ip_address?: unknown
          processing_time_ms?: number | null
          prompt?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          base_image_url?: string | null
          client_id?: string
          created_at?: string | null
          error_message?: string | null
          generated_images?: Json | null
          generator_id?: string
          id?: string
          input_data?: Json | null
          ip_address?: unknown
          processing_time_ms?: number | null
          prompt?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generator_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      generator_edit_history: {
        Row: {
          ai_response: string | null
          attachments: Json | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          generator_id: string
          id: string
          new_config: Json
          old_config: Json
          processing_time_ms: number | null
          provider_id: string | null
          success: boolean | null
          tokens_used: number | null
          user_prompt: string
        }
        Insert: {
          ai_response?: string | null
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          generator_id: string
          id?: string
          new_config: Json
          old_config: Json
          processing_time_ms?: number | null
          provider_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_prompt: string
        }
        Update: {
          ai_response?: string | null
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          generator_id?: string
          id?: string
          new_config?: Json
          old_config?: Json
          processing_time_ms?: number | null
          provider_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "generator_edit_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generator_edit_history_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generator_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generator_edit_history_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generator_edit_history_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      generators: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          installed_at: string | null
          installed_via: string | null
          name: string
          preview_image_url: string | null
          slug: string
          sort_order: number | null
          status: string | null
          template_url: string | null
          type: string
          updated_at: string | null
          zip_file_path: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          installed_at?: string | null
          installed_via?: string | null
          name: string
          preview_image_url?: string | null
          slug: string
          sort_order?: number | null
          status?: string | null
          template_url?: string | null
          type: string
          updated_at?: string | null
          zip_file_path?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          installed_at?: string | null
          installed_via?: string | null
          name?: string
          preview_image_url?: string | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          template_url?: string | null
          type?: string
          updated_at?: string | null
          zip_file_path?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          bill_to_address: string | null
          bill_to_company: string | null
          bill_to_email: string | null
          bill_to_name: string
          created_at: string | null
          created_by: string | null
          date: string | null
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          items: Json | null
          notes: string | null
          pix_code: string | null
          pix_config: Json | null
          pix_config_id: string | null
          pix_generated_at: string | null
          pix_txid: string | null
          ship_to_email: string | null
          ship_to_event: string | null
          ship_to_location: string | null
          ship_to_name: string
          ship_to_phone: string | null
          status: string | null
          tax_rate: number | null
          total: number
          updated_at: string | null
          wise_config: Json | null
        }
        Insert: {
          bill_to_address?: string | null
          bill_to_company?: string | null
          bill_to_email?: string | null
          bill_to_name: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          items?: Json | null
          notes?: string | null
          pix_code?: string | null
          pix_config?: Json | null
          pix_config_id?: string | null
          pix_generated_at?: string | null
          pix_txid?: string | null
          ship_to_email?: string | null
          ship_to_event?: string | null
          ship_to_location?: string | null
          ship_to_name: string
          ship_to_phone?: string | null
          status?: string | null
          tax_rate?: number | null
          total: number
          updated_at?: string | null
          wise_config?: Json | null
        }
        Update: {
          bill_to_address?: string | null
          bill_to_company?: string | null
          bill_to_email?: string | null
          bill_to_name?: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json | null
          notes?: string | null
          pix_code?: string | null
          pix_config?: Json | null
          pix_config_id?: string | null
          pix_generated_at?: string | null
          pix_txid?: string | null
          ship_to_email?: string | null
          ship_to_event?: string | null
          ship_to_location?: string | null
          ship_to_name?: string
          ship_to_phone?: string | null
          status?: string | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
          wise_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_pix_config_id_fkey"
            columns: ["pix_config_id"]
            isOneToOne: false
            referencedRelation: "pix_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          credits: number
          description: string | null
          duration_days: number
          featured: boolean | null
          generator_ids: string[] | null
          id: string
          name: string
          price: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          credits: number
          description?: string | null
          duration_days: number
          featured?: boolean | null
          generator_ids?: string[] | null
          id?: string
          name: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          credits?: number
          description?: string | null
          duration_days?: number
          featured?: boolean | null
          generator_ids?: string[] | null
          id?: string
          name?: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_configs: {
        Row: {
          api_key_encrypted: string | null
          config_json: Json | null
          created_at: string | null
          gateway_name: string
          id: string
          is_active: boolean | null
          sandbox_mode: boolean | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          config_json?: Json | null
          created_at?: string | null
          gateway_name: string
          id?: string
          is_active?: boolean | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          config_json?: Json | null
          created_at?: string | null
          gateway_name?: string
          id?: string
          is_active?: boolean | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          created_at: string | null
          credits_included: number
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price_cents: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_included?: number
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price_cents: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_included?: number
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price_cents?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          client_id: string | null
          created_at: string | null
          currency: string | null
          customer_gateway_id: string | null
          external_id: string | null
          failure_reason: string | null
          gateway: string
          id: string
          next_billing_at: string | null
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          status: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_gateway_id?: string | null
          external_id?: string | null
          failure_reason?: string | null
          gateway: string
          id?: string
          next_billing_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_gateway_id?: string | null
          external_id?: string | null
          failure_reason?: string | null
          gateway?: string
          id?: string
          next_billing_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_configs: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          is_default: boolean | null
          key_type: string | null
          merchant_city: string
          merchant_name: string
          nickname: string | null
          pix_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          is_default?: boolean | null
          key_type?: string | null
          merchant_city?: string
          merchant_name?: string
          nickname?: string | null
          pix_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          is_default?: boolean | null
          key_type?: string | null
          merchant_city?: string
          merchant_name?: string
          nickname?: string | null
          pix_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      proposal_settings: {
        Row: {
          company_address: string | null
          company_document: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string | null
          created_by: string | null
          default_notes: string | null
          default_payment_conditions: string | null
          id: string
          logo_url: string | null
          show_criate_logo: boolean | null
          show_fontes_logo: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_address?: string | null
          company_document?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          created_by?: string | null
          default_notes?: string | null
          default_payment_conditions?: string | null
          id?: string
          logo_url?: string | null
          show_criate_logo?: boolean | null
          show_fontes_logo?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_address?: string | null
          company_document?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          created_by?: string | null
          default_notes?: string | null
          default_payment_conditions?: string | null
          id?: string
          logo_url?: string | null
          show_criate_logo?: boolean | null
          show_fontes_logo?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          contract_period_months: number | null
          created_at: string | null
          created_by: string | null
          date: string | null
          estimated_days: number | null
          id: string
          investment_value: number
          notes: string | null
          payment_conditions: string | null
          project_description: string | null
          project_title: string
          proposal_number: string
          recurrence_type: string | null
          scope_items: Json | null
          status: string | null
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          contract_period_months?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          estimated_days?: number | null
          id?: string
          investment_value: number
          notes?: string | null
          payment_conditions?: string | null
          project_description?: string | null
          project_title: string
          proposal_number: string
          recurrence_type?: string | null
          scope_items?: Json | null
          status?: string | null
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          contract_period_months?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          estimated_days?: number | null
          id?: string
          investment_value?: number
          notes?: string | null
          payment_conditions?: string | null
          project_description?: string | null
          project_title?: string
          proposal_number?: string
          recurrence_type?: string | null
          scope_items?: Json | null
          status?: string | null
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          login_count: number | null
          password_hash: string
          role: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          login_count?: number | null
          password_hash: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          login_count?: number | null
          password_hash?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          gateway: string
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          gateway: string
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          gateway?: string
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      client_stats: {
        Row: {
          credits_remaining: number | null
          expires_at: string | null
          generators_available: number | null
          id: string | null
          name: string | null
          status: string | null
          total_generations: number | null
          type: string | null
        }
        Relationships: []
      }
      generator_usage: {
        Row: {
          avg_processing_time: number | null
          clients_using: number | null
          id: string | null
          name: string | null
          status: string | null
          total_generations: number | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_package_expiration: { Args: never; Returns: undefined }
      generate_invoice_number: { Args: never; Returns: string }
      generate_proposal_number: { Args: never; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
  public: {
    Enums: {},
  },
} as const
