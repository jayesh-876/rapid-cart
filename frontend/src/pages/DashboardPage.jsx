import React, { useState, useEffect, useCallback } from 'react'
import { healthApi } from '../api/client.js'
import { Card, SectionHeader, Spinner } from '../components/ui.jsx'

const SERVICES = [
  { key: 'order',        label: 'Order Service',        port: 8081, icon: '📦', probe: () => healthApi.order() },
  { key: 'inventory',    label: 'Inventory Service',    port: 8082, icon: '🏭', probe: () => healthApi.inventory() },
  { key: 'payment',      label: 'Payment Service',      port: 8083, icon: '💳', probe: () => healthApi.payment() },
  { key: 'notification', label: 'Notification Service', port: 8084, icon: '🔔', probe: () => healthApi.notification() },
]

const KAFKA_TOPICS = [
  'order-created',
  'inventory-reserved',
  'inventory-failed',
  'payment-completed',
  'payment-failed',
  'order-completed',
  'release-inventory',
]

function HealthCard({ svc, status, latency, onCheck }) {
  const isUp   = status === 'up'
  const isDown = status === 'down'
  const pending = status === 'checking'

  const dotColor = pending ? 'var(--text-muted)'
                 : isUp    ? 'var(--green)'
                 :            'var(--red)'

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${isUp ? 'var(--green)22' : isDown ? 'var(--red)22' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)',
      padding: 'var(--sp-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)',
      transition: 'border-color .3s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span style={{ fontSize: 22 }}>{svc.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {svc.label}
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              localhost:{svc.port}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {pending ? (
            <Spinner size={14} color="var(--text-muted)" />
          ) : (
            <span style={{
              width: 10, height: 10,
              borderRadius: '50%',
              background: dotColor,
              boxShadow: isUp ? '0 0 8px var(--green)' : isDown ? '0 0 8px var(--red)' : 'none',
              flexShrink: 0,
              position: 'relative',
            }}>
              {isUp && (
                <span style={{
                  position: 'absolute', inset: -3,
                  borderRadius: '50%',
                  border: '2px solid var(--green)',
                  animation: 'pulse-ring 2s ease-out infinite',
                }} />
              )}
            </span>
          )}
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: dotColor,
            fontFamily: 'var(--font-mono)',
          }}>
            {pending ? 'checking' : isUp ? 'UP' : 'DOWN'}
          </span>
        </div>
      </div>

      {/* Latency */}
      {latency != null && (
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: latency < 200 ? 'var(--green)' : latency < 500 ? 'var(--yellow)' : 'var(--red)',
        }}>
          ⏱ {latency}ms
        </div>
      )}

      {/* Recheck button */}
      <button
        onClick={onCheck}
        disabled={pending}
        style={{
          marginTop: 'var(--sp-1)',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          padding: '5px 10px',
          cursor: pending ? 'default' : 'pointer',
          fontFamily: 'var(--font-body)',
          opacity: pending ? .5 : 1,
          alignSelf: 'flex-start',
        }}
      >
        {pending ? 'Checking…' : '↺ Recheck'}
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const [statuses, setStatuses] = useState({})
  const [latencies, setLatencies] = useState({})

  const checkService = useCallback(async (svc) => {
    setStatuses(s => ({ ...s, [svc.key]: 'checking' }))
    const t0 = Date.now()
    try {
      await svc.probe()
      setStatuses(s => ({ ...s, [svc.key]: 'up' }))
    } catch {
      setStatuses(s => ({ ...s, [svc.key]: 'down' }))
    }
    setLatencies(l => ({ ...l, [svc.key]: Date.now() - t0 }))
  }, [])

  const checkAll = useCallback(() => {
    SERVICES.forEach(svc => checkService(svc))
  }, [checkService])

  useEffect(() => { checkAll() }, [checkAll])

  const upCount = Object.values(statuses).filter(s => s === 'up').length

  return (
    <div style={{ animation: 'fade-in .25s ease' }}>
      {/* Page header */}
      <div style={{
        marginBottom: 'var(--sp-8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 'var(--sp-4)',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-.03em',
            marginBottom: 6,
          }}>
            Service Health
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Real-time status for all RapidCart microservices
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          {/* Summary */}
          <div style={{
            background: upCount === 4 ? 'var(--green-dim)' : upCount > 0 ? 'var(--yellow-dim)' : 'var(--red-dim)',
            border: `1px solid ${upCount === 4 ? 'var(--green)' : upCount > 0 ? 'var(--yellow)' : 'var(--red)'}33`,
            borderRadius: 'var(--r-md)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: upCount === 4 ? 'var(--green)' : upCount > 0 ? 'var(--yellow)' : 'var(--red)',
          }}>
            {upCount}/{SERVICES.length} services up
          </div>
          <button
            onClick={checkAll}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              padding: '9px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 16px var(--accent-glow)',
            }}
          >
            ↺ Check All
          </button>
        </div>
      </div>

      {/* Service grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-8)',
      }}>
        {SERVICES.map(svc => (
          <HealthCard
            key={svc.key}
            svc={svc}
            status={statuses[svc.key] ?? 'checking'}
            latency={latencies[svc.key]}
            onCheck={() => checkService(svc)}
          />
        ))}
      </div>

      {/* Architecture overview */}
      <Card>
        <SectionHeader icon="🗺" title="System Architecture" subtitle="Event-driven saga via Kafka" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 'var(--sp-4)',
        }}>
          {[
            { label: 'Order Service', port: '8081', endpoints: ['POST /orders', 'GET /orders', 'GET /orders/:id'], color: 'var(--accent)' },
            { label: 'Inventory Service', port: '8082', endpoints: ['POST /inventory/add'], color: 'var(--blue)' },
            { label: 'Payment Service', port: '8083', endpoints: ['GET /payment/health'], color: 'var(--yellow)' },
            { label: 'Notification Service', port: '8084', endpoints: ['GET /notification/health'], color: 'var(--green)' },
          ].map(s => (
            <div key={s.port} style={{
              background: 'var(--bg-raised)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--sp-4)',
              border: `1px solid ${s.color}22`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: s.color, marginBottom: 'var(--sp-2)', fontFamily: 'var(--font-display)' }}>
                {s.label}
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>:{s.port}</span>
              </div>
              {s.endpoints.map(ep => (
                <div key={ep} style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  padding: '2px 0',
                  borderLeft: `2px solid ${s.color}44`,
                  paddingLeft: 8,
                  marginBottom: 2,
                }}>
                  {ep}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Kafka topics */}
        <div style={{ marginTop: 'var(--sp-6)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--sp-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            ⚡ Kafka Topics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {KAFKA_TOPICS.map(t => (
              <span key={t} style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                background: 'var(--accent-glow)',
                border: '1px solid var(--accent)33',
                padding: '3px 10px',
                borderRadius: 4,
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
