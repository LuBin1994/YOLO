/**
 * Supabase 数据库类型定义
 * 与 supabase/schema.sql 保持一致。
 * 若执行 `supabase gen types` 生成了正式类型，可整体替换本文件。
 */

export type InquiryStatus = "new" | "read" | "replied";
export type AdminRole = "admin" | "editor";

/** pages.sections 富文本段落结构 */
export type PageSection =
  | { type: "heading"; content: string }
  | { type: "paragraph"; content: string }
  | { type: "image"; content: string; caption?: string }
  | { type: "gallery"; content: string[] };

/**
 * 注意：Row 类型必须使用 type 别名而非 interface，
 * 否则不满足 postgrest-js GenericTable 的 Record<string, unknown> 约束，
 * 会导致 insert/update 的字面量类型推断崩溃为 never。
 */
export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  images: string[];
  cover_image: string | null;
  materials: string[];
  moq: number | null;
  price_range: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type Page = {
  id: string;
  slug: string;
  title: string;
  hero_image: string | null;
  sections: PageSection[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export type Admin = {
  id: string;
  email: string;
  display_name: string | null;
  role: AdminRole;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          category?: string;
          images?: string[];
          cover_image?: string | null;
          materials?: string[];
          moq?: number | null;
          price_range?: string | null;
          featured?: boolean;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Product>;
        Relationships: [];
      };
      pages: {
        Row: Page;
        Insert: {
          id?: string;
          slug: string;
          title: string;
          hero_image?: string | null;
          sections?: PageSection[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Page>;
        Relationships: [];
      };
      inquiries: {
        Row: Inquiry;
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          status?: InquiryStatus;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Inquiry>;
        Relationships: [];
      };
      admins: {
        Row: Admin;
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          role?: AdminRole;
          created_at?: string;
        };
        Update: Partial<Admin>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
