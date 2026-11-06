/**
 * Supabase 数据库类型定义
 * 与 supabase/schema.sql 保持一致。
 * 若执行 `supabase gen types` 生成了正式类型，可整体替换本文件。
 *
 * 2026-11-06：业务表已从 public 搬到 yolo schema。
 * 这里的顶层键**必须是字面量 `yolo`** —— supabase-js 的
 * `SupabaseClient<Database, SchemaName>` 用 `keyof Database` 推 SchemaName，
 * 键名和 `config.ts` 里的 DB_SCHEMA 不一致就会在 `.from()` 上全线报类型错。
 */

export type InquiryStatus = "new" | "read" | "replied";
export type AdminRole = "admin" | "editor";

/**
 * 分类（树状多级）。
 *
 * 【为什么 slug 而不是 id 进 products】
 * `products.category` 存的是 slug，外键指到这里。改 slug 靠 `on update cascade`
 * 同步到产品上，不用批量改数据。详见 src/lib/categories.ts 顶部说明。
 */
export type Category = {
  id: string;
  parent_id: string | null;
  slug: string;
  name_zh: string;
  name_en: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

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
  /** 首页滚动图组专用的氛围图；不进商品详情图集，为空则该商品不进图墙 */
  mood_image: string | null;
  materials: string[];
  moq: number | null;
  price_range: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
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
  yolo: {
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
          mood_image?: string | null;
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
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          parent_id?: string | null;
          slug: string;
          name_zh: string;
          name_en: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Category, "id">>;
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
