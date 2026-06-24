import { useState } from 'react'
import './App.css'
import { LeadForm } from './components/LeadForm'
import { SaleForm } from './components/SaleForm'
import { SummaryPanel } from './components/SummaryPanel'

type ViewKey = 'lead' | 'sale' | 'summary'

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('lead')
  const [refreshToken, setRefreshToken] = useState(0)

  function handleDataChanged() {
    setRefreshToken((current) => current + 1)
  }

  return (
    <main className="app-shell">
      <header className="masthead surface">
        <div>
          <p className="eyebrow">Street Sales Intelligence</p>
          <h1>Operacao de rua, sem friccao.</h1>
        </div>
        <p className="hero-copy">
          Cadastre leads, registre vendas e veja o resumo do dia em poucos toques. O Supabase vira a
          fonte principal e ClickUp/Notion ficam fora da tela operacional.
        </p>

        <nav className="tab-bar" aria-label="Telas principais">
          <button
            type="button"
            className={`tab-button ${activeView === 'lead' ? 'active' : ''}`}
            onClick={() => setActiveView('lead')}
          >
            Novo Lead
          </button>
          <button
            type="button"
            className={`tab-button ${activeView === 'sale' ? 'active' : ''}`}
            onClick={() => setActiveView('sale')}
          >
            Nova Venda
          </button>
          <button
            type="button"
            className={`tab-button ${activeView === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveView('summary')}
          >
            Resumo
          </button>
        </nav>
      </header>

      <section className="content-stack">
        {activeView === 'lead' ? <LeadForm onSaved={handleDataChanged} /> : null}
        {activeView === 'sale' ? <SaleForm onSaved={handleDataChanged} /> : null}
        {activeView === 'summary' ? <SummaryPanel refreshToken={refreshToken} /> : null}
      </section>
    </main>
  )
}

export default App
