'use client'

import { useRouter } from 'next/navigation'

import { Area, Check, Submit, Text, useToast } from './ui'

export type SettingRow = { key: string; value: unknown; label: string | null }
export type FieldSpec = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'toggle' | 'url' | 'email'
  hint?: React.ReactNode
  placeholder?: string
}

/**
 * Renders a group of settings as a plain form. Values are stored as jsonb, so
 * strings come back quoted — `read` unwraps them and the action re-wraps.
 */
export default function SettingsForm({
  group,
  settings,
  fields,
  onSave,
}: {
  group: string
  settings: SettingRow[]
  fields: FieldSpec[]
  onSave: (group: string, fd: FormData) => Promise<{ ok: boolean; error?: string; message?: string }>
}) {
  const router = useRouter()
  const toast = useToast()

  const read = (key: string): string | boolean => {
    const row = settings.find((s) => s.key === key)
    const v = row?.value
    if (typeof v === 'boolean') return v
    if (v === null || v === undefined) return ''
    return typeof v === 'string' ? v : String(v)
  }

  return (
    <form
      action={async (fd) => {
        const res = await onSave(group, fd)
        if (res.ok) {
          toast(res.message ?? 'Settings saved')
          router.refresh()
        } else toast(res.error ?? 'Could not save', 'error')
      }}
    >
      {fields.map((f) => {
        const value = read(f.key)
        if (f.type === 'toggle') {
          return (
            <div key={f.key} style={{ padding: '5px 0' }}>
              <Check label={f.label} name={f.key} hint={typeof f.hint === 'string' ? f.hint : undefined} defaultChecked={Boolean(value)} />
            </div>
          )
        }
        if (f.type === 'textarea') {
          return <Area key={f.key} label={f.label} name={f.key} defaultValue={String(value)} hint={f.hint} placeholder={f.placeholder} />
        }
        return (
          <Text
            key={f.key}
            label={f.label}
            name={f.key}
            type={f.type === 'email' ? 'email' : 'text'}
            defaultValue={String(value)}
            hint={f.hint}
            placeholder={f.placeholder}
          />
        )
      })}

      {/* which keys this form owns, so unchecked toggles still save as false */}
      <input type="hidden" name="__keys" value={fields.map((f) => `${f.key}:${f.type}`).join(',')} readOnly />

      <div style={{ marginTop: 16 }}>
        <Submit>Save</Submit>
      </div>
    </form>
  )
}
