import { getSupabaseClient } from './supabaseClient'
import type { Lead, LeadInsert } from '../types/lead'

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

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function buildLeadSelect() {
  return 'id,name,phone,latitude,longitude,created_at,updated_at'
}

export function formatPhone(phone: string) {
  const digits = normalizePhone(phone)

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return phone
}

export async function createLead(payload: LeadInsert): Promise<Lead> {
  const supabase = getSupabaseClient()
  const normalizedPayload: LeadInsert = {
    name: payload.name.trim(),
    phone: normalizePhone(payload.phone),
    latitude: payload.latitude,
    longitude: payload.longitude,
  }

  const response = await supabase
    .from('leads')
    .insert(normalizedPayload)
    .select(buildLeadSelect())
    .single()
  const { data, error } = response as {
    data: Lead | null
    error: { message?: string } | null
  }

  if (error || !data) {
    throw new Error(error?.message || 'Nao foi possivel salvar o lead.')
  }

  return data
}

export async function searchLeads(term: string, limit = 12): Promise<Lead[]> {
  const supabase = getSupabaseClient()
  const normalizedTerm = term.trim()

  if (normalizedTerm.length === 0) {
    return []
  }

  let query = supabase
    .from('leads')
    .select(buildLeadSelect())
    .order('created_at', { ascending: false })
    .limit(limit)

  const digits = normalizePhone(normalizedTerm)
  const clauses = [`name.ilike.%${normalizedTerm}%`]

  if (digits.length > 0) {
    clauses.push(`phone.ilike.%${digits}%`)
  }

  query = query.or(clauses.join(','))

  const response = await query
  const { data, error } = response as {
    data: Lead[] | null
    error: { message?: string } | null
  }

  if (error) {
    throw new Error(error.message || 'Nao foi possivel buscar leads.')
  }

  return data ?? []
}

export async function getTodayLeadCount(): Promise<number> {
  const supabase = getSupabaseClient()
  const { start, end } = getTodayRange()

  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start)
    .lt('created_at', end)

  if (error) {
    throw new Error(error.message || 'Nao foi possivel calcular os leads do dia.')
  }

  return count ?? 0
}
