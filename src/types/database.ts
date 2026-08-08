export type Json =
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      class_sessions: {
        Row: {
          aforo_maximo: number;
          created_at: string;
          estado: string;
          fecha: string;
          hora_fin: string;
          hora_inicio: string;
          id: string;
          nivel: string;
          nombre: string;
          template_id: string | null;
          trainer_id: string;
        };
        Insert: {
          aforo_maximo: number;
          created_at?: string;
          estado?: string;
          fecha: string;
          hora_fin: string;
          hora_inicio: string;
          id?: string;
          nivel: string;
          nombre: string;
          template_id?: string | null;
          trainer_id: string;
        };
        Update: {
          aforo_maximo?: number;
          created_at?: string;
          estado?: string;
          fecha?: string;
          hora_fin?: string;
          hora_inicio?: string;
          id?: string;
          nivel?: string;
          nombre?: string;
          template_id?: string | null;
          trainer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'class_sessions_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'class_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'class_sessions_trainer_id_fkey';
            columns: ['trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
        ];
      };
      class_templates: {
        Row: {
          activo: boolean;
          aforo_maximo: number;
          dia_semana: number;
          hora_fin: string;
          hora_inicio: string;
          id: string;
          nivel: string;
          nombre: string;
          trainer_id: string;
        };
        Insert: {
          activo?: boolean;
          aforo_maximo: number;
          dia_semana: number;
          hora_fin: string;
          hora_inicio: string;
          id?: string;
          nivel: string;
          nombre: string;
          trainer_id: string;
        };
        Update: {
          activo?: boolean;
          aforo_maximo?: number;
          dia_semana?: number;
          hora_fin?: string;
          hora_inicio?: string;
          id?: string;
          nivel?: string;
          nombre?: string;
          trainer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'class_templates_trainer_id_fkey';
            columns: ['trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
        ];
      };
      dependents: {
        Row: {
          apellidos: string;
          consent_given_at: string | null;
          created_at: string;
          fecha_nacimiento: string;
          id: string;
          nombre: string;
          parent_user_id: string;
          relacion: string;
        };
        Insert: {
          apellidos: string;
          consent_given_at?: string | null;
          created_at?: string;
          fecha_nacimiento: string;
          id?: string;
          nombre: string;
          parent_user_id: string;
          relacion: string;
        };
        Update: {
          apellidos?: string;
          consent_given_at?: string | null;
          created_at?: string;
          fecha_nacimiento?: string;
          id?: string;
          nombre?: string;
          parent_user_id?: string;
          relacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dependents_parent_user_id_fkey';
            columns: ['parent_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          apellidos: string;
          created_at: string;
          fecha_nacimiento: string | null;
          id: string;
          nombre: string;
          role: string;
          telefono: string | null;
        };
        Insert: {
          apellidos: string;
          created_at?: string;
          fecha_nacimiento?: string | null;
          id: string;
          nombre: string;
          role?: string;
          telefono?: string | null;
        };
        Update: {
          apellidos?: string;
          created_at?: string;
          fecha_nacimiento?: string | null;
          id?: string;
          nombre?: string;
          role?: string;
          telefono?: string | null;
        };
        Relationships: [];
      };
      trainers: {
        Row: {
          activo: boolean;
          bio: string | null;
          especialidad: string | null;
          foto_url: string | null;
          id: string;
          nombre: string;
        };
        Insert: {
          activo?: boolean;
          bio?: string | null;
          especialidad?: string | null;
          foto_url?: string | null;
          id?: string;
          nombre: string;
        };
        Update: {
          activo?: boolean;
          bio?: string | null;
          especialidad?: string | null;
          foto_url?: string | null;
          id?: string;
          nombre?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_class_sessions: { Args: never; Returns: undefined };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
