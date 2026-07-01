import React, { useState, useEffect } from 'react'
import { logStore } from '../api/client.js'

const METHOD_COLOR = {
  GET:    'var(--green)',
  POST:   'var(--accent)',
  PUT:    'var(--yellow)',
  PATCH:  'var(--yellow)',
  DELETE: 'var(--red)',
}

function statusColor(status) {
  if (!status || status === 0) return 'var(--text-muted)'
  if (status >= 500) return 'var(--red)'
  if (status >= 400) return 'var(--yellow)'
  if (status >= 200) return 'var(--green)'
  return 'var(--text-muted)'
}

export default function RequestLog() {
  const [entries, setEntries] = useState(logStore.entries)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => logStore.subscribe(setEntries), [])

  if (entries.length === 0) {
    return (
      <div style={{
        padding: 'var(--sp-8)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
      }}>
        No requests yet. Make an API call to see it here.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {entries.map(entry => {
        const isOpen = expanded === entry.id
        return (
          <div
            key={entry.id}
            style={{
              background: isOpen ? 'var(--bg-raised)' : 'transparent',
              border: '1px solid ' + (isOpen ? 'var(--border-bright)' : 'transparent'),
              borderRadius: 'var(--r-sm)',
              overflow: 'hidden',
              transition: 'background .15s',
            }}
          >
            {/* Row */}
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '54px 60px 1fr 56px 80px',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                padding: '8px var(--sp-3)',
                background: 'transparent',
                textAlign: 'left',
              }}
            >
              {/* Method */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: METHOD_COLOR[entry.method] ?? 'var(--text-secondary)',
              }}>
                {entry.method}
              </span>

              {/* Status */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                color: statusColor(entry.status),
              }}>
                {entry.status || 'ERR'}
              </span>

              {/* URL */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {entry.url}
              </span>

              {/* Time */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                textAlign: 'right',
              }}>
                {new Date(entry.ts).toLocaleTimeString()}
              </span>

              {/* Expand */}
              <span style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                textAlign: 'right',
              }}>
                {isOpen ? '▲ less' : '▼ more'}
              </span>
            </button>

            {/* Expanded details */}
            {isOpen && (
              <div style={{
                padding: '0 var(--sp-3) var(--sp-4)',
                display: 'grid',
                gridTemplateColumns: entry.body ? '1fr 1fr' : '1fr',
                gap: 'var(--sp-3)',
              }}>
                {entry.body && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Request body</div>
                    <pre style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      background: 'var(--bg-base)',
                      padding: 'var(--sp-3)', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      maxHeight: 180, overflowY: 'auto',
                    }}>
                      {JSON.stringify(entry.body, null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 10, color: entry.error ? 'var(--red)' : 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {entry.error ? 'Error response' : 'Response'}
                  </div>
                  <pre style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    color: entry.error ? 'var(--red)' : 'var(--green)',
                    background: 'var(--bg-base)',
                    padding: 'var(--sp-3)', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                    maxHeight: 180, overflowY: 'auto',
                  }}>
                    {JSON.stringify(entry.error ?? entry.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
