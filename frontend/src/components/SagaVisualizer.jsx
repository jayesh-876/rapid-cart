import React, { useState, useEffect } from 'react'

const STEPS = [
  {
    id: 'client',
    label: 'Client',
    icon: '🖥',
    type: 'actor',
    desc: 'POST /orders',
  },
  {
    id: 'order',
    label: 'Order Service',
    icon: '📦',
    type: 'service',
    port: '8081',
    desc: 'Persist → CREATED',
    events: ['OrderCreatedEvent'],
    statuses: ['CREATED'],
  },
  {
    id: 'inventory',
    label: 'Inventory Service',
    icon: '🏭',
    type: 'service',
    port: '8082',
    desc: 'Reserve stock',
    events: ['InventoryReservedEvent', 'InventoryFailedEvent'],
    statuses: ['INVENTORY_RESERVED', 'INVENTORY_FAILED'],
  },
  {
    id: 'payment',
    label: 'Payment Service',
    icon: '💳',
    type: 'service',
    port: '8083',
    desc: 'Process payment',
    events: ['PaymentCompletedEvent', 'PaymentFailedEvent'],
    statuses: ['PAYMENT_COMPLETED', 'PAYMENT_FAILED'],
  },
  {
    id: 'order2',
    label: 'Order Service',
    icon: '📦',
    type: 'service',
    port: '8081',
    desc: 'Mark COMPLETED',
    events: ['OrderCompletedEvent'],
    statuses: ['COMPLETED'],
  },
  {
    id: 'notification',
    label: 'Notification',
    icon: '🔔',
    type: 'service',
    port: '8084',
    desc: 'Send email/SMS',
    events: [],
    statuses: [],
  },
]

const STATUS_STEP_MAP = {
  CREATED: 1,
  INVENTORY_RESERVED: 2,
  INVENTORY_FAILED: 2,
  PAYMENT_COMPLETED: 4,
  PAYMENT_FAILED: 3,
  INVENTORY_RELEASED: 3,
  COMPLETED: 5,
}

const FAILURE_STATUSES = new Set(['INVENTORY_FAILED', 'PAYMENT_FAILED'])

export default function SagaVisualizer({ currentStatus, orderId, isActive }) {
  const [animStep, setAnimStep] = useState(-1)

  const activeStep = currentStatus ? (STATUS_STEP_MAP[currentStatus] ?? -1) : -1
  const isFailed = currentStatus && FAILURE_STATUSES.has(currentStatus)
  const isComplete = currentStatus === 'COMPLETED'

  useEffect(() => {
    if (!isActive) { setAnimStep(-1); return }
    let i = 0
    const go = () => {
      setAnimStep(i)
      if (i < activeStep) { i++; setTimeout(go, 280) }
    }
    go()
  }, [isActive, activeStep])

  return (
    <div style={{ padding: 'var(--sp-4) 0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
        marginBottom: 'var(--sp-5)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
          Saga Flow
        </span>
        {orderId && (
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            background: 'var(--accent-glow)',
            padding: '2px 8px',
            borderRadius: 4,
          }}>
            {orderId.slice(0, 8)}…
          </span>
        )}
        {isComplete && (
          <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>✓ Saga complete</span>
        )}
        {isFailed && (
          <span style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>✕ Saga compensating</span>
        )}
      </div>

      {/* Flow steps */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 'var(--sp-2)' }}>
        {STEPS.map((step, idx) => {
          const isReached = animStep >= idx
          const isCurrent = animStep === idx
          const isFail = isFailed && idx === activeStep

          return (
            <React.Fragment key={step.id + idx}>
              {/* Step Node */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 90,
                flex: '1 1 90px',
                animation: isCurrent ? 'fade-in .3s ease' : 'none',
              }}>
                {/* Icon bubble */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  border: `2px solid ${isFail ? 'var(--red)' : isReached ? (isComplete && idx === 5 ? 'var(--green)' : 'var(--accent)') : 'var(--border)'}`,
                  background: isFail ? 'var(--red-dim)' : isReached ? (isComplete && idx === 5 ? 'var(--green-dim)' : 'var(--accent-glow)') : 'var(--bg-raised)',
                  boxShadow: isCurrent ? `0 0 16px ${isFail ? 'var(--red)' : 'var(--accent)'}66` : 'none',
                  transition: 'all .3s ease',
                  position: 'relative',
                }}>
                  {step.icon}
                  {/* Pulse ring for current */}
                  {isCurrent && !isFail && (
                    <span style={{
                      position: 'absolute', inset: -6,
                      borderRadius: '50%',
                      border: '2px solid var(--accent)',
                      animation: 'pulse-ring 1.2s ease-out infinite',
                    }} />
                  )}
                </div>

                {/* Label */}
                <div style={{
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: 'center',
                  color: isReached ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.3,
                }}>
                  {step.label}
                </div>

                {/* Port */}
                {step.port && (
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}>
                    :{step.port}
                  </div>
                )}

                {/* Desc */}
                <div style={{
                  fontSize: 10,
                  color: isReached ? 'var(--text-secondary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  marginTop: 4,
                  maxWidth: 80,
                  lineHeight: 1.4,
                }}>
                  {step.desc}
                </div>
              </div>

              {/* Arrow connector */}
              {idx < STEPS.length - 1 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: 22,
                  minWidth: 32,
                  flex: '0 0 32px',
                }}>
                  {/* Kafka event label */}
                  {step.events?.[0] && (
                    <div style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      color: animStep > idx ? 'var(--accent)' : 'var(--text-muted)',
                      textAlign: 'center',
                      marginBottom: 2,
                      lineHeight: 1.2,
                      maxWidth: 60,
                      wordBreak: 'break-all',
                      transition: 'color .3s',
                    }}>
                      {step.events[0].replace('Event', '')}
                    </div>
                  )}
                  {/* Arrow line */}
                  <div style={{
                    width: '100%',
                    height: 2,
                    background: animStep > idx
                      ? 'linear-gradient(90deg, var(--accent), var(--accent-dim))'
                      : 'var(--border)',
                    borderRadius: 1,
                    transition: 'background .4s ease',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      right: -4,
                      top: -4,
                      fontSize: 10,
                      color: animStep > idx ? 'var(--accent)' : 'var(--border)',
                      lineHeight: 1,
                    }}>▶</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Kafka label */}
      <div style={{
        marginTop: 'var(--sp-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: 11,
      }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>Events flowing via Kafka (port 9092)</span>
      </div>
    </div>
  )
}
