import React, { useState, useEffect } from 'react'
import { logStore } from './api/client.js'
import DashboardPage from './pages/DashboardPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import LogsPage from './pages/LogsPage.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',   icon: '◈', shortcut: '1' },
  { id: 'orders',    label: 'Orders',       icon: '◉', shortcut: '2' },
  { id: 'inventory', label: 'Inventory',    icon: '◎', shortcut: '3' },
  { id: 'logs',      label: 'Request Log',  icon: '◌', shortcut: '4' },
]

function NavItem({ item, active, onClick, logCount }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 14px',
        borderRadius: 8,
        background: active ? 'var(--accent-glow)' : 'transparent',
        border: active ? '1px solid var(--accent)44' : '1px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all .15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-raised)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      <span style={{ fontSize: 16, opacity: .8 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.id === 'logs' && logCount > 0 && (
        <span style={{
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 99,
          fontFamily: 'var(--font-mono)',
          minWidth: 18,
          textAlign: 'center',
        }}>
          {logCount > 99 ? '99+' : logCount}
        </span>
      )}
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [logCount, setLogCount] = useState(0)

  useEffect(() => {
    return logStore.subscribe(e => setLogCount(e.length))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const nav = NAV.find(n => n.shortcut === e.key)
      if (nav) setPage(nav.id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const PageComponent = {
    dashboard: DashboardPage,
    orders:    OrdersPage,
    inventory: InventoryPage,
    logs:      LogsPage,
  }[page]

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'var(--font-body)',
    }}>
      {/* ── Sidebar ───────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--sp-5)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 'var(--sp-6)', paddingBottom: 'var(--sp-5)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--text-primary)',
            letterSpacing: '-.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              width: 30, height: 30,
              borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              boxShadow: '0 0 12px var(--accent-glow)',
              flexShrink: 0,
            }}>🛒</span>
            RapidCart
          </div>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginTop: 4,
            marginLeft: 38,
          }}>
            dev console
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={page === item.id}
              onClick={() => setPage(item.id)}
              logCount={logCount}
            />
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          paddingTop: 'var(--sp-4)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-2)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Shortcuts: 1–4
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { port: 8081, label: 'order-service' },
              { port: 8082, label: 'inventory-service' },
              { port: 8083, label: 'payment-service' },
              { port: 8084, label: 'notification-service' },
            ].map(s => (
              <div key={s.port} style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>{s.label}</span>
                <span style={{ color: 'var(--accent)' }}>:{s.port}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────── */}
      <main style={{
        flex: 1,
        padding: 'var(--sp-8)',
        maxWidth: 'calc(100vw - 220px)',
        overflowX: 'hidden',
      }}>
        <PageComponent key={page} />
      </main>
    </div>
  )
}
