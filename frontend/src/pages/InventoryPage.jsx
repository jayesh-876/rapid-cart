import React, { useState, useCallback } from 'react'
import { inventoryApi } from '../api/client.js'
import { Card, SectionHeader, Button, FormField, Input, ResponsePanel, EmptyState } from '../components/ui.jsx'

const PRESETS = [
  { label: '✅ Valid',    body: { productId: 'P1001', quantity: '5' } },
  { label: 'Large batch', body: { productId: 'P2042', quantity: '100' } },
  { label: '❌ Invalid',  body: { productId: '', quantity: '0' } },
]

function InventoryTablePanel() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await inventoryApi.getItems()
      setItems(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e.detail ?? { message: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const totalStock = items?.reduce((sum, i) => sum + i.stock, 0) ?? 0

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-5)' }}>
        <SectionHeader icon="📊" title="Current Inventory" subtitle="GET /inventory/items" />
        <Button onClick={fetchItems} loading={loading} variant="secondary">
          {items ? '↺ Refresh' : 'Load Items'}
        </Button>
      </div>

      {error && <ResponsePanel error={error} />}

      {items && items.length === 0 && (
        <EmptyState icon="📦" title="No inventory yet" message="Add stock above to seed your first product." />
      )}

      {items && items.length > 0 && (
        <>
          {/* Summary bar */}
          <div style={{
            display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)',
            padding: 'var(--sp-3) var(--sp-4)',
            background: 'var(--bg-raised)', borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Products</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{items.length}</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Total Units</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--green)' }}>{totalStock}</div>
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 100px',
            gap: 'var(--sp-3)', padding: '6px var(--sp-3)',
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            letterSpacing: '.06em', textTransform: 'uppercase',
            borderBottom: '1px solid var(--border)',
          }}>
            <span>ID</span><span>Product ID</span><span style={{ textAlign: 'right' }}>Stock</span>
          </div>

          {/* Rows */}
          {items.map(item => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 100px',
              gap: 'var(--sp-3)', alignItems: 'center',
              padding: '10px var(--sp-3)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                #{item.id}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
                {item.productId}
              </span>
              <span style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                color: item.stock === 0 ? 'var(--red)' : item.stock < 5 ? 'var(--yellow)' : 'var(--green)',
              }}>
                {item.stock === 0 ? '⚠ 0' : item.stock}
              </span>
            </div>
          ))}
        </>
      )}
    </Card>
  )
}

export default function InventoryPage() {
  const [form, setForm] = useState({ productId: 'P1001', quantity: '5' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const submit = useCallback(async () => {
    setLoading(true); setResult(null); setError(null)
    const payload = {
      productId: form.productId.trim(),
      quantity: parseInt(form.quantity, 10),
    }
    try {
      const res = await inventoryApi.addStock(payload)
      setResult(typeof res === 'string' ? { message: res } : res)
      setHistory(h => [{ ...payload, ts: new Date().toLocaleTimeString(), ok: true }, ...h].slice(0, 20))
    } catch (e) {
      setError(e.detail ?? { message: e.message })
      setHistory(h => [{ ...payload, ts: new Date().toLocaleTimeString(), ok: false }, ...h].slice(0, 20))
    } finally {
      setLoading(false)
    }
  }, [form])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', animation: 'fade-in .25s ease' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-.03em',
          marginBottom: 6,
        }}>Inventory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Seed product stock before placing orders. Without stock, inventory reservation fails and the Saga compensates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)', alignItems: 'start' }}>
        {/* Add stock form */}
        <Card>
          <SectionHeader icon="📥" title="Add Stock" subtitle="POST /inventory/add" />

          {/* Presets */}
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
            {PRESETS.map(p => (
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
            <FormField label="Product ID" hint="Must exist or be seeded">
              <Input value={form.productId} onChange={set('productId')} placeholder="P1001" />
            </FormField>
            <FormField label="Quantity" hint="Min 1 unit">
              <Input value={form.quantity} onChange={set('quantity')} type="number" placeholder="5" />
            </FormField>
          </div>

          <Button onClick={submit} loading={loading}>
            📥 Add to Inventory
          </Button>

          {(result || error) && (
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <ResponsePanel data={result} error={error} label="Stock Updated" />
            </div>
          )}
        </Card>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* How it works */}
          <Card>
            <SectionHeader icon="💡" title="How Inventory Fits In" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[
                { step: '1', text: 'Seed stock here with a productId & quantity.', color: 'var(--accent)' },
                { step: '2', text: 'Create an order using the same productId.', color: 'var(--blue)' },
                { step: '3', text: 'Order service publishes OrderCreatedEvent → Kafka.', color: 'var(--yellow)' },
                { step: '4', text: 'Inventory service reserves stock, publishes InventoryReservedEvent.', color: 'var(--green)' },
                { step: '5', text: 'If stock = 0, InventoryFailedEvent fires and Saga compensates.', color: 'var(--red)' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                  <span style={{
                    width: 22, height: 22,
                    borderRadius: '50%',
                    background: `${item.color}22`,
                    border: `1px solid ${item.color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: item.color,
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {item.step}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <SectionHeader icon="🕒" title="Recent Adds" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.map((h, i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 'var(--sp-3)',
                    alignItems: 'center',
                    padding: '6px var(--sp-3)',
                    background: 'var(--bg-raised)',
                    borderRadius: 'var(--r-sm)',
                    border: `1px solid ${h.ok ? 'var(--green)22' : 'var(--red)22'}`,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {h.productId || '<blank>'} × {h.quantity}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {h.ts}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: h.ok ? 'var(--green)' : 'var(--red)',
                      fontWeight: 600,
                    }}>
                      {h.ok ? '✓' : '✕'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div style={{ marginTop: 'var(--sp-2)' }}>
        <InventoryTablePanel />
      </div>
    </div>
  )
}
