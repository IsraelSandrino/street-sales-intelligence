import type {
  Lead,
  LeadInsert,
  Product,
  ProductInsert,
  Sale,
  SaleInsert,
  SaleItem,
  SaleItemInsert,
} from './lead'

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: Lead
        Insert: LeadInsert
        Update: Partial<LeadInsert>
        Relationships: []
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: Partial<ProductInsert>
        Relationships: []
      }
      sales: {
        Row: Sale
        Insert: SaleInsert
        Update: Partial<SaleInsert>
        Relationships: [
          {
            foreignKeyName: 'sales_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      sale_items: {
        Row: SaleItem
        Insert: SaleItemInsert
        Update: Partial<SaleItemInsert>
        Relationships: [
          {
            foreignKeyName: 'sale_items_sale_id_fkey'
            columns: ['sale_id']
            referencedRelation: 'sales'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
