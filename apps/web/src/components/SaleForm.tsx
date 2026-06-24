import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { formatPhone, searchLeads } from '../services/leadRepository'
import { createSale } from '../services/salesRepository'
import { listActiveProducts } from '../services/productRepository'
import type { Lead, Product, SaleDraftItem } from '../types/lead'

type SaleFormProps = {
  onSaved: () => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function SaleForm({ onSaved }: SaleFormProps) {
  const [leadQuery, setLeadQuery] = useState('')
  const [leadResults, setLeadResults] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productQuery, setProductQuery] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  useEffect(() => {
    let active = true

    async function loadProducts() {
      setLoadingProducts(true)

      try {
        const rows = await listActiveProducts()

        if (active) {
          setProducts(rows)
        }
      } catch (error) {
        if (active) {
          setFeedback({
            type: 'error',
            message: error instanceof Error ? error.message : 'Nao foi possivel carregar produtos.',
          })
        }
      } finally {
        if (active) {
          setLoadingProducts(false)
        }
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const term = leadQuery.trim()

    if (term.length === 0) {
      setLeadResults([])
      setLoadingLeads(false)
      return () => {
        active = false
      }
    }

    const timeout = window.setTimeout(async () => {
      setLoadingLeads(true)

      try {
        const rows = await searchLeads(term)

        if (active) {
          setLeadResults(rows)
        }
      } catch (error) {
        if (active) {
          setFeedback({
            type: 'error',
            message: error instanceof Error ? error.message : 'Nao foi possivel buscar leads.',
          })
        }
      } finally {
        if (active) {
          setLoadingLeads(false)
        }
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [leadQuery])

  const selectedItems = useMemo(() => {
    return products
      .map((product) => {
        const quantity = quantities[product.id] ?? 0

        if (quantity <= 0) {
          return null
        }

        const subtotal = quantity * Number(product.price)

        return {
          product,
          quantity,
          subtotal,
        }
      })
      .filter((item): item is { product: Product; quantity: number; subtotal: number } => item !== null)
  }, [products, quantities])

  const filteredProducts = useMemo(() => {
    const term = normalizeSearch(productQuery)

    if (!term) {
      return []
    }

    return products.filter((product) => {
      const name = normalizeSearch(product.name)
      return name.includes(term)
    })
  }, [productQuery, products])

  const selectedProductIds = useMemo(() => new Set(selectedItems.map((item) => item.product.id)), [selectedItems])

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.subtotal, 0)
  }, [selectedItems])

  function setItemQuantity(productId: string, quantity: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(0, quantity),
    }))
  }

  function addProduct(productId: string) {
    setItemQuantity(productId, (quantities[productId] ?? 0) + 1)
  }

  function handleProductSelect(productId: string) {
    addProduct(productId)
    setProductQuery('')
  }

  function handleLeadSelect(lead: Lead) {
    setSelectedLead(lead)
    setLeadQuery('')
    setLeadResults([])
  }

  function clearDraft() {
    setLeadQuery('')
    setLeadResults([])
    setSelectedLead(null)
    setProductQuery('')
    setQuantities({})
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedLead) {
      setFeedback({ type: 'error', message: 'Selecione um lead para continuar.' })
      return
    }

    if (selectedItems.length === 0) {
      setFeedback({ type: 'error', message: 'Selecione pelo menos um produto.' })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const payloadItems: SaleDraftItem[] = selectedItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))

      await createSale({
        leadId: selectedLead.id,
        items: payloadItems.map((item) => {
          const product = products.find((current) => current.id === item.productId)

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(product?.price ?? 0),
          }
        }),
      })

      clearDraft()
      setFeedback({ type: 'success', message: 'Venda salva no Supabase.' })
      onSaved()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Nao foi possivel salvar a venda.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="surface form-stack" onSubmit={handleSubmit}>
      <header className="surface-header">
        <div>
          <p className="eyebrow">Nova Venda</p>
          <h2>Selecionar lead, produtos e totalizar.</h2>
        </div>
        <p className="surface-note">Fluxo rapido para fechar a venda na abordagem.</p>
      </header>

      <label className="field">
        <span>Buscar lead</span>
        <input
          autoComplete="off"
          placeholder="Nome ou telefone"
          value={leadQuery}
          onChange={(event) => {
            setLeadQuery(event.target.value)
            setSelectedLead(null)
          }}
        />
      </label>

      {leadQuery.trim() ? (
        <div className="results-stack">
          {loadingLeads ? <p className="helper-text">Buscando leads...</p> : null}
          {!loadingLeads && leadResults.length === 0 ? (
            <p className="helper-text">Nenhum lead encontrado. Tente outro nome ou telefone.</p>
          ) : null}

          {leadResults.map((lead) => {
            const isSelected = selectedLead?.id === lead.id

            return (
              <button
                key={lead.id}
                type="button"
                className={`result-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleLeadSelect(lead)}
              >
                <strong>{lead.name}</strong>
                <span>{formatPhone(lead.phone)}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      {selectedLead ? (
        <section className="selected-lead">
          <p className="selected-lead-label">Lead selecionado</p>
          <strong>{selectedLead.name}</strong>
          <span>{formatPhone(selectedLead.phone)}</span>
          <button
            className="link-button"
            type="button"
            onClick={() => {
              setSelectedLead(null)
              setLeadQuery('')
            }}
          >
            Trocar lead
          </button>
        </section>
      ) : null}

      <section className="product-section">
        <div className="section-row">
          <h3>Produtos</h3>
          {loadingProducts ? <span className="helper-text">Carregando...</span> : null}
        </div>

        {!loadingProducts && products.length === 0 ? (
          <p className="helper-text">Nenhum produto ativo cadastrado.</p>
        ) : null}

        <label className="field">
          <span>Buscar produto</span>
          <input
            autoComplete="off"
            placeholder="Digite o nome do produto"
            value={productQuery}
            onChange={(event) => setProductQuery(event.target.value)}
          />
        </label>

        {productQuery.trim() ? (
          <div className="results-stack">
            {filteredProducts.length === 0 ? (
              <p className="helper-text">Nenhum produto encontrado. Tente outro nome.</p>
            ) : (
              filteredProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0
                const isSelected = selectedProductIds.has(product.id)

                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`result-card product-result ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <div className="product-info">
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.category}</span>
                      </div>
                      <b>{formatCurrency(Number(product.price))}</b>
                    </div>
                    <span className="result-meta">
                      {quantity > 0 ? `Selecionado ${quantity}x` : 'Toque para adicionar'}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <p className="helper-text">Digite parte do nome para encontrar o produto mais rápido.</p>
        )}

        {selectedItems.length > 0 ? (
          <div className="selected-products-stack">
            <div className="section-row">
              <h3>Produtos selecionados</h3>
              <span className="helper-text">{selectedItems.length} item(ns)</span>
            </div>

            <div className="product-grid">
              {selectedItems.map(({ product, quantity, subtotal }) => (
                <article key={product.id} className="product-card selected">
                  <div className="product-info">
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.category}</span>
                    </div>
                    <b>{formatCurrency(Number(product.price))}</b>
                  </div>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="quantity-button"
                      onClick={() => setItemQuantity(product.id, quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button
                      type="button"
                      className="quantity-button"
                      onClick={() => setItemQuantity(product.id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="card-footer">
                    <p className="subtotal-line">Subtotal: {formatCurrency(subtotal)}</p>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setItemQuantity(product.id, 0)}
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="total-banner">
        <span>Total da venda</span>
        <strong>{formatCurrency(totalAmount)}</strong>
      </section>

      <button
        className="primary-button"
        type="submit"
        disabled={saving || !selectedLead || selectedItems.length === 0}
      >
        {saving ? 'Salvando...' : 'Salvar venda'}
      </button>

      {feedback ? (
        <p className={`feedback ${feedback.type}`} aria-live="polite">
          {feedback.message}
        </p>
      ) : null}
    </form>
  )
}
