import { useState } from 'react'

interface FieldProps {
  label: string
  prefix?: string
  suffix?: string
  value: number
  step?: number          // decimal step hint (e.g. 0.1) — controls how many decimals to show
  plain?: boolean        // skip comma formatting (e.g. birth year: 1981 not 1,981)
  placeholder?: string
  onChangeValue: (value: number) => void
  className?: string
  // "Link to plan end" — when provided, shows a toggle badge in the label row
  linked?: boolean
  onLinkToggle?: () => void
}

function formatBlurred(value: number, step?: number, plain?: boolean): string {
  if (!isFinite(value)) return ''
  if (plain) return String(value)
  if (step !== undefined && step < 1) {
    const decimals = Math.ceil(-Math.log10(step))
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals })
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function Field({
  label, prefix, suffix, value, step, plain, placeholder,
  onChangeValue, className = '', linked, onLinkToggle,
}: FieldProps) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState('')

  function handleFocus() {
    setDraft(isFinite(value) ? String(value) : '')
    setFocused(true)
  }

  function handleBlur() {
    setFocused(false)
    setDraft('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setDraft(raw)
    const parsed = parseFloat(raw)
    if (isFinite(parsed)) onChangeValue(parsed)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1 gap-1">
        <span className="text-xs text-ink-2 truncate">{label}</span>
        {onLinkToggle && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-ink-2">Plan end</span>
            <button
              type="button"
              role="switch"
              aria-checked={linked}
              onClick={onLinkToggle}
              className={`relative w-7 h-4 rounded-full transition-colors ${
                linked ? 'bg-brand' : 'bg-border'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                linked ? 'translate-x-3' : 'translate-x-0'
              }`} />
            </button>
          </div>
        )}
      </div>
      <div className={`flex items-center gap-1 px-2 py-1.5 bg-subtle rounded-lg border transition-colors ${
        linked
          ? 'border-border opacity-50'
          : 'border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand'
      }`}>
        {prefix && <span className="text-ink-2 text-xs shrink-0">{prefix}</span>}
        <input
          className="flex-1 min-w-0 bg-transparent text-sm text-ink outline-none tabular-nums placeholder:text-ink-3"
          type="text"
          inputMode="decimal"
          readOnly={linked}
          tabIndex={linked ? -1 : undefined}
          placeholder={placeholder}
          value={focused && !linked ? draft : formatBlurred(value, step, plain)}
          onFocus={linked ? undefined : handleFocus}
          onBlur={linked ? undefined : handleBlur}
          onChange={linked ? undefined : handleChange}
        />
        {suffix && <span className="text-ink-2 text-xs shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}
