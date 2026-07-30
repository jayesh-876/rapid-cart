// ─── Request/Response log (simple pub-sub so components can subscribe) ───────

const listeners = new Set()
export const logStore = {
  entries: [],
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  push(entry) {
    logStore.entries = [entry, ...logStore.entries].slice(0, 100)
    listeners.forEach(fn => fn(logStore.entries))
  },
}

// ─── Base fetcher ─────────────────────────────────────────────────────────────

async function request(method, url, body) {
  const id = Date.now()
  const ts = new Date().toISOString()

  let status = null
  let data = null
  let error = null

  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }
    const res = await fetch(url, opts)
    status = res.status
    const text = await res.text()
    try { data = JSON.parse(text) } catch { data = text }
    if (!res.ok) error = data
  } catch (e) {
    error = { message: e.message }
    status = 0
  }

  logStore.push({ id, ts, method, url, body, status, data, error })

  if (error) throw Object.assign(new Error('API error'), { status, detail: error })
  return data
}

// ─── Order Service  (port 8081) ───────────────────────────────────────────────

export const orderApi = {
  create: (body)    => request('POST', '/orders', body),
  getById: (id)     => request('GET', `/orders/${id}`),
  getAll: ()        => request('GET', '/orders'),
}

// ─── Inventory Service  (port 8082) ───────────────────────────────────────────

export const inventoryApi = {
  addStock: (body)  => request('POST', '/inventory/add', body),
  getItems: ()      => request('GET', '/inventory/items'),
}

// ─── Health checks ────────────────────────────────────────────────────────────

export const healthApi = {
  payment:      () => request('GET', '/payment/health'),
  notification: () => request('GET', '/notification/health'),
  // Order & Inventory don't have dedicated health endpoints;
  // we hit lightweight read endpoints as probes.
  order:        () => request('GET', '/orders'),
  inventory:    () => request('GET', '/inventory/items'),
}
