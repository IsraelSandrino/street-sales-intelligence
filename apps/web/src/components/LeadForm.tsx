import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createLead } from '../services/leadRepository'

type GeoState = {
  status: 'idle' | 'requesting' | 'ready' | 'denied' | 'error'
  message: string
}

const initialGeoState: GeoState = {
  status: 'idle',
  message: 'Aguardando GPS.',
}

type LeadFormProps = {
  onSaved: () => void
}

function getGeoMessage(status: GeoState['status']) {
  switch (status) {
    case 'requesting':
      return 'Capturando localizacao agora.'
    case 'ready':
      return 'Localizacao capturada com sucesso.'
    case 'denied':
      return 'GPS negado. Voce ainda pode salvar o lead sem localizacao.'
    case 'error':
      return 'Nao foi possivel obter o GPS neste aparelho.'
    default:
      return 'Aguardando GPS.'
  }
}

export function LeadForm({ onSaved }: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [geoState, setGeoState] = useState<GeoState>(initialGeoState)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const requestedLocation = useRef(false)
  const secureContext = typeof window !== 'undefined' && window.isSecureContext

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState({ status: 'error', message: 'GPS nao suportado neste navegador.' })
      return
    }

    if (!secureContext) {
      setGeoState({
        status: 'error',
        message: 'Abra o app em HTTPS para permitir a localizacao no celular.',
      })
      return
    }

    setGeoState({ status: 'requesting', message: getGeoMessage('requesting') })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGeoState({ status: 'ready', message: getGeoMessage('ready') })
      },
      (error) => {
        if (error.code === 1) {
          setGeoState({ status: 'denied', message: getGeoMessage('denied') })
          return
        }

        setGeoState({ status: 'error', message: getGeoMessage('error') })
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 120000,
      },
    )
  }, [secureContext])

  useEffect(() => {
    if (requestedLocation.current) {
      return
    }

    requestedLocation.current = true
    requestLocation()
  }, [requestLocation])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanedName = name.trim()
    const cleanedPhone = phone.trim()

    if (!cleanedName || !cleanedPhone) {
      setFeedback({ type: 'error', message: 'Preencha nome e telefone para continuar.' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      await createLead({
        name: cleanedName,
        phone: cleanedPhone,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
      })

      setName('')
      setPhone('')
      setFeedback({ type: 'success', message: 'Lead salvo no Supabase.' })
      onSaved()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Nao foi possivel salvar o lead.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="surface form-stack" onSubmit={handleSubmit}>
      <header className="surface-header">
        <div>
          <p className="eyebrow">Novo Lead</p>
          <h2>Cadastro em segundos.</h2>
        </div>
        <p className="surface-note">Supabase direto. Sem CRM no meio do caminho.</p>
      </header>

      {!secureContext ? (
        <p className="alert warning" aria-live="polite">
          Abra este app em HTTPS para liberar o GPS no celular.
        </p>
      ) : null}

      <div className="geo-chip" aria-live="polite">
        <span className={`geo-dot ${geoState.status}`} />
        <span>{geoState.message}</span>
      </div>

      <div className="micro-grid">
        <div className="micro-pill">
          <span>Lat</span>
          <strong>{coordinates ? coordinates.latitude.toFixed(5) : '--'}</strong>
        </div>
        <div className="micro-pill">
          <span>Long</span>
          <strong>{coordinates ? coordinates.longitude.toFixed(5) : '--'}</strong>
        </div>
      </div>

      {(geoState.status === 'denied' || geoState.status === 'error') && (
        <button className="secondary-button" type="button" onClick={requestLocation}>
          Ativar localizacao
        </button>
      )}

      <label className="field">
        <span>Nome</span>
        <input
          autoComplete="name"
          name="name"
          required
          placeholder="Nome do lead"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="field">
        <span>Telefone</span>
        <input
          autoComplete="tel"
          inputMode="tel"
          name="phone"
          required
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar lead'}
      </button>

      {feedback ? (
        <p className={`feedback ${feedback.type}`} aria-live="polite">
          {feedback.message}
        </p>
      ) : null}
    </form>
  )
}
