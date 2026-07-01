import React, { useState, useCallback, useEffect } from 'react'
import { orderApi } from '../api/client.js'
import {
  Card, SectionHeader, Button, FormField, Input,
  StatusBadge, Divider, EmptyState, ResponsePanel, Tag
} from '../components/ui.jsx'
import SagaVisualizer from '../components/SagaVisualizer.jsx'

/* ─── Create Order Form ───────────────────────────────────────────────── */
function CreateOrderPanel({ onOrderCreated }) {
  const [form, setForm] = useState({ productId: 'P1001', userId: 'U1001', quantity: '2', amount: '49.99' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const submit = useCallback(async () => {
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await orderApi.create({
        productId: form.productId.trim(),
        userId: form.userId.trim(),
        quantity: parseInt(form.quantity, 10),
        amount: parseFloat(form.amount),
      })
      setResult(res)
      onOrderCreated?.(res)
    } catch (e) {
      setError(e.detail ?? { message: e.message })
    } finally {
      setLoading(false)
    }
  }, [form, onOrderCreated])

  const presets = [
    { label: 'Happy path', body: { productId: 'P1001', userId: 'U1001', quantity: '2', amount: '49.99' } },
    { label: 'Large order', body: { productId: 'P2042', userId: 'U9999', quantity: '10', amount: '299.00' } },
    { label: 'Invalid', body: { productId: '', userId: '', quantity: '0', amount: '0' } },
  ]

  return (
    <Card>
      <SectionHeader icon="➕" title="Create Order" subtitle="POST /orders → triggers the full Saga" />

      {/* Presets */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Quick fill:</span>
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => setForm(p.body)}
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--text-secondary)',
              fontSize: 12,
              padding: '4px 10px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Form grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-5)',
      }}>
        <FormField label="Product ID" hint="e.g. P1001">
          <Input value={form.productId} onChange={set('productId')} placeholder="P1001" />
        </FormField>
        <FormField label="User ID" hint="e.g. U1001">
          <Input value={form.userId} onChange={set('userId')} placeholder="U1001" />
        </FormField>
        <FormField label="Quantity" hint="Min 1">
          <Input value={form.quantity} onChange={set('quantity')} type="number" placeholder="1" />
        </FormField>
        <FormField label="Amount (USD)" hint="Min 0.01">
          <Input value={form.amount} onChange={set('amount')} type="number" step="0.01" placeholder="49.99" />
        </FormField>
      </div>

      <Button onClick={submit} loading={loading}>
        🚀 Place Order
      </Button>

      {(result || error) && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <ResponsePanel data={result} error={error} label="Order Created" />
        </div>
      )}
    </Card>
  )
}

