import { useEffect, useState } from 'react'
import { loadDailySummary } from '../services/dashboardRepository'
import type { LeadSummary } from '../types/lead'

type SummaryPanelProps = {
  refreshToken: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function SummaryPanel({ refreshToken }: SummaryPanelProps) {
  const [summary, setSummary] = useState<LeadSummary>({
    leadsToday: 0,
    salesToday: 0,
    revenueToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      setLoading(true)
      setError(null)

      try {
        const data = await loadDailySummary()

        if (active) {
          setSummary(data)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o resumo.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSummary()

    return () => {
      active = false
    }
  }, [refreshToken])

  return (
    <section className="surface form-stack">
      <header className="surface-header">
        <div>
          <p className="eyebrow">Resumo do Dia</p>
          <h2>Visao minima da operacao.</h2>
        </div>
        <p className="surface-note">Acompanhe leads, vendas e receita sem sair do campo.</p>
      </header>

      {loading ? <p className="helper-text">Atualizando resumo...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}

      <div className="summary-grid">
        <article className="summary-card">
          <span>Leads hoje</span>
          <strong>{summary.leadsToday}</strong>
        </article>
        <article className="summary-card">
          <span>Vendas hoje</span>
          <strong>{summary.salesToday}</strong>
        </article>
        <article className="summary-card accent">
          <span>Receita total</span>
          <strong>{formatCurrency(summary.revenueToday)}</strong>
        </article>
      </div>
    </section>
  )
}
