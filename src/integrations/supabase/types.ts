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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      acordos: {
        Row: {
          created_at: string
          created_by: string
          data_primeira_parcela: string | null
          data_vencimento_entrada: string | null
          desconto_percentual: number | null
          devedor_id: string
          divida_id: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          parcelas: number | null
          status: string
          updated_at: string
          valor_acordo: number
          valor_entrada: number | null
          valor_parcela: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          data_primeira_parcela?: string | null
          data_vencimento_entrada?: string | null
          desconto_percentual?: number | null
          devedor_id: string
          divida_id: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          parcelas?: number | null
          status?: string
          updated_at?: string
          valor_acordo: number
          valor_entrada?: number | null
          valor_parcela?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          data_primeira_parcela?: string | null
          data_vencimento_entrada?: string | null
          desconto_percentual?: number | null
          devedor_id?: string
          divida_id?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          parcelas?: number | null
          status?: string
          updated_at?: string
          valor_acordo?: number
          valor_entrada?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acordos_devedor_id_fkey"
            columns: ["devedor_id"]
            isOneToOne: false
            referencedRelation: "devedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acordos_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          by_user: string
          created_at: string
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          by_user: string
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          by_user?: string
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          agencia: string | null
          banco: string | null
          cargo: string
          celular: string | null
          cep: string
          cidade: string
          conta: string | null
          contato_emergencia_nome: string
          contato_emergencia_parentesco: string
          contato_emergencia_telefone: string
          cpf: string
          created_at: string
          created_by: string | null
          ctps: string | null
          ctps_serie: string | null
          data_admissao: string
          data_nascimento: string
          departamento: string
          email: string
          empresa_id: string
          endereco: string
          escolaridade: Database["public"]["Enums"]["escolaridade"]
          estado: string
          estado_civil: Database["public"]["Enums"]["estado_civil"]
          filhos: Json | null
          foto_perfil: string | null
          id: string
          nome: string
          nome_mae: string
          nome_pai: string | null
          pis_pasep: string | null
          pix: string | null
          plano_odontologico: boolean | null
          plano_saude: boolean | null
          quantidade_filhos: number | null
          reservista: string | null
          rg: string
          rg_orgao_emissor: string
          salario_base: number
          sexo: Database["public"]["Enums"]["sexo"]
          status: Database["public"]["Enums"]["colaborador_status"]
          telefone: string | null
          tem_filhos_menores_14: boolean | null
          tipo_conta: Database["public"]["Enums"]["tipo_conta"] | null
          tipo_contrato: Database["public"]["Enums"]["tipo_contrato"]
          titulo_eleitor: string | null
          updated_at: string
          vale_refeicao: boolean | null
          vale_transporte: boolean | null
          valor_vale_refeicao: number | null
          valor_vale_transporte: number | null
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          cargo: string
          celular?: string | null
          cep: string
          cidade: string
          conta?: string | null
          contato_emergencia_nome: string
          contato_emergencia_parentesco: string
          contato_emergencia_telefone: string
          cpf: string
          created_at?: string
          created_by?: string | null
          ctps?: string | null
          ctps_serie?: string | null
          data_admissao: string
          data_nascimento: string
          departamento: string
          email: string
          empresa_id: string
          endereco: string
          escolaridade: Database["public"]["Enums"]["escolaridade"]
          estado: string
          estado_civil: Database["public"]["Enums"]["estado_civil"]
          filhos?: Json | null
          foto_perfil?: string | null
          id?: string
          nome: string
          nome_mae: string
          nome_pai?: string | null
          pis_pasep?: string | null
          pix?: string | null
          plano_odontologico?: boolean | null
          plano_saude?: boolean | null
          quantidade_filhos?: number | null
          reservista?: string | null
          rg: string
          rg_orgao_emissor: string
          salario_base?: number
          sexo: Database["public"]["Enums"]["sexo"]
          status?: Database["public"]["Enums"]["colaborador_status"]
          telefone?: string | null
          tem_filhos_menores_14?: boolean | null
          tipo_conta?: Database["public"]["Enums"]["tipo_conta"] | null
          tipo_contrato?: Database["public"]["Enums"]["tipo_contrato"]
          titulo_eleitor?: string | null
          updated_at?: string
          vale_refeicao?: boolean | null
          vale_transporte?: boolean | null
          valor_vale_refeicao?: number | null
          valor_vale_transporte?: number | null
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          cargo?: string
          celular?: string | null
          cep?: string
          cidade?: string
          conta?: string | null
          contato_emergencia_nome?: string
          contato_emergencia_parentesco?: string
          contato_emergencia_telefone?: string
          cpf?: string
          created_at?: string
          created_by?: string | null
          ctps?: string | null
          ctps_serie?: string | null
          data_admissao?: string
          data_nascimento?: string
          departamento?: string
          email?: string
          empresa_id?: string
          endereco?: string
          escolaridade?: Database["public"]["Enums"]["escolaridade"]
          estado?: string
          estado_civil?: Database["public"]["Enums"]["estado_civil"]
          filhos?: Json | null
          foto_perfil?: string | null
          id?: string
          nome?: string
          nome_mae?: string
          nome_pai?: string | null
          pis_pasep?: string | null
          pix?: string | null
          plano_odontologico?: boolean | null
          plano_saude?: boolean | null
          quantidade_filhos?: number | null
          reservista?: string | null
          rg?: string
          rg_orgao_emissor?: string
          salario_base?: number
          sexo?: Database["public"]["Enums"]["sexo"]
          status?: Database["public"]["Enums"]["colaborador_status"]
          telefone?: string | null
          tem_filhos_menores_14?: boolean | null
          tipo_conta?: Database["public"]["Enums"]["tipo_conta"] | null
          tipo_contrato?: Database["public"]["Enums"]["tipo_contrato"]
          titulo_eleitor?: string | null
          updated_at?: string
          vale_refeicao?: boolean | null
          vale_transporte?: boolean | null
          valor_vale_refeicao?: number | null
          valor_vale_transporte?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_denuncia: {
        Row: {
          autor: string
          created_at: string
          denuncia_id: string
          id: string
          mensagem: string
        }
        Insert: {
          autor: string
          created_at?: string
          denuncia_id: string
          id?: string
          mensagem: string
        }
        Update: {
          autor?: string
          created_at?: string
          denuncia_id?: string
          id?: string
          mensagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_denuncia_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      denuncias: {
        Row: {
          anexos: string[] | null
          conhecimento_fato: Database["public"]["Enums"]["conhecimento_fato"]
          created_at: string
          descricao: string
          email: string | null
          empresa_id: string
          envolvidos_cientes: boolean
          evidencias_descricao: string | null
          id: string
          identificado: boolean
          nome: string | null
          protocolo: string
          relacao: Database["public"]["Enums"]["relacao_empresa"]
          setor: string | null
          status: Database["public"]["Enums"]["denuncia_status"]
          sugestao: string | null
          tipo: Database["public"]["Enums"]["tipo_denuncia"]
          updated_at: string
        }
        Insert: {
          anexos?: string[] | null
          conhecimento_fato: Database["public"]["Enums"]["conhecimento_fato"]
          created_at?: string
          descricao: string
          email?: string | null
          empresa_id: string
          envolvidos_cientes?: boolean
          evidencias_descricao?: string | null
          id?: string
          identificado?: boolean
          nome?: string | null
          protocolo?: string
          relacao: Database["public"]["Enums"]["relacao_empresa"]
          setor?: string | null
          status?: Database["public"]["Enums"]["denuncia_status"]
          sugestao?: string | null
          tipo: Database["public"]["Enums"]["tipo_denuncia"]
          updated_at?: string
        }
        Update: {
          anexos?: string[] | null
          conhecimento_fato?: Database["public"]["Enums"]["conhecimento_fato"]
          created_at?: string
          descricao?: string
          email?: string | null
          empresa_id?: string
          envolvidos_cientes?: boolean
          evidencias_descricao?: string | null
          id?: string
          identificado?: boolean
          nome?: string | null
          protocolo?: string
          relacao?: Database["public"]["Enums"]["relacao_empresa"]
          setor?: string | null
          status?: Database["public"]["Enums"]["denuncia_status"]
          sugestao?: string | null
          tipo?: Database["public"]["Enums"]["tipo_denuncia"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      devedores: {
        Row: {
          canal_preferencial: string | null
          cep: string | null
          cidade: string | null
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          created_at: string
          created_by: string | null
          documento: string
          email_principal: string | null
          email_secundario: string | null
          empresa_id: string
          endereco_completo: string | null
          estado: string | null
          etiquetas: Json | null
          id: string
          local_trabalho: string | null
          nome: string
          observacoes: string | null
          score_recuperabilidade: number | null
          telefone_principal: string | null
          telefone_whatsapp: string | null
          telefones_outros: string[] | null
          tipo_pessoa: string
          updated_at: string
        }
        Insert: {
          canal_preferencial?: string | null
          cep?: string | null
          cidade?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          created_by?: string | null
          documento: string
          email_principal?: string | null
          email_secundario?: string | null
          empresa_id: string
          endereco_completo?: string | null
          estado?: string | null
          etiquetas?: Json | null
          id?: string
          local_trabalho?: string | null
          nome: string
          observacoes?: string | null
          score_recuperabilidade?: number | null
          telefone_principal?: string | null
          telefone_whatsapp?: string | null
          telefones_outros?: string[] | null
          tipo_pessoa: string
          updated_at?: string
        }
        Update: {
          canal_preferencial?: string | null
          cep?: string | null
          cidade?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          created_by?: string | null
          documento?: string
          email_principal?: string | null
          email_secundario?: string | null
          empresa_id?: string
          endereco_completo?: string | null
          estado?: string | null
          etiquetas?: Json | null
          id?: string
          local_trabalho?: string | null
          nome?: string
          observacoes?: string | null
          score_recuperabilidade?: number | null
          telefone_principal?: string | null
          telefone_whatsapp?: string | null
          telefones_outros?: string[] | null
          tipo_pessoa?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      dividas: {
        Row: {
          created_at: string
          created_by: string | null
          data_negativacao: string | null
          data_protesto: string | null
          data_vencimento: string
          devedor_id: string
          empresa_id: string
          estagio: string
          etiquetas: Json | null
          id: string
          numero_contrato: string | null
          numero_nf: string | null
          origem_divida: string
          status: string
          updated_at: string
          urgency_score: number | null
          valor_atualizado: number
          valor_correcao: number | null
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_negativacao?: string | null
          data_protesto?: string | null
          data_vencimento: string
          devedor_id: string
          empresa_id: string
          estagio?: string
          etiquetas?: Json | null
          id?: string
          numero_contrato?: string | null
          numero_nf?: string | null
          origem_divida: string
          status?: string
          updated_at?: string
          urgency_score?: number | null
          valor_atualizado: number
          valor_correcao?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_negativacao?: string | null
          data_protesto?: string | null
          data_vencimento?: string
          devedor_id?: string
          empresa_id?: string
          estagio?: string
          etiquetas?: Json | null
          id?: string
          numero_contrato?: string | null
          numero_nf?: string | null
          origem_divida?: string
          status?: string
          updated_at?: string
          urgency_score?: number | null
          valor_atualizado?: number
          valor_correcao?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_devedor_id_fkey"
            columns: ["devedor_id"]
            isOneToOne: false
            referencedRelation: "devedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_colaborador: {
        Row: {
          colaborador_id: string
          data_upload: string
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_documento"]
          uploaded_by: string | null
          url: string
        }
        Insert: {
          colaborador_id: string
          data_upload?: string
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_documento"]
          uploaded_by?: string | null
          url: string
        }
        Update: {
          colaborador_id?: string
          data_upload?: string
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_documento"]
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_colaborador_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_divida: {
        Row: {
          created_at: string
          divida_id: string
          id: string
          mime_type: string | null
          nome_arquivo: string
          tamanho_arquivo: number | null
          tipo_documento: string
          uploaded_by: string
          url_arquivo: string
        }
        Insert: {
          created_at?: string
          divida_id: string
          id?: string
          mime_type?: string | null
          nome_arquivo: string
          tamanho_arquivo?: number | null
          tipo_documento: string
          uploaded_by: string
          url_arquivo: string
        }
        Update: {
          created_at?: string
          divida_id?: string
          id?: string
          mime_type?: string | null
          nome_arquivo?: string
          tamanho_arquivo?: number | null
          tipo_documento?: string
          uploaded_by?: string
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_divida_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_cobranca_config: {
        Row: {
          correcao_padrao: number
          created_at: string
          dias_negativacao: number | null
          dias_protesto: number | null
          empresa_id: string
          id: string
          juros_padrao: number
          multa_padrao: number
          updated_at: string
        }
        Insert: {
          correcao_padrao?: number
          created_at?: string
          dias_negativacao?: number | null
          dias_protesto?: number | null
          empresa_id: string
          id?: string
          juros_padrao?: number
          multa_padrao?: number
          updated_at?: string
        }
        Update: {
          correcao_padrao?: number
          created_at?: string
          dias_negativacao?: number | null
          dias_protesto?: number | null
          empresa_id?: string
          id?: string
          juros_padrao?: number
          multa_padrao?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_cobranca_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          created_at: string
          created_by: string | null
          email: string
          endereco: string
          id: string
          nome: string
          responsavel: string
          telefone: string
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          created_by?: string | null
          email: string
          endereco: string
          id?: string
          nome: string
          responsavel: string
          telefone: string
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          created_by?: string | null
          email?: string
          endereco?: string
          id?: string
          nome?: string
          responsavel?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      etiquetas_templates: {
        Row: {
          cor: string
          created_at: string | null
          created_by: string | null
          empresa_id: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          cor?: string
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          cor?: string
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etiquetas_templates_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string
          created_by: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          divida_id: string | null
          empresa_id: string
          id: string
          local: string | null
          participantes: string[] | null
          processo_id: string | null
          tipo: Database["public"]["Enums"]["evento_tipo"]
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          divida_id?: string | null
          empresa_id: string
          id?: string
          local?: string | null
          participantes?: string[] | null
          processo_id?: string | null
          tipo?: Database["public"]["Enums"]["evento_tipo"]
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          divida_id?: string | null
          empresa_id?: string
          id?: string
          local?: string | null
          participantes?: string[] | null
          processo_id?: string | null
          tipo?: Database["public"]["Enums"]["evento_tipo"]
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_cobrancas: {
        Row: {
          anexos: string[] | null
          canal: string
          created_at: string
          created_by: string
          data_compromisso: string | null
          descricao: string
          devedor_id: string
          divida_id: string
          id: string
          observacoes: string | null
          resultado: string | null
          tipo_acao: string
          valor_negociado: number | null
        }
        Insert: {
          anexos?: string[] | null
          canal: string
          created_at?: string
          created_by: string
          data_compromisso?: string | null
          descricao: string
          devedor_id: string
          divida_id: string
          id?: string
          observacoes?: string | null
          resultado?: string | null
          tipo_acao: string
          valor_negociado?: number | null
        }
        Update: {
          anexos?: string[] | null
          canal?: string
          created_at?: string
          created_by?: string
          data_compromisso?: string | null
          descricao?: string
          devedor_id?: string
          divida_id?: string
          id?: string
          observacoes?: string | null
          resultado?: string | null
          tipo_acao?: string
          valor_negociado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_cobrancas_devedor_id_fkey"
            columns: ["devedor_id"]
            isOneToOne: false
            referencedRelation: "devedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_cobrancas_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_colaborador: {
        Row: {
          colaborador_id: string
          created_at: string
          created_by: string
          id: string
          observacao: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          created_by: string
          id?: string
          observacao: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          created_by?: string
          id?: string
          observacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_colaborador_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          acordo_id: string | null
          comprovante_url: string | null
          created_at: string
          created_by: string
          data_pagamento: string
          divida_id: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          valor_pago: number
        }
        Insert: {
          acordo_id?: string | null
          comprovante_url?: string | null
          created_at?: string
          created_by: string
          data_pagamento: string
          divida_id: string
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          valor_pago: number
        }
        Update: {
          acordo_id?: string | null
          comprovante_url?: string | null
          created_at?: string
          created_by?: string
          data_pagamento?: string
          divida_id?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_acordo_id_fkey"
            columns: ["acordo_id"]
            isOneToOne: false
            referencedRelation: "acordos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_documentos: {
        Row: {
          data_upload: string
          id: string
          mime_type: string | null
          nome_documento: string
          observacoes: string | null
          processo_id: string
          tags: string[] | null
          tamanho_arquivo: number | null
          tipo: Database["public"]["Enums"]["documento_processo_tipo"]
          uploaded_by: string
          url_arquivo: string
        }
        Insert: {
          data_upload?: string
          id?: string
          mime_type?: string | null
          nome_documento: string
          observacoes?: string | null
          processo_id: string
          tags?: string[] | null
          tamanho_arquivo?: number | null
          tipo: Database["public"]["Enums"]["documento_processo_tipo"]
          uploaded_by: string
          url_arquivo: string
        }
        Update: {
          data_upload?: string
          id?: string
          mime_type?: string | null
          nome_documento?: string
          observacoes?: string | null
          processo_id?: string
          tags?: string[] | null
          tamanho_arquivo?: number | null
          tipo?: Database["public"]["Enums"]["documento_processo_tipo"]
          uploaded_by?: string
          url_arquivo?: string
        }
        Relationships: []
      }
      processos_historico: {
        Row: {
          created_at: string
          created_by: string
          data_evento: string
          descricao: string
          detalhes: string | null
          id: string
          processo_id: string
          tipo_evento: string
          urgente: boolean | null
        }
        Insert: {
          created_at?: string
          created_by: string
          data_evento: string
          descricao: string
          detalhes?: string | null
          id?: string
          processo_id: string
          tipo_evento: string
          urgente?: boolean | null
        }
        Update: {
          created_at?: string
          created_by?: string
          data_evento?: string
          descricao?: string
          detalhes?: string | null
          id?: string
          processo_id?: string
          tipo_evento?: string
          urgente?: boolean | null
        }
        Relationships: []
      }
      processos_judiciais: {
        Row: {
          acao: string
          advogado_responsavel: string | null
          autor: string
          created_at: string
          created_by: string
          data_cadastro: string
          data_distribuicao: string | null
          divida_id: string | null
          empresa_id: string
          id: string
          juizo: string | null
          link_tribunal: string | null
          numero_processo: string
          observacoes: string | null
          parte_contraria: string | null
          reu: string
          reu_contratado: string | null
          status: Database["public"]["Enums"]["processo_status"]
          titulo: string
          tribunal: string | null
          updated_at: string
          valor_causa: number | null
          valor_compra: number | null
          valor_origem: number | null
          valor_pensao: number | null
          vara: string | null
        }
        Insert: {
          acao: string
          advogado_responsavel?: string | null
          autor: string
          created_at?: string
          created_by: string
          data_cadastro?: string
          data_distribuicao?: string | null
          divida_id?: string | null
          empresa_id: string
          id?: string
          juizo?: string | null
          link_tribunal?: string | null
          numero_processo: string
          observacoes?: string | null
          parte_contraria?: string | null
          reu: string
          reu_contratado?: string | null
          status?: Database["public"]["Enums"]["processo_status"]
          titulo: string
          tribunal?: string | null
          updated_at?: string
          valor_causa?: number | null
          valor_compra?: number | null
          valor_origem?: number | null
          valor_pensao?: number | null
          vara?: string | null
        }
        Update: {
          acao?: string
          advogado_responsavel?: string | null
          autor?: string
          created_at?: string
          created_by?: string
          data_cadastro?: string
          data_distribuicao?: string | null
          divida_id?: string | null
          empresa_id?: string
          id?: string
          juizo?: string | null
          link_tribunal?: string | null
          numero_processo?: string
          observacoes?: string | null
          parte_contraria?: string | null
          reu?: string
          reu_contratado?: string | null
          status?: Database["public"]["Enums"]["processo_status"]
          titulo?: string
          tribunal?: string | null
          updated_at?: string
          valor_causa?: number | null
          valor_compra?: number | null
          valor_origem?: number | null
          valor_pensao?: number | null
          vara?: string | null
        }
        Relationships: []
      }
      processos_valores: {
        Row: {
          created_at: string
          created_by: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          pago: boolean | null
          processo_id: string
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago?: boolean | null
          processo_id: string
          tipo: string
          valor: number
        }
        Update: {
          created_at?: string
          created_by?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago?: boolean | null
          processo_id?: string
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          empresa_ids: string[] | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          empresa_ids?: string[] | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          empresa_ids?: string[] | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_valores_dividas: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      authenticate_by_username: {
        Args: { password_input: string; username_input: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      calcular_valor_atualizado: {
        Args: {
          correcao_perc?: number
          data_vencimento: string
          juros_perc?: number
          multa_perc?: number
          valor_original: number
        }
        Returns: number
      }
      generate_protocol: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_valid_email: {
        Args: { username_text: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["user_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      update_last_login: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_can_access_empresa: {
        Args:
          | { empresa_uuid: string }
          | { p_empresa_id: string; p_user_id: string }
        Returns: boolean
      }
      user_can_access_empresa_data: {
        Args: { empresa_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      colaborador_status: "ATIVO" | "INATIVO" | "DEMITIDO"
      conhecimento_fato:
        | "OUVI_FALAR"
        | "DOCUMENTO"
        | "COLEGA_TRABALHO"
        | "OUTRO"
      denuncia_status: "RECEBIDO" | "EM_ANALISE" | "INVESTIGACAO" | "CONCLUIDO"
      documento_processo_tipo:
        | "inicial"
        | "contestacao"
        | "sentenca"
        | "recurso"
        | "acordo"
        | "comprovante"
        | "procuracao"
        | "outro"
      escolaridade:
        | "FUNDAMENTAL"
        | "MEDIO"
        | "SUPERIOR"
        | "POS_GRADUACAO"
        | "MESTRADO"
        | "DOUTORADO"
      estado_civil:
        | "SOLTEIRO"
        | "CASADO"
        | "DIVORCIADO"
        | "VIUVO"
        | "UNIAO_ESTAVEL"
      evento_tipo:
        | "audiencia"
        | "prazo"
        | "reuniao"
        | "vencimento"
        | "intimacao"
        | "peticao"
        | "decisao"
        | "outro"
      processo_status:
        | "ativo"
        | "suspenso"
        | "arquivado"
        | "transitado_julgado"
        | "baixado"
      relacao_empresa:
        | "COLABORADOR"
        | "EX_COLABORADOR"
        | "FORNECEDOR"
        | "CLIENTE"
        | "OUTRO"
      sexo: "MASCULINO" | "FEMININO"
      tipo_conta: "CORRENTE" | "POUPANCA"
      tipo_contrato: "CLT" | "PJ" | "PF"
      tipo_denuncia:
        | "DISCRIMINACAO"
        | "ASSEDIO_MORAL"
        | "CORRUPCAO"
        | "VIOLACAO_TRABALHISTA"
        | "OUTRO"
      tipo_documento:
        | "RG"
        | "CPF"
        | "CTPS"
        | "COMPROVANTE_ENDERECO"
        | "DIPLOMA"
        | "CERTIDAO"
        | "LAUDO"
        | "CONTRATO"
        | "OUTROS"
      user_role: "superuser" | "administrador" | "empresarial" | "operacional" | "compliance"
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
      colaborador_status: ["ATIVO", "INATIVO", "DEMITIDO"],
      conhecimento_fato: [
        "OUVI_FALAR",
        "DOCUMENTO",
        "COLEGA_TRABALHO",
        "OUTRO",
      ],
      denuncia_status: ["RECEBIDO", "EM_ANALISE", "INVESTIGACAO", "CONCLUIDO"],
      documento_processo_tipo: [
        "inicial",
        "contestacao",
        "sentenca",
        "recurso",
        "acordo",
        "comprovante",
        "procuracao",
        "outro",
      ],
      escolaridade: [
        "FUNDAMENTAL",
        "MEDIO",
        "SUPERIOR",
        "POS_GRADUACAO",
        "MESTRADO",
        "DOUTORADO",
      ],
      estado_civil: [
        "SOLTEIRO",
        "CASADO",
        "DIVORCIADO",
        "VIUVO",
        "UNIAO_ESTAVEL",
      ],
      evento_tipo: [
        "audiencia",
        "prazo",
        "reuniao",
        "vencimento",
        "intimacao",
        "peticao",
        "decisao",
        "outro",
      ],
      processo_status: [
        "ativo",
        "suspenso",
        "arquivado",
        "transitado_julgado",
        "baixado",
      ],
      relacao_empresa: [
        "COLABORADOR",
        "EX_COLABORADOR",
        "FORNECEDOR",
        "CLIENTE",
        "OUTRO",
      ],
      sexo: ["MASCULINO", "FEMININO"],
      tipo_conta: ["CORRENTE", "POUPANCA"],
      tipo_contrato: ["CLT", "PJ", "PF"],
      tipo_denuncia: [
        "DISCRIMINACAO",
        "ASSEDIO_MORAL",
        "CORRUPCAO",
        "VIOLACAO_TRABALHISTA",
        "OUTRO",
      ],
      tipo_documento: [
        "RG",
        "CPF",
        "CTPS",
        "COMPROVANTE_ENDERECO",
        "DIPLOMA",
        "CERTIDAO",
        "LAUDO",
        "CONTRATO",
        "OUTROS",
      ],
      user_role: ["superuser", "administrador", "empresarial", "operacional", "compliance"],
    },
  },
} as const