/* ─── Get Order By ID ─────────────────────────────────────────────────── */
function GetOrderPanel({ trackedOrderId, onTrack }) {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const lookup = useCallback(async (id) => {
    const target = id ?? orderId.trim()
    if (!target) return
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await orderApi.getById(target)
      setResult(res)
    } catch (e) {
      setError(e.detail ?? { message: e.message })
    } finally {
      setLoading(false)
    }
  }, [orderId])

  return (
    <Card>
      <SectionHeader icon="🔍" title="Get Order" subtitle="GET /orders/:id" />
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
        <div style={{ flex: '1 1 200px' }}>
          <Input
            value={orderId}
            onChange={setOrderId}
            placeholder="Order UUID"
          />
        </div>
        {trackedOrderId && (
          <button
            onClick={() => { setOrderId(trackedOrderId); lookup(trackedOrderId) }}
            style={{
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent)44',
              borderRadius: 'var(--r-sm)',
              color: 'var(--accent)',
              fontSize: 12,
              padding: '9px 12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            ↩ Use last order
          </button>
        )}
        <Button onClick={() => lookup()} loading={loading} variant="secondary">
          Fetch
        </Button>
      </div>
      {(result || error) && <ResponsePanel data={result} error={error} />}
      {result && (
        <div style={{ marginTop: 'var(--sp-3)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          <StatusBadge status={result.status} />
          <button
            onClick={() => { onTrack?.(result); setOrderId(result.orderId) }}
            style={{
              fontSize: 12, color: 'var(--accent)', background: 'transparent',
              border: '1px solid var(--accent)44', borderRadius: 'var(--r-sm)',
              padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Track in Saga Visualizer
          </button>
        </div>
      )}
    </Card>
  )
}

/* ─── All Orders ──────────────────────────────────────────────────────── */
function AllOrdersPanel({ onTrack }) {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await orderApi.getAll()
      setOrders(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e.detail ?? { message: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-5)' }}>
        <SectionHeader icon="📋" title="All Orders" subtitle="GET /orders" />
        <Button onClick={fetchAll} loading={loading} variant="secondary">
          {orders ? '↺ Refresh' : 'Load Orders'}
        </Button>
      </div>

      {error && <ResponsePanel error={error} />}

      {orders && orders.length === 0 && (
        <EmptyState icon="📭" title="No orders yet" message="Create one above to get started." />
      )}

      {orders && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: 'var(--sp-3)',
            padding: '6px var(--sp-3)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            borderBottom: '1px solid var(--border)',
          }}>
            <span>Order ID</span>
            <span>User</span>
            <span>Amount</span>
            <span>Status</span>
            <span></span>
          </div>

          {orders.map(o => (
            <div key={o.orderId} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: 'var(--sp-3)',
              alignItems: 'center',
              padding: '8px var(--sp-3)',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-raised)',
              border: '1px solid transparent',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                {o.orderId?.slice(0, 12)}…
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                {o.userId}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>
                ${typeof o.amount === 'number' ? o.amount.toFixed(2) : o.amount}
              </span>
              <StatusBadge status={o.status} />
              <button
                onClick={() => onTrack?.(o)}
                style={{
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent)33',
                  borderRadius: 4,
                  color: 'var(--accent)',
                  fontSize: 11,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                }}
              >
                Track
              </button>
            </div>
          ))}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 'var(--sp-2)', fontFamily: 'var(--font-mono)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </Card>
  )
}

const TERMINAL_STATUSES = new Set(['COMPLETED', 'INVENTORY_FAILED', 'PAYMENT_FAILED'])

function AutoPollingStatus({ tracked, setTracked }) {
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (!tracked?.orderId) return
    if (TERMINAL_STATUSES.has(tracked.status)) { setPolling(false); return }

    setPolling(true)
    const interval = setInterval(async () => {
      try {
        const fresh = await orderApi.getById(tracked.orderId)
        setTracked(fresh)
        if (TERMINAL_STATUSES.has(fresh.status)) {
          clearInterval(interval)
          setPolling(false)
        }
      } catch {
        clearInterval(interval)
        setPolling(false)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [tracked?.orderId, tracked?.status])

  return (
    <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <StatusBadge status={tracked.status} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {tracked.orderId}
      </span>
      {polling ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse-ring 1.2s ease-out infinite',
            display: 'inline-block',
          }} />
          polling every 2s…
        </span>
      ) : (
        <button
          onClick={async () => {
            try { const fresh = await orderApi.getById(tracked.orderId); setTracked(fresh) } catch {}
          }}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)',
            fontSize: 12, padding: '4px 10px', cursor: 'pointer',
          }}
        >
          ↺ Refresh
        </button>
      )}
    </div>
  )
}

/* ─── Page root ───────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const [lastCreated, setLastCreated] = useState(null)
  const [tracked, setTracked] = useState(null)

  const handleOrderCreated = (order) => {
    setLastCreated(order)
    setTracked(order)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', animation: 'fade-in .25s ease' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-.03em',
          marginBottom: 6,
        }}>Orders</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Manage orders and watch the Saga pattern in action.
        </p>
      </div>

      {/* Saga visualizer always visible once we have an order */}
      {tracked && (
        <Card>
          <SectionHeader icon="⚡" title="Saga Visualizer" subtitle="Live state of the distributed transaction" />
          <SagaVisualizer
            currentStatus={tracked.status}
            orderId={tracked.orderId}
            isActive={true}
          />
          <Divider />
          <AutoPollingStatus tracked={tracked} setTracked={setTracked} />
        </Card>
      )}

      <CreateOrderPanel onOrderCreated={handleOrderCreated} />
      <GetOrderPanel trackedOrderId={lastCreated?.orderId} onTrack={setTracked} />
      <AllOrdersPanel onTrack={setTracked} />
    </div>
  )
}
