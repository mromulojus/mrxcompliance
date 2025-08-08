export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
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
      profiles: {
        Row: {
          created_at: string
          empresa_ids: string[] | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          empresa_ids?: string[] | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          empresa_ids?: string[] | null
          id?: string
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
      generate_protocol: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          user_uuid: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
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
      user_role: "superuser" | "administrador" | "empresarial" | "operacional"
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
      user_role: ["superuser", "administrador", "empresarial", "operacional"],
    },
  },
} as const
