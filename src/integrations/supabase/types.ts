<<<<<<< HEAD
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
      access_pages: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      briefing_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          schema_json: Json
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          schema_json?: Json
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          schema_json?: Json
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefing_templates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
          discount_amount: number | null
          discount_reason: string | null
          expires_at: string | null
          global_discount_type: string | null
          global_discount_value: number | null
          id: string
          notes: string | null
          parent_quote_id: string | null
          pedido_id: string | null
          shipping: number | null
          status: string | null
          subtotal: number
          terms_and_conditions: string | null
          total: number
          updated_at: string | null
          validity_days: number | null
          version: number | null
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
          discount_amount?: number | null
          discount_reason?: string | null
          expires_at?: string | null
          global_discount_type?: string | null
          global_discount_value?: number | null
          id?: string
          notes?: string | null
          parent_quote_id?: string | null
          pedido_id?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string | null
          validity_days?: number | null
          version?: number | null
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
          discount_amount?: number | null
          discount_reason?: string | null
          expires_at?: string | null
          global_discount_type?: string | null
          global_discount_value?: number | null
          id?: string
          notes?: string | null
          parent_quote_id?: string | null
          pedido_id?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string | null
          validity_days?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_parent_quote_id_fkey"
            columns: ["parent_quote_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
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
      channel_settings: {
        Row: {
          behance_url: string | null
          contact_email: string | null
          created_at: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          support_hours: string | null
          updated_at: string | null
          user_id: string
          whatsapp_default_message: string | null
          whatsapp_number: string | null
          whatsapp_show_float_button: boolean | null
          youtube_url: string | null
        }
        Insert: {
          behance_url?: string | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          support_hours?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_default_message?: string | null
          whatsapp_number?: string | null
          whatsapp_show_float_button?: boolean | null
          youtube_url?: string | null
        }
        Update: {
          behance_url?: string | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          support_hours?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_default_message?: string | null
          whatsapp_number?: string | null
          whatsapp_show_float_button?: boolean | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      chat_config: {
        Row: {
          atalhos: Json | null
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          delay_boas_vindas: number | null
          dias_atendimento: string[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          mensagem_boas_vindas: string | null
          posicao: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          atalhos?: Json | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          delay_boas_vindas?: number | null
          dias_atendimento?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          mensagem_boas_vindas?: string | null
          posicao?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          atalhos?: Json | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          delay_boas_vindas?: number | null
          dias_atendimento?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          mensagem_boas_vindas?: string | null
          posicao?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_mensagens: {
        Row: {
          anexo_url: string | null
          enviada_em: string | null
          id: string
          lida: boolean | null
          mensagem: string
          remetente_id: string | null
          remetente_tipo: string
          sessao_id: string
        }
        Insert: {
          anexo_url?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          remetente_id?: string | null
          remetente_tipo: string
          sessao_id: string
        }
        Update: {
          anexo_url?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          remetente_id?: string | null
          remetente_tipo?: string
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "chat_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessoes: {
        Row: {
          atendente_id: string | null
          client_id: string | null
          created_at: string | null
          encerrado_em: string | null
          id: string
          iniciado_em: string | null
          ip_visitante: string | null
          pagina_origem: string | null
          session_id: string
          status: string | null
          updated_at: string | null
          user_agent: string | null
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          atendente_id?: string | null
          client_id?: string | null
          created_at?: string | null
          encerrado_em?: string | null
          id?: string
          iniciado_em?: string | null
          ip_visitante?: string | null
          pagina_origem?: string | null
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          atendente_id?: string | null
          client_id?: string | null
          created_at?: string | null
          encerrado_em?: string | null
          id?: string
          iniciado_em?: string | null
          ip_visitante?: string | null
          pagina_origem?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessoes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessoes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      client_permissions: {
        Row: {
          client_id: string
          created_at: string | null
          granted: boolean | null
          id: string
          page_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          granted?: boolean | null
          id?: string
          page_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          granted?: boolean | null
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_permissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_permissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_permissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "access_pages"
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
      company_about: {
        Row: {
          about_image_url: string | null
          clients_count: string | null
          created_at: string | null
          differentials: Json | null
          foundation_year: string | null
          full_description: string | null
          headline: string | null
          id: string
          mission: string | null
          projects_count: string | null
          story_title: string | null
          team_size: string | null
          updated_at: string | null
          user_id: string
          values: Json | null
          vision: string | null
        }
        Insert: {
          about_image_url?: string | null
          clients_count?: string | null
          created_at?: string | null
          differentials?: Json | null
          foundation_year?: string | null
          full_description?: string | null
          headline?: string | null
          id?: string
          mission?: string | null
          projects_count?: string | null
          story_title?: string | null
          team_size?: string | null
          updated_at?: string | null
          user_id: string
          values?: Json | null
          vision?: string | null
        }
        Update: {
          about_image_url?: string | null
          clients_count?: string | null
          created_at?: string | null
          differentials?: Json | null
          foundation_year?: string | null
          full_description?: string | null
          headline?: string | null
          id?: string
          mission?: string | null
          projects_count?: string | null
          story_title?: string | null
          team_size?: string | null
          updated_at?: string | null
          user_id?: string
          values?: Json | null
          vision?: string | null
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
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          project_type_id: string | null
          read_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          project_type_id?: string | null
          read_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          project_type_id?: string | null
          read_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_project_type_id_fkey"
            columns: ["project_type_id"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          arquivos: Json | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_whatsapp: string | null
          created_at: string
          data_envio: string | null
          dias_validade: number | null
          enviado_por_email: boolean | null
          enviado_por_whatsapp: boolean | null
          expira_em: string | null
          id: string
          link_acesso: string | null
          link_externo: string | null
          mensagem: string | null
          pedido_id: string
          protocolo: string
          revogado_em: string | null
          revogado_por: string | null
          servico_nome: string | null
          status: string | null
          tipo: string | null
          token: string
          total_acessos: number | null
          total_downloads: number | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          arquivos?: Json | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          data_envio?: string | null
          dias_validade?: number | null
          enviado_por_email?: boolean | null
          enviado_por_whatsapp?: boolean | null
          expira_em?: string | null
          id?: string
          link_acesso?: string | null
          link_externo?: string | null
          mensagem?: string | null
          pedido_id: string
          protocolo: string
          revogado_em?: string | null
          revogado_por?: string | null
          servico_nome?: string | null
          status?: string | null
          tipo?: string | null
          token: string
          total_acessos?: number | null
          total_downloads?: number | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          arquivos?: Json | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          data_envio?: string | null
          dias_validade?: number | null
          enviado_por_email?: boolean | null
          enviado_por_whatsapp?: boolean | null
          expira_em?: string | null
          id?: string
          link_acesso?: string | null
          link_externo?: string | null
          mensagem?: string | null
          pedido_id?: string
          protocolo?: string
          revogado_em?: string | null
          revogado_por?: string | null
          servico_nome?: string | null
          status?: string | null
          tipo?: string | null
          token?: string
          total_acessos?: number | null
          total_downloads?: number | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas_logs: {
        Row: {
          created_at: string
          descricao: string | null
          entrega_id: string | null
          evento: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          entrega_id?: string | null
          evento: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          entrega_id?: string | null
          evento?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_logs_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "entregas"
            referencedColumns: ["id"]
          },
        ]
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
      geradores_vip: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          rota_frontend: string | null
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          rota_frontend?: string | null
          slug: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          rota_frontend?: string | null
          slug?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_editable: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_editable?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_editable?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
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
      legal_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nfe_configs: {
        Row: {
          ambiente: string | null
          api_key: string | null
          api_provider: string | null
          api_secret: string | null
          bairro: string | null
          cep: string | null
          certificado_base64: string | null
          certificado_senha: string | null
          certificado_validade: string | null
          cnpj: string
          codigo_municipio_ibge: string | null
          complemento: string | null
          created_at: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logradouro: string | null
          municipio: string | null
          nome_fantasia: string | null
          numero: string | null
          proximo_numero_nfe: number | null
          proximo_numero_nfse: number | null
          razao_social: string
          regime_tributario: string | null
          serie_nfe: string | null
          serie_nfse: string | null
          uf: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ambiente?: string | null
          api_key?: string | null
          api_provider?: string | null
          api_secret?: string | null
          bairro?: string | null
          cep?: string | null
          certificado_base64?: string | null
          certificado_senha?: string | null
          certificado_validade?: string | null
          cnpj: string
          codigo_municipio_ibge?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          proximo_numero_nfe?: number | null
          proximo_numero_nfse?: number | null
          razao_social: string
          regime_tributario?: string | null
          serie_nfe?: string | null
          serie_nfse?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ambiente?: string | null
          api_key?: string | null
          api_provider?: string | null
          api_secret?: string | null
          bairro?: string | null
          cep?: string | null
          certificado_base64?: string | null
          certificado_senha?: string | null
          certificado_validade?: string | null
          cnpj?: string
          codigo_municipio_ibge?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          proximo_numero_nfe?: number | null
          proximo_numero_nfse?: number | null
          razao_social?: string
          regime_tributario?: string | null
          serie_nfe?: string | null
          serie_nfse?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notas_fiscais: {
        Row: {
          cfop: string | null
          chave_acesso: string | null
          cliente_cpf_cnpj: string
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_id: string | null
          cliente_municipio: string | null
          cliente_nome: string
          cliente_uf: string | null
          codigo_servico_municipio: string | null
          cofins_valor: number | null
          created_at: string | null
          data_competencia: string | null
          data_emissao: string | null
          descricao_servico: string
          id: string
          invoice_id: string | null
          issqn_aliquota: number | null
          issqn_retido: boolean | null
          issqn_valor: number | null
          motivo_status: string | null
          natureza_operacao: string | null
          numero: number
          pdf_url: string | null
          pis_valor: number | null
          protocolo: string | null
          serie: string | null
          status: string | null
          tipo: string
          updated_at: string | null
          user_id: string
          valor_desconto: number | null
          valor_liquido: number
          valor_servico: number
          xml_url: string | null
        }
        Insert: {
          cfop?: string | null
          chave_acesso?: string | null
          cliente_cpf_cnpj: string
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: string | null
          cliente_municipio?: string | null
          cliente_nome: string
          cliente_uf?: string | null
          codigo_servico_municipio?: string | null
          cofins_valor?: number | null
          created_at?: string | null
          data_competencia?: string | null
          data_emissao?: string | null
          descricao_servico: string
          id?: string
          invoice_id?: string | null
          issqn_aliquota?: number | null
          issqn_retido?: boolean | null
          issqn_valor?: number | null
          motivo_status?: string | null
          natureza_operacao?: string | null
          numero: number
          pdf_url?: string | null
          pis_valor?: number | null
          protocolo?: string | null
          serie?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id: string
          valor_desconto?: number | null
          valor_liquido: number
          valor_servico: number
          xml_url?: string | null
        }
        Update: {
          cfop?: string | null
          chave_acesso?: string | null
          cliente_cpf_cnpj?: string
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: string | null
          cliente_municipio?: string | null
          cliente_nome?: string
          cliente_uf?: string | null
          codigo_servico_municipio?: string | null
          cofins_valor?: number | null
          created_at?: string | null
          data_competencia?: string | null
          data_emissao?: string | null
          descricao_servico?: string
          id?: string
          invoice_id?: string | null
          issqn_aliquota?: number | null
          issqn_retido?: boolean | null
          issqn_valor?: number | null
          motivo_status?: string | null
          natureza_operacao?: string | null
          numero?: number
          pdf_url?: string | null
          pis_valor?: number | null
          protocolo?: string | null
          serie?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
          valor_desconto?: number | null
          valor_liquido?: number
          valor_servico?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      order_activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string | null
          created_at: string | null
          details: Json | null
          id: string
          pedido_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          pedido_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_activity_logs_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      order_deliverables: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          downloaded_at: string | null
          expires_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_final: boolean | null
          pedido_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          downloaded_at?: string | null
          expires_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_final?: boolean | null
          pedido_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          downloaded_at?: string | null
          expires_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_final?: boolean | null
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_deliverables_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      order_revisions: {
        Row: {
          admin_response: string | null
          created_at: string | null
          description: string
          extra_cost: number | null
          files: Json | null
          id: string
          is_extra: boolean | null
          pedido_id: string
          requested_by: string | null
          resolved_at: string | null
          revision_number: number
          status: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          description: string
          extra_cost?: number | null
          files?: Json | null
          id?: string
          is_extra?: boolean | null
          pedido_id: string
          requested_by?: string | null
          resolved_at?: string | null
          revision_number: number
          status?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          description?: string
          extra_cost?: number | null
          files?: Json | null
          id?: string
          is_extra?: boolean | null
          pedido_id?: string
          requested_by?: string | null
          resolved_at?: string | null
          revision_number?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_revisions_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
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
      partner_logos: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          logo_url: string
          nome: string
          ordem: number
          site_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          logo_url: string
          nome: string
          ordem?: number
          site_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          logo_url?: string
          nome?: string
          ordem?: number
          site_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_section_settings: {
        Row: {
          created_at: string
          id: string
          show_section: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          show_section?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          show_section?: boolean | null
          updated_at?: string
          user_id?: string
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
      payment_installments: {
        Row: {
          amount: number
          comprovante_url: string | null
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          paid_at: string | null
          payment_method: string | null
          pedido_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          comprovante_url?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          paid_at?: string | null
          payment_method?: string | null
          pedido_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          comprovante_url?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          paid_at?: string | null
          payment_method?: string | null
          pedido_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_installments_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
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
      pedidos: {
        Row: {
          archived_at: string | null
          arquivo_urls: Json | null
          arquivos_entregues: Json | null
          avaliacao_comentario: string | null
          avaliacao_nota: number | null
          briefing_completeness_score: number | null
          briefing_data: Json | null
          briefing_template_id: string | null
          client_id: string | null
          comprovante_url: string | null
          condicao_pagamento: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_briefing: string | null
          data_emissao_nf: string | null
          data_entrega: string | null
          data_inicio_confeccao: string | null
          data_orcamento: string | null
          data_pagamento: string | null
          data_pagamento_final: string | null
          descricao: string
          discount_amount: number | null
          discount_reason: string | null
          email: string
          empresa: string | null
          id: string
          max_revisions: number | null
          mensagem_entrega: string | null
          motivo_recusa: string | null
          nome: string
          nota_fiscal_emitida: boolean | null
          nps_comment: string | null
          nps_score: number | null
          numero_nota_fiscal: string | null
          observacoes_admin: string | null
          order_type: string | null
          payment_mode: string | null
          prazo_final: string | null
          prazo_orcado: number | null
          prazo_solicitado: string | null
          protocolo: string
          public_token: string | null
          referencias: string | null
          requer_pagamento_antecipado: boolean | null
          revision_count: number | null
          service_id: string | null
          status: string | null
          telefone: string | null
          tipo_pagamento: string | null
          updated_at: string | null
          valor_entrada: number | null
          valor_orcado: number | null
        }
        Insert: {
          archived_at?: string | null
          arquivo_urls?: Json | null
          arquivos_entregues?: Json | null
          avaliacao_comentario?: string | null
          avaliacao_nota?: number | null
          briefing_completeness_score?: number | null
          briefing_data?: Json | null
          briefing_template_id?: string | null
          client_id?: string | null
          comprovante_url?: string | null
          condicao_pagamento?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_briefing?: string | null
          data_emissao_nf?: string | null
          data_entrega?: string | null
          data_inicio_confeccao?: string | null
          data_orcamento?: string | null
          data_pagamento?: string | null
          data_pagamento_final?: string | null
          descricao: string
          discount_amount?: number | null
          discount_reason?: string | null
          email: string
          empresa?: string | null
          id?: string
          max_revisions?: number | null
          mensagem_entrega?: string | null
          motivo_recusa?: string | null
          nome: string
          nota_fiscal_emitida?: boolean | null
          nps_comment?: string | null
          nps_score?: number | null
          numero_nota_fiscal?: string | null
          observacoes_admin?: string | null
          order_type?: string | null
          payment_mode?: string | null
          prazo_final?: string | null
          prazo_orcado?: number | null
          prazo_solicitado?: string | null
          protocolo: string
          public_token?: string | null
          referencias?: string | null
          requer_pagamento_antecipado?: boolean | null
          revision_count?: number | null
          service_id?: string | null
          status?: string | null
          telefone?: string | null
          tipo_pagamento?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_orcado?: number | null
        }
        Update: {
          archived_at?: string | null
          arquivo_urls?: Json | null
          arquivos_entregues?: Json | null
          avaliacao_comentario?: string | null
          avaliacao_nota?: number | null
          briefing_completeness_score?: number | null
          briefing_data?: Json | null
          briefing_template_id?: string | null
          client_id?: string | null
          comprovante_url?: string | null
          condicao_pagamento?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_briefing?: string | null
          data_emissao_nf?: string | null
          data_entrega?: string | null
          data_inicio_confeccao?: string | null
          data_orcamento?: string | null
          data_pagamento?: string | null
          data_pagamento_final?: string | null
          descricao?: string
          discount_amount?: number | null
          discount_reason?: string | null
          email?: string
          empresa?: string | null
          id?: string
          max_revisions?: number | null
          mensagem_entrega?: string | null
          motivo_recusa?: string | null
          nome?: string
          nota_fiscal_emitida?: boolean | null
          nps_comment?: string | null
          nps_score?: number | null
          numero_nota_fiscal?: string | null
          observacoes_admin?: string | null
          order_type?: string | null
          payment_mode?: string | null
          prazo_final?: string | null
          prazo_orcado?: number | null
          prazo_solicitado?: string | null
          protocolo?: string
          public_token?: string | null
          referencias?: string | null
          requer_pagamento_antecipado?: boolean | null
          revision_count?: number | null
          service_id?: string | null
          status?: string | null
          telefone?: string | null
          tipo_pagamento?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_orcado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_briefing_template_id_fkey"
            columns: ["briefing_template_id"]
            isOneToOne: false
            referencedRelation: "briefing_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      portfolio_cases: {
        Row: {
          category: string
          client_name: string
          created_at: string | null
          description: string
          featured: boolean | null
          file_size_kb: number | null
          gallery_urls: Json | null
          id: string
          order_index: number | null
          results: string | null
          status: string | null
          thumbnail_original_name: string | null
          thumbnail_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          client_name: string
          created_at?: string | null
          description: string
          featured?: boolean | null
          file_size_kb?: number | null
          gallery_urls?: Json | null
          id?: string
          order_index?: number | null
          results?: string | null
          status?: string | null
          thumbnail_original_name?: string | null
          thumbnail_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          client_name?: string
          created_at?: string | null
          description?: string
          featured?: boolean | null
          file_size_kb?: number | null
          gallery_urls?: Json | null
          id?: string
          order_index?: number | null
          results?: string | null
          status?: string | null
          thumbnail_original_name?: string | null
          thumbnail_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          tipo_dashboard: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          tipo_dashboard?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          tipo_dashboard?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number
          updated_at?: string
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
      seo_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          keywords: string[] | null
          og_image_url: string | null
          page_slug: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image_url?: string | null
          page_slug: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image_url?: string | null
          page_slug?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          deliverables: Json | null
          delivery_time: string | null
          display_order: number | null
          features: Json | null
          full_description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_range: string | null
          short_description: string
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deliverables?: Json | null
          delivery_time?: string | null
          display_order?: number | null
          features?: Json | null
          full_description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_range?: string | null
          short_description: string
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deliverables?: Json | null
          delivery_time?: string | null
          display_order?: number | null
          features?: Json | null
          full_description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_range?: string | null
          short_description?: string
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          type: string | null
          updated_at: string | null
          user_id: string
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          type?: string | null
          updated_at?: string | null
          user_id: string
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
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
      usuario_geradores: {
        Row: {
          ativo: boolean | null
          gerador_id: string | null
          id: string
          liberado_em: string | null
          liberado_por: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          gerador_id?: string | null
          id?: string
          liberado_em?: string | null
          liberado_por?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          gerador_id?: string | null
          id?: string
          liberado_em?: string | null
          liberado_por?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuario_geradores_gerador_id_fkey"
            columns: ["gerador_id"]
            isOneToOne: false
            referencedRelation: "geradores_vip"
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
      generate_entrega_token: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_proposal_number: { Args: never; Returns: string }
      get_next_nota_number: {
        Args: { p_tipo: string; p_user_id: string }
        Returns: number
      }
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
=======
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
      access_pages: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      briefing_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          schema_json: Json
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          schema_json?: Json
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          schema_json?: Json
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefing_templates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
          discount_amount: number | null
          discount_reason: string | null
          expires_at: string | null
          global_discount_type: string | null
          global_discount_value: number | null
          id: string
          notes: string | null
          parent_quote_id: string | null
          pedido_id: string | null
          shipping: number | null
          status: string | null
          subtotal: number
          terms_and_conditions: string | null
          total: number
          updated_at: string | null
          validity_days: number | null
          version: number | null
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
          discount_amount?: number | null
          discount_reason?: string | null
          expires_at?: string | null
          global_discount_type?: string | null
          global_discount_value?: number | null
          id?: string
          notes?: string | null
          parent_quote_id?: string | null
          pedido_id?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string | null
          validity_days?: number | null
          version?: number | null
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
          discount_amount?: number | null
          discount_reason?: string | null
          expires_at?: string | null
          global_discount_type?: string | null
          global_discount_value?: number | null
          id?: string
          notes?: string | null
          parent_quote_id?: string | null
          pedido_id?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number
          terms_and_conditions?: string | null
          total?: number
          updated_at?: string | null
          validity_days?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_parent_quote_id_fkey"
            columns: ["parent_quote_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
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
      channel_settings: {
        Row: {
          behance_url: string | null
          contact_email: string | null
          created_at: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          support_hours: string | null
          updated_at: string | null
          user_id: string
          whatsapp_default_message: string | null
          whatsapp_number: string | null
          whatsapp_show_float_button: boolean | null
          youtube_url: string | null
        }
        Insert: {
          behance_url?: string | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          support_hours?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_default_message?: string | null
          whatsapp_number?: string | null
          whatsapp_show_float_button?: boolean | null
          youtube_url?: string | null
        }
        Update: {
          behance_url?: string | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          support_hours?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_default_message?: string | null
          whatsapp_number?: string | null
          whatsapp_show_float_button?: boolean | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      chat_config: {
        Row: {
          atalhos: Json | null
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          delay_boas_vindas: number | null
          dias_atendimento: string[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          mensagem_boas_vindas: string | null
          posicao: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          atalhos?: Json | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          delay_boas_vindas?: number | null
          dias_atendimento?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          mensagem_boas_vindas?: string | null
          posicao?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          atalhos?: Json | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          delay_boas_vindas?: number | null
          dias_atendimento?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          mensagem_boas_vindas?: string | null
          posicao?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_mensagens: {
        Row: {
          anexo_url: string | null
          enviada_em: string | null
          id: string
          lida: boolean | null
          mensagem: string
          remetente_id: string | null
          remetente_tipo: string
          sessao_id: string
        }
        Insert: {
          anexo_url?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          remetente_id?: string | null
          remetente_tipo: string
          sessao_id: string
        }
        Update: {
          anexo_url?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          remetente_id?: string | null
          remetente_tipo?: string
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "chat_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessoes: {
        Row: {
          atendente_id: string | null
          client_id: string | null
          created_at: string | null
          encerrado_em: string | null
          id: string
          iniciado_em: string | null
          ip_visitante: string | null
          pagina_origem: string | null
          session_id: string
          status: string | null
          updated_at: string | null
          user_agent: string | null
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          atendente_id?: string | null
          client_id?: string | null
          created_at?: string | null
          encerrado_em?: string | null
          id?: string
          iniciado_em?: string | null
          ip_visitante?: string | null
          pagina_origem?: string | null
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          atendente_id?: string | null
          client_id?: string | null
          created_at?: string | null
          encerrado_em?: string | null
          id?: string
          iniciado_em?: string | null
          ip_visitante?: string | null
          pagina_origem?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessoes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessoes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      client_permissions: {
        Row: {
          client_id: string
          created_at: string | null
          granted: boolean | null
          id: string
          page_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          granted?: boolean | null
          id?: string
          page_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          granted?: boolean | null
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_permissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_permissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_permissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "access_pages"
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
      company_about: {
        Row: {
          about_image_url: string | null
          clients_count: string | null
          created_at: string | null
          differentials: Json | null
          foundation_year: string | null
          full_description: string | null
          headline: string | null
          id: string
          mission: string | null
          projects_count: string | null
          story_title: string | null
          team_size: string | null
          updated_at: string | null
          user_id: string
          values: Json | null
          vision: string | null
        }
        Insert: {
          about_image_url?: string | null
          clients_count?: string | null
          created_at?: string | null
          differentials?: Json | null
          foundation_year?: string | null
          full_description?: string | null
          headline?: string | null
          id?: string
          mission?: string | null
          projects_count?: string | null
          story_title?: string | null
          team_size?: string | null
          updated_at?: string | null
          user_id: string
          values?: Json | null
          vision?: string | null
        }
        Update: {
          about_image_url?: string | null
          clients_count?: string | null
          created_at?: string | null
          differentials?: Json | null
          foundation_year?: string | null
          full_description?: string | null
          headline?: string | null
          id?: string
          mission?: string | null
          projects_count?: string | null
          story_title?: string | null
          team_size?: string | null
          updated_at?: string | null
          user_id?: string
          values?: Json | null
          vision?: string | null
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
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          project_type_id: string | null
          read_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          project_type_id?: string | null
          read_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          project_type_id?: string | null
          read_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_project_type_id_fkey"
            columns: ["project_type_id"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          arquivos: Json | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_whatsapp: string | null
          created_at: string
          data_envio: string | null
          dias_validade: number | null
          enviado_por_email: boolean | null
          enviado_por_whatsapp: boolean | null
          expira_em: string | null
          id: string
          link_acesso: string | null
          link_externo: string | null
          mensagem: string | null
          pedido_id: string
          protocolo: string
          revogado_em: string | null
          revogado_por: string | null
          servico_nome: string | null
          status: string | null
          tipo: string | null
          token: string
          total_acessos: number | null
          total_downloads: number | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          arquivos?: Json | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          data_envio?: string | null
          dias_validade?: number | null
          enviado_por_email?: boolean | null
          enviado_por_whatsapp?: boolean | null
          expira_em?: string | null
          id?: string
          link_acesso?: string | null
          link_externo?: string | null
          mensagem?: string | null
          pedido_id: string
          protocolo: string
          revogado_em?: string | null
          revogado_por?: string | null
          servico_nome?: string | null
          status?: string | null
          tipo?: string | null
          token: string
          total_acessos?: number | null
          total_downloads?: number | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          arquivos?: Json | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          data_envio?: string | null
          dias_validade?: number | null
          enviado_por_email?: boolean | null
          enviado_por_whatsapp?: boolean | null
          expira_em?: string | null
          id?: string
          link_acesso?: string | null
          link_externo?: string | null
          mensagem?: string | null
          pedido_id?: string
          protocolo?: string
          revogado_em?: string | null
          revogado_por?: string | null
          servico_nome?: string | null
          status?: string | null
          tipo?: string | null
          token?: string
          total_acessos?: number | null
          total_downloads?: number | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas_logs: {
        Row: {
          created_at: string
          descricao: string | null
          entrega_id: string | null
          evento: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          entrega_id?: string | null
          evento: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          entrega_id?: string | null
          evento?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_logs_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "entregas"
            referencedColumns: ["id"]
          },
        ]
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
      geradores_vip: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          rota_frontend: string | null
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          rota_frontend?: string | null
          slug: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          rota_frontend?: string | null
          slug?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_editable: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_editable?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_editable?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
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
      legal_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nfe_configs: {
        Row: {
          ambiente: string | null
          api_key: string | null
          api_provider: string | null
          api_secret: string | null
          bairro: string | null
          cep: string | null
          certificado_base64: string | null
          certificado_senha: string | null
          certificado_validade: string | null
          cnpj: string
          codigo_municipio_ibge: string | null
          complemento: string | null
          created_at: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logradouro: string | null
          municipio: string | null
          nome_fantasia: string | null
          numero: string | null
          proximo_numero_nfe: number | null
          proximo_numero_nfse: number | null
          razao_social: string
          regime_tributario: string | null
          serie_nfe: string | null
          serie_nfse: string | null
          uf: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ambiente?: string | null
          api_key?: string | null
          api_provider?: string | null
          api_secret?: string | null
          bairro?: string | null
          cep?: string | null
          certificado_base64?: string | null
          certificado_senha?: string | null
          certificado_validade?: string | null
          cnpj: string
          codigo_municipio_ibge?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          proximo_numero_nfe?: number | null
          proximo_numero_nfse?: number | null
          razao_social: string
          regime_tributario?: string | null
          serie_nfe?: string | null
          serie_nfse?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ambiente?: string | null
          api_key?: string | null
          api_provider?: string | null
          api_secret?: string | null
          bairro?: string | null
          cep?: string | null
          certificado_base64?: string | null
          certificado_senha?: string | null
          certificado_validade?: string | null
          cnpj?: string
          codigo_municipio_ibge?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          proximo_numero_nfe?: number | null
          proximo_numero_nfse?: number | null
          razao_social?: string
          regime_tributario?: string | null
          serie_nfe?: string | null
          serie_nfse?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notas_fiscais: {
        Row: {
          cfop: string | null
          chave_acesso: string | null
          cliente_cpf_cnpj: string
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_id: string | null
          cliente_municipio: string | null
          cliente_nome: string
          cliente_uf: string | null
          codigo_servico_municipio: string | null
          cofins_valor: number | null
          created_at: string | null
          data_competencia: string | null
          data_emissao: string | null
          descricao_servico: string
          id: string
          invoice_id: string | null
          issqn_aliquota: number | null
          issqn_retido: boolean | null
          issqn_valor: number | null
          motivo_status: string | null
          natureza_operacao: string | null
          numero: number
          pdf_url: string | null
          pis_valor: number | null
          protocolo: string | null
          serie: string | null
          status: string | null
          tipo: string
          updated_at: string | null
          user_id: string
          valor_desconto: number | null
          valor_liquido: number
          valor_servico: number
          xml_url: string | null
        }
        Insert: {
          cfop?: string | null
          chave_acesso?: string | null
          cliente_cpf_cnpj: string
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: string | null
          cliente_municipio?: string | null
          cliente_nome: string
          cliente_uf?: string | null
          codigo_servico_municipio?: string | null
          cofins_valor?: number | null
          created_at?: string | null
          data_competencia?: string | null
          data_emissao?: string | null
          descricao_servico: string
          id?: string
          invoice_id?: string | null
          issqn_aliquota?: number | null
          issqn_retido?: boolean | null
          issqn_valor?: number | null
          motivo_status?: string | null
          natureza_operacao?: string | null
          numero: number
          pdf_url?: string | null
          pis_valor?: number | null
          protocolo?: string | null
          serie?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id: string
          valor_desconto?: number | null
          valor_liquido: number
          valor_servico: number
          xml_url?: string | null
        }
        Update: {
          cfop?: string | null
          chave_acesso?: string | null
          cliente_cpf_cnpj?: string
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: string | null
          cliente_municipio?: string | null
          cliente_nome?: string
          cliente_uf?: string | null
          codigo_servico_municipio?: string | null
          cofins_valor?: number | null
          created_at?: string | null
          data_competencia?: string | null
          data_emissao?: string | null
          descricao_servico?: string
          id?: string
          invoice_id?: string | null
          issqn_aliquota?: number | null
          issqn_retido?: boolean | null
          issqn_valor?: number | null
          motivo_status?: string | null
          natureza_operacao?: string | null
          numero?: number
          pdf_url?: string | null
          pis_valor?: number | null
          protocolo?: string | null
          serie?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
          valor_desconto?: number | null
          valor_liquido?: number
          valor_servico?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      order_activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string | null
          created_at: string | null
          details: Json | null
          id: string
          pedido_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          pedido_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_activity_logs_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      order_deliverables: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          downloaded_at: string | null
          expires_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_final: boolean | null
          pedido_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          downloaded_at?: string | null
          expires_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_final?: boolean | null
          pedido_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          downloaded_at?: string | null
          expires_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_final?: boolean | null
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_deliverables_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      order_revisions: {
        Row: {
          admin_response: string | null
          created_at: string | null
          description: string
          extra_cost: number | null
          files: Json | null
          id: string
          is_extra: boolean | null
          pedido_id: string
          requested_by: string | null
          resolved_at: string | null
          revision_number: number
          status: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          description: string
          extra_cost?: number | null
          files?: Json | null
          id?: string
          is_extra?: boolean | null
          pedido_id: string
          requested_by?: string | null
          resolved_at?: string | null
          revision_number: number
          status?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          description?: string
          extra_cost?: number | null
          files?: Json | null
          id?: string
          is_extra?: boolean | null
          pedido_id?: string
          requested_by?: string | null
          resolved_at?: string | null
          revision_number?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_revisions_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
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
      partner_logos: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          logo_url: string
          nome: string
          ordem: number
          site_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          logo_url: string
          nome: string
          ordem?: number
          site_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          logo_url?: string
          nome?: string
          ordem?: number
          site_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_section_settings: {
        Row: {
          created_at: string
          id: string
          show_section: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          show_section?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          show_section?: boolean | null
          updated_at?: string
          user_id?: string
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
      payment_installments: {
        Row: {
          amount: number
          comprovante_url: string | null
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          paid_at: string | null
          payment_method: string | null
          pedido_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          comprovante_url?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          paid_at?: string | null
          payment_method?: string | null
          pedido_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          comprovante_url?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          paid_at?: string | null
          payment_method?: string | null
          pedido_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_installments_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
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
      pedidos: {
        Row: {
          archived_at: string | null
          arquivo_urls: Json | null
          arquivos_entregues: Json | null
          avaliacao_comentario: string | null
          avaliacao_nota: number | null
          briefing_completeness_score: number | null
          briefing_data: Json | null
          briefing_template_id: string | null
          client_id: string | null
          comprovante_url: string | null
          condicao_pagamento: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_briefing: string | null
          data_emissao_nf: string | null
          data_entrega: string | null
          data_inicio_confeccao: string | null
          data_orcamento: string | null
          data_pagamento: string | null
          data_pagamento_final: string | null
          descricao: string
          discount_amount: number | null
          discount_reason: string | null
          email: string
          empresa: string | null
          id: string
          max_revisions: number | null
          mensagem_entrega: string | null
          motivo_recusa: string | null
          nome: string
          nota_fiscal_emitida: boolean | null
          nps_comment: string | null
          nps_score: number | null
          numero_nota_fiscal: string | null
          observacoes_admin: string | null
          order_type: string | null
          payment_mode: string | null
          prazo_final: string | null
          prazo_orcado: number | null
          prazo_solicitado: string | null
          protocolo: string
          public_token: string | null
          referencias: string | null
          requer_pagamento_antecipado: boolean | null
          revision_count: number | null
          service_id: string | null
          status: string | null
          telefone: string | null
          tipo_pagamento: string | null
          updated_at: string | null
          valor_entrada: number | null
          valor_orcado: number | null
        }
        Insert: {
          archived_at?: string | null
          arquivo_urls?: Json | null
          arquivos_entregues?: Json | null
          avaliacao_comentario?: string | null
          avaliacao_nota?: number | null
          briefing_completeness_score?: number | null
          briefing_data?: Json | null
          briefing_template_id?: string | null
          client_id?: string | null
          comprovante_url?: string | null
          condicao_pagamento?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_briefing?: string | null
          data_emissao_nf?: string | null
          data_entrega?: string | null
          data_inicio_confeccao?: string | null
          data_orcamento?: string | null
          data_pagamento?: string | null
          data_pagamento_final?: string | null
          descricao: string
          discount_amount?: number | null
          discount_reason?: string | null
          email: string
          empresa?: string | null
          id?: string
          max_revisions?: number | null
          mensagem_entrega?: string | null
          motivo_recusa?: string | null
          nome: string
          nota_fiscal_emitida?: boolean | null
          nps_comment?: string | null
          nps_score?: number | null
          numero_nota_fiscal?: string | null
          observacoes_admin?: string | null
          order_type?: string | null
          payment_mode?: string | null
          prazo_final?: string | null
          prazo_orcado?: number | null
          prazo_solicitado?: string | null
          protocolo: string
          public_token?: string | null
          referencias?: string | null
          requer_pagamento_antecipado?: boolean | null
          revision_count?: number | null
          service_id?: string | null
          status?: string | null
          telefone?: string | null
          tipo_pagamento?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_orcado?: number | null
        }
        Update: {
          archived_at?: string | null
          arquivo_urls?: Json | null
          arquivos_entregues?: Json | null
          avaliacao_comentario?: string | null
          avaliacao_nota?: number | null
          briefing_completeness_score?: number | null
          briefing_data?: Json | null
          briefing_template_id?: string | null
          client_id?: string | null
          comprovante_url?: string | null
          condicao_pagamento?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_briefing?: string | null
          data_emissao_nf?: string | null
          data_entrega?: string | null
          data_inicio_confeccao?: string | null
          data_orcamento?: string | null
          data_pagamento?: string | null
          data_pagamento_final?: string | null
          descricao?: string
          discount_amount?: number | null
          discount_reason?: string | null
          email?: string
          empresa?: string | null
          id?: string
          max_revisions?: number | null
          mensagem_entrega?: string | null
          motivo_recusa?: string | null
          nome?: string
          nota_fiscal_emitida?: boolean | null
          nps_comment?: string | null
          nps_score?: number | null
          numero_nota_fiscal?: string | null
          observacoes_admin?: string | null
          order_type?: string | null
          payment_mode?: string | null
          prazo_final?: string | null
          prazo_orcado?: number | null
          prazo_solicitado?: string | null
          protocolo?: string
          public_token?: string | null
          referencias?: string | null
          requer_pagamento_antecipado?: boolean | null
          revision_count?: number | null
          service_id?: string | null
          status?: string | null
          telefone?: string | null
          tipo_pagamento?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_orcado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_briefing_template_id_fkey"
            columns: ["briefing_template_id"]
            isOneToOne: false
            referencedRelation: "briefing_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      portfolio_cases: {
        Row: {
          category: string
          client_name: string
          created_at: string | null
          description: string
          featured: boolean | null
          file_size_kb: number | null
          gallery_urls: Json | null
          id: string
          order_index: number | null
          results: string | null
          status: string | null
          thumbnail_original_name: string | null
          thumbnail_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          client_name: string
          created_at?: string | null
          description: string
          featured?: boolean | null
          file_size_kb?: number | null
          gallery_urls?: Json | null
          id?: string
          order_index?: number | null
          results?: string | null
          status?: string | null
          thumbnail_original_name?: string | null
          thumbnail_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          client_name?: string
          created_at?: string | null
          description?: string
          featured?: boolean | null
          file_size_kb?: number | null
          gallery_urls?: Json | null
          id?: string
          order_index?: number | null
          results?: string | null
          status?: string | null
          thumbnail_original_name?: string | null
          thumbnail_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          tipo_dashboard: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          tipo_dashboard?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          tipo_dashboard?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number
          updated_at?: string
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
      seo_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          keywords: string[] | null
          og_image_url: string | null
          page_slug: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image_url?: string | null
          page_slug: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image_url?: string | null
          page_slug?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          deliverables: Json | null
          delivery_time: string | null
          display_order: number | null
          features: Json | null
          full_description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_range: string | null
          short_description: string
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deliverables?: Json | null
          delivery_time?: string | null
          display_order?: number | null
          features?: Json | null
          full_description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_range?: string | null
          short_description: string
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deliverables?: Json | null
          delivery_time?: string | null
          display_order?: number | null
          features?: Json | null
          full_description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_range?: string | null
          short_description?: string
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          type: string | null
          updated_at: string | null
          user_id: string
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          type?: string | null
          updated_at?: string | null
          user_id: string
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
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
      usuario_geradores: {
        Row: {
          ativo: boolean | null
          gerador_id: string | null
          id: string
          liberado_em: string | null
          liberado_por: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          gerador_id?: string | null
          id?: string
          liberado_em?: string | null
          liberado_por?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          gerador_id?: string | null
          id?: string
          liberado_em?: string | null
          liberado_por?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuario_geradores_gerador_id_fkey"
            columns: ["gerador_id"]
            isOneToOne: false
            referencedRelation: "geradores_vip"
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
      generate_entrega_token: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_proposal_number: { Args: never; Returns: string }
      get_next_nota_number: {
        Args: { p_tipo: string; p_user_id: string }
        Returns: number
      }
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
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
