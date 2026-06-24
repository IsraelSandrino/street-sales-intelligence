import { getSupabaseClient } from './supabaseClient'
import type { LeadSummary, SaleItemInsert, SaleInsert } from '../types/lead'

function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export async function createSale(payload: {
  leadId: string
  saleDate?: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
}): Promise<{ sale: SaleInsert & { id: string }; items: SaleItemInsert[] }> {
  const supabase = getSupabaseClient()
  const totalAmount = roundMoney(
    payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  )

  const salePayload: SaleInsert = {
    lead_id: payload.leadId,
    total_amount: totalAmount,
    sale_date: payload.saleDate ?? new Date().toISOString(),
  }

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert(salePayload)
    .select('id')
    .single()

  if (saleError || !sale) {
    throw new Error(saleError?.message || 'Nao foi possivel salvar a venda.')
  }

  const saleItems: SaleItemInsert[] = payload.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: roundMoney(item.unitPrice),
    subtotal: roundMoney(item.quantity * item.unitPrice),
  }))

  const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)

  if (itemsError) {
    await supabase.from('sales').delete().eq('id', sale.id)
    throw new Error(itemsError.message || 'Nao foi possivel salvar os itens da venda.')
  }

  return {
    sale: {
      ...salePayload,
      id: sale.id,
    },
    items: saleItems,
  }
}

export async function getTodaySalesSummary(): Promise<LeadSummary> {
  const supabase = getSupabaseClient()
  const { start, end } = getTodayRange()

  const [{ count: leadsToday, error: leadsError }, salesResponse] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start)
      .lt('created_at', end),
    supabase
      .from('sales')
      .select('total_amount')
      .gte('sale_date', start)
      .lt('sale_date', end)
      .order('sale_date', { ascending: false }),
  ])

  if (leadsError) {
    throw new Error(leadsError.message || 'Nao foi possivel calcular os leads de hoje.')
  }

  if (salesResponse.error) {
    throw new Error(salesResponse.error.message || 'Nao foi possivel calcular as vendas de hoje.')
  }

  const salesToday = salesResponse.count ?? salesResponse.data?.length ?? 0
  const revenueToday = roundMoney(
    (salesResponse.data ?? []).reduce((sum, sale) => sum + Number(sale.total_amount), 0),
  )

  return {
    leadsToday: leadsToday ?? 0,
    salesToday,
    revenueToday,
  }
}
