type LeadPayload = {
  nome: string
  telefone: string
  latitude: number | null
  longitude: number | null
  bairro: string | null
  rua: string | null
  numero: string | null
  cep: string | null
  cidade: string | null
  estado: string | null
  origem: 'pwa'
  status: 'novo_contato'
}

type SyncRequest = {
  lead?: LeadPayload
  leadLabel?: string
}

type ClickupTask = {
  id: string
  name?: string
  description?: string
}

type ClickupTaskListResponse = {
  tasks?: ClickupTask[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const CLICKUP_API_BASE_URL = 'https://api.clickup.com/api/v2'
const MAX_PAGES_TO_SCAN = 10

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function readRequiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim()

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function buildLeadLabel(lead: LeadPayload, fallbackLabel?: string) {
  if (fallbackLabel?.trim()) {
    return fallbackLabel.trim()
  }

  const phoneDigits = normalizePhone(lead.telefone)
  return phoneDigits ? `Lead PWA - ${phoneDigits}` : `Lead PWA - ${lead.nome.trim()}`
}

function buildLeadDescription(lead: LeadPayload) {
  const locationParts = [
    lead.rua,
    lead.numero,
    lead.bairro,
    lead.cidade,
    lead.estado,
    lead.cep,
  ].filter((value): value is string => Boolean(value && value.trim()))

  const coordinates =
    lead.latitude !== null && lead.longitude !== null
      ? `${lead.latitude}, ${lead.longitude}`
      : 'sem localizacao'

  return [
    'Lead capturado via PWA.',
    '',
    `Nome: ${lead.nome}`,
    `Telefone: ${lead.telefone}`,
    `Localizacao: ${coordinates}`,
    `Endereco: ${locationParts.length > 0 ? locationParts.join(', ') : 'nao informado'}`,
    `Origem: ${lead.origem}`,
    `Status: ${lead.status}`,
  ].join('\n')
}

function parseTaskListResponse(data: unknown): ClickupTask[] {
  if (Array.isArray(data)) {
    return data as ClickupTask[]
  }

  if (data && typeof data === 'object' && 'tasks' in data) {
    const response = data as ClickupTaskListResponse
    return Array.isArray(response.tasks) ? response.tasks : []
  }

  return []
}

async function clickupRequest(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${CLICKUP_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  let data: unknown = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'err' in data && typeof data.err === 'string'
        ? data.err
        : null) ??
      (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : null) ??
      `ClickUp returned HTTP ${response.status}`

    throw new Error(message)
  }

  return data
}

async function findExistingTaskId(listId: string, token: string, taskName: string) {
  for (let page = 0; page < MAX_PAGES_TO_SCAN; page += 1) {
    const query = new URLSearchParams({
      page: String(page),
      archived: 'false',
    })

    const data = (await clickupRequest(
      `/list/${listId}/task?${query.toString()}`,
      token,
      {
        method: 'GET',
      },
    )) as ClickupTaskListResponse | ClickupTask[]

    const tasks = parseTaskListResponse(data)
    const match = tasks.find((task) => task.name?.trim() === taskName)

    if (match) {
      return match.id
    }

    if (tasks.length < 100) {
      break
    }
  }

  return null
}

async function upsertTask(lead: LeadPayload, leadLabel: string) {
  const token = readRequiredEnv('CLICKUP_API_TOKEN')
  const listId = readRequiredEnv('CLICKUP_LIST_ID')
  const description = buildLeadDescription(lead)
  const existingTaskId = await findExistingTaskId(listId, token, leadLabel)

  if (existingTaskId) {
    const updated = (await clickupRequest(`/task/${existingTaskId}`, token, {
      method: 'PUT',
      body: JSON.stringify({
        name: leadLabel,
        description,
      }),
    })) as ClickupTask

    return {
      action: 'updated' as const,
      taskId: updated.id,
    }
  }

  const created = (await clickupRequest(`/list/${listId}/task`, token, {
    method: 'POST',
    body: JSON.stringify({
      name: leadLabel,
      description,
      notify_all: false,
    }),
  })) as ClickupTask

  return {
    action: 'created' as const,
    taskId: created.id,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        ok: false,
        message: 'Method not allowed.',
      },
      405,
    )
  }

  try {
    const payload = (await req.json()) as SyncRequest
    const lead = payload.lead

    if (!lead) {
      return jsonResponse({
        ok: false,
        message: 'Missing lead payload.',
      })
    }

    if (!lead.nome?.trim() || !lead.telefone?.trim()) {
      return jsonResponse({
        ok: false,
        message: 'Lead payload missing nome or telefone.',
      })
    }

    const leadLabel = buildLeadLabel(lead, payload.leadLabel)
    const result = await upsertTask(lead, leadLabel)

    return jsonResponse({
      ok: true,
      ...result,
    })
  } catch (error) {
    console.error('[clickup-sync] Unexpected error', error)

    return jsonResponse({
      ok: false,
      message: error instanceof Error ? error.message : 'Unexpected error while syncing to ClickUp.',
    })
  }
})
