import { getSupabaseClient } from './supabaseClient'
import type { Product } from '../types/lead'

function buildProductSelect() {
  return 'id,name,category,price,active,created_at,updated_at'
}

export async function listActiveProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient()
  const response = await supabase
    .from('products')
    .select(buildProductSelect())
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  const { data, error } = response as {
    data: Product[] | null
    error: { message?: string } | null
  }

  if (error) {
    throw new Error(error.message || 'Nao foi possivel carregar os produtos.')
  }

  return (data ?? []).map((product) => ({
    ...product,
    price: Number(product.price),
  }))
}
