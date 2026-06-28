import React from 'react'

/* ─── Card ────────────────────────────────────────────────────────────── */
export function Card({ children, style, className = '' }) {
  return (
    <div className={`rc-card ${className}`} style={style}>
      {children}
      <style>{`
        .rc-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: var(--sp-6);
        }
      `}</style>
    </div>
  )
}

/* ─── SectionHeader ───────────────────────────────────────────────────── */
export function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 'var(--sp-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-.02em',
        }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: icon ? 32 : 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ─── StatusBadge ─────────────────────────────────────────────────────── */
const statusMap = {
  CREATED:             { label: 'Created',             color: 'var(--blue)',   bg: 'var(--blue-dim)' },
  INVENTORY_RESERVED:  { label: 'Inv. Reserved',       color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  INVENTORY_FAILED:    { label: 'Inv. Failed',         color: 'var(--red)',    bg: 'var(--red-dim)' },
  PAYMENT_COMPLETED:   { label: 'Payment Done',        color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  PAYMENT_FAILED:      { label: 'Payment Failed',      color: 'var(--red)',    bg: 'var(--red-dim)' },
  INVENTORY_RELEASED:  { label: 'Inv. Released',       color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  COMPLETED:           { label: 'Completed',           color: 'var(--green)',  bg: 'var(--green-dim)' },
}

export function StatusBadge({ status }) {
  const cfg = statusMap[status] ?? { label: status, color: 'var(--text-secondary)', bg: 'var(--bg-raised)' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '.04em',
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
    }}>
      {cfg.label}
    </span>
  )
}

/* ─── Button ──────────────────────────────────────────────────────────── */
export function Button({ children, onClick, variant = 'primary', disabled, loading, style }) {
  const styles = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      boxShadow: '0 0 20px var(--accent-glow)',
    },
    secondary: {
      background: 'var(--bg-raised)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--red-dim)',
      color: 'var(--red)',
      border: '1px solid var(--red)40',
    },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        padding: '9px 18px',
        borderRadius: 'var(--r-sm)',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'opacity .15s, transform .1s',
        opacity: (disabled || loading) ? .5 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.target.style.opacity = '.85' }}
      onMouseLeave={e => { e.target.style.opacity = (disabled || loading) ? '.5' : '1' }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

/* ─── Spinner ─────────────────────────────────────────────────────────── */
export function Spinner({ size = 18, color = 'currentColor' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: `2px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin .6s linear infinite',
      flexShrink: 0,
    }} />
  )
}

/* ─── FormField ───────────────────────────────────────────────────────── */
export function FormField({ label, hint, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

/* ─── Input ───────────────────────────────────────────────────────────── */
export function Input({ value, onChange, placeholder, type = 'text', step }) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)',
        color: 'var(--text-primary)',
        padding: '9px 12px',
        fontSize: 14,
        fontFamily: 'var(--font-mono)',
        width: '100%',
        transition: 'border-color .15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

/* ─── Tag ─────────────────────────────────────────────────────────────── */
export function Tag({ children, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      color,
      background: `${color}18`,
      border: `1px solid ${color}33`,
    }}>
      {children}
    </span>
  )
}

/* ─── EmptyState ──────────────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 'var(--sp-12) var(--sp-6)',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 'var(--sp-3)' }}>{icon}</div>
      {title && <div style={{ fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-secondary)' }}>{title}</div>}
      {message && <div style={{ fontSize: 13 }}>{message}</div>}
    </div>
  )
}

/* ─── ResponsePanel ───────────────────────────────────────────────────── */
export function ResponsePanel({ label = 'Response', data, error }) {
  if (!data && !error) return null
  const isErr = !!error
  return (
    <div style={{
      background: isErr ? 'var(--red-dim)' : 'var(--bg-base)',
      border: `1px solid ${isErr ? 'var(--red)' : 'var(--border)'}40`,
      borderRadius: 'var(--r-sm)',
      padding: 'var(--sp-4)',
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: isErr ? 'var(--red)' : 'var(--text-muted)',
        marginBottom: 'var(--sp-2)',
      }}>
        {isErr ? '⚠ Error' : `✓ ${label}`}
      </div>
      <pre style={{
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        color: isErr ? 'var(--red)' : 'var(--text-primary)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxHeight: 240,
        overflowY: 'auto',
      }}>
        {JSON.stringify(isErr ? error : data, null, 2)}
      </pre>
    </div>
  )
}

/* ─── Divider ─────────────────────────────────────────────────────────── */
export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--sp-6) 0' }} />
}
