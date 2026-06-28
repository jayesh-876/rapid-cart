import React, { useState, useEffect } from 'react'
import { logStore } from '../api/client.js'
import RequestLog from '../components/RequestLog.jsx'
import { Card, SectionHeader } from '../components/ui.jsx'

export default function LogsPage() {
  const [count, setCount] = useState(logStore.entries.length)

  useEffect(() => {
    return logStore.subscribe(entries => setCount(entries.length))
  }, [])

  const clear = () => {
    logStore.entries = []
    logStore.push && setCount(0)
    // force update
    window.dispatchEvent(new Event('rc-log-clear'))
  }

  return (
    <div style={{ animation: 'fade-in .25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-.03em',
            marginBottom: 6,
          }}>Request Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Every API call made this session — method, URL, payload, and response.
          </p>
        </div>
        {count > 0 && (
          <button
            onClick={() => { logStore.entries = []; setCount(0); logStore.subscribe(() => {})() }}
            style={{
              background: 'var(--red-dim)',
              border: '1px solid var(--red)44',
              borderRadius: 'var(--r-sm)',
              color: 'var(--red)',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            🗑 Clear log
          </button>
        )}
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
          <SectionHeader icon="📡" title="HTTP Activity" subtitle={`${count} request${count !== 1 ? 's' : ''} logged`} />
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '3px 10px',
          }}>
            Latest first
          </div>
        </div>
        <RequestLog />
      </Card>
    </div>
  )
}
