import { getTodaySalesSummary } from './salesRepository'
import type { LeadSummary } from '../types/lead'

export async function loadDailySummary(): Promise<LeadSummary> {
  return await getTodaySalesSummary()
}
