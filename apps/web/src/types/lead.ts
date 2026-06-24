export type Lead = {
  id: string
  name: string
  phone: string
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export type LeadInsert = {
  name: string
  phone: string
  latitude: number | null
  longitude: number | null
}

export type Product = {
  id: string
  name: string
  category: string
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

export type ProductInsert = {
  name: string
  category: string
  price: number
  active?: boolean
}

export type Sale = {
  id: string
  lead_id: string
  total_amount: number
  sale_date: string
  created_at: string
  updated_at: string
}

export type SaleInsert = {
  lead_id: string
  total_amount: number
  sale_date?: string
}

export type SaleItem = {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export type SaleItemInsert = {
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type LeadSummary = {
  leadsToday: number
  salesToday: number
  revenueToday: number
}

export type SaleDraftItem = {
  productId: string
  quantity: number
}
