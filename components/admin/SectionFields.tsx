'use client'

import { Area, Check, Text } from './ui'
import type { SectionType } from '@/lib/supabase/database.types'

/* ============================================================================
   Per-section edit forms.

   Each section type gets exactly the fields it actually renders, described in
   plain language. `parse` turns the posted form back into the jsonb shape the
   site reads — the two live side by side so they can't drift apart.
   ========================================================================== */

const lines = (v: FormDataEntryValue | null): string[] =>
  String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean)

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()
const n = (fd: FormData, k: string, fallback: number) => {
  const v = Number(s(fd, k))
  return Number.isFinite(v) && v > 0 ? v : fallback
}
const cta = (fd: FormData, prefix: string) => ({ label: s(fd, `${prefix}_label`), href: s(fd, `${prefix}_href`) })

function CtaFields({ prefix, label, value }: { prefix: string; label: string; value: { label?: string; href?: string } }) {
  return (
    <div className="ad-row">
      <Text label={`${label} — text`} name={`${prefix}_label`} defaultValue={value?.label ?? ''} optional />
      <Text label={`${label} — link`} name={`${prefix}_href`} defaultValue={value?.href ?? ''} hint="A page like /books, or #books to scroll to a section." optional />
    </div>
  )
}

export default function SectionFields({ type, content: c }: { type: SectionType; content: Record<string, any> }) {
  switch (type) {
    case 'intro':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>
            The animated brand badge that opens the page. Hide the whole section from the list to skip it.
          </p>
          <Text label="Scroll cue text" name="cueLabel" defaultValue={c.cueLabel ?? 'Scroll'} optional />
        </>
      )

    case 'hero':
      return (
        <>
          <Area label="Heading" name="headingLines" defaultValue={(c.headingLines ?? []).join('\n')} hint="One line per row — the site keeps your line breaks." optional />
          <Area label="Subheading" name="subheading" defaultValue={c.subheading ?? ''} optional />
          <CtaFields prefix="primaryCta" label="Main button" value={c.primaryCta ?? {}} />
          <CtaFields prefix="secondaryCta" label="Secondary link" value={c.secondaryCta ?? {}} />
          <Text label="Divider width" name="dividerWidth" type="number" defaultValue={String(c.dividerWidth ?? 430)} hint="In pixels. 430 matches the original design." />
          <Check label="Show the 3D artwork" name="showArt" defaultChecked={c.showArt !== false} />
        </>
      )

    case 'videos':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>The cards themselves are managed under <b>Videos</b>.</p>
          <Text label="Kicker" name="kicker" defaultValue={c.kicker ?? ''} optional />
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Area label="Subheading" name="subheading" defaultValue={c.subheading ?? ''} optional />
        </>
      )

    case 'top_picks':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>Books come from the <b>Books</b> screen, in their sort order.</p>
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Text label="How many books" name="limit" type="number" min={1} max={30} defaultValue={String(c.limit ?? 12)} />
          <CtaFields prefix="cta" label="Button" value={c.cta ?? {}} />
        </>
      )

    case 'reviews':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>Each card uses that book’s <b>Review excerpt</b>.</p>
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Text label="How many" name="limit" type="number" min={1} max={12} defaultValue={String(c.limit ?? 6)} />
          <Text label="Link text on each card" name="readMoreLabel" defaultValue={c.readMoreLabel ?? 'Read Full Review'} optional />
          <CtaFields prefix="cta" label="Button" value={c.cta ?? {}} />
        </>
      )

    case 'book_of_week':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>Picks come from <b>Book of the Week</b> — the newest week is shown.</p>
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Area label="Subheading" name="subheading" defaultValue={c.subheading ?? ''} optional />
          <CtaFields prefix="cta" label="Button" value={c.cta ?? {}} />
        </>
      )

    case 'interviews':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>Uses the latest published interviews.</p>
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Area label="Subheading" name="subheading" defaultValue={c.subheading ?? ''} optional />
          <Text label="How many" name="limit" type="number" min={1} max={12} defaultValue={String(c.limit ?? 4)} />
          <CtaFields prefix="cta" label="Button" value={c.cta ?? {}} />
        </>
      )

    case 'mission':
      return (
        <>
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Area label="Body" name="body" defaultValue={c.body ?? ''} optional />
          <Text label="Image path" name="image" defaultValue={c.image ?? ''} hint="A file in /public, or a full URL." optional />
          <Text label="Image description" name="imageAlt" defaultValue={c.imageAlt ?? ''} hint="Read aloud by screen readers." optional />
          <Area
            label="Counters"
            name="stats"
            defaultValue={(c.stats ?? []).map((x: any) => `${x.target}|${x.suffix}|${x.label}`).join('\n')}
            optional
            hint="One per line, as number | suffix | label — for example 500|+|Books Featured. Empty, and the counters are left off."
          />
        </>
      )

    case 'community':
      return (
        <>
          <Area label="Heading" name="headingLines" defaultValue={(c.headingLines ?? []).join('\n')} hint="One line per row." optional />
          <Area label="Body" name="body" defaultValue={c.body ?? ''} optional />
          <CtaFields prefix="cta" label="Button" value={c.cta ?? {}} />
          <Text label="Image path" name="image" defaultValue={c.image ?? ''} optional />
          <Text label="Image description" name="imageAlt" defaultValue={c.imageAlt ?? ''} optional />
        </>
      )

    case 'offer':
      return (
        <>
          <p className="ad-hint" style={{ marginBottom: 12 }}>The six cards are managed under <b>Services</b>.</p>
          <Text label="Kicker" name="kicker" defaultValue={c.kicker ?? ''} optional />
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Area label="Subheading" name="subheadingLines" defaultValue={(c.subheadingLines ?? []).join('\n')} hint="One line per row." optional />
          <Text label="Closing line" name="footerText" defaultValue={c.footerText ?? ''} optional />
        </>
      )

    case 'newsletter':
      return (
        <>
          <Text label="Heading" name="heading" defaultValue={c.heading ?? ''} optional />
          <Area label="Body" name="body" defaultValue={c.body ?? ''} optional />
          <div className="ad-row">
            <Text label="Input placeholder" name="placeholder" defaultValue={c.placeholder ?? ''} optional />
            <Text label="Button text" name="submitLabel" defaultValue={c.submitLabel ?? ''} optional />
            <Text label="After signing up" name="successLabel" defaultValue={c.successLabel ?? ''} optional />
          </div>
          <Text label="Image path" name="image" defaultValue={c.image ?? ''} optional />
          <Text label="Image description" name="imageAlt" defaultValue={c.imageAlt ?? ''} optional />
        </>
      )

    default:
      return <p className="ad-muted">This section has no editable text.</p>
  }
}

/** Turn the posted form back into the jsonb the site reads. */
SectionFields.parse = (type: SectionType, fd: FormData, previous: Record<string, any>): Record<string, unknown> => {
  switch (type) {
    case 'intro':
      return { ...previous, cueLabel: s(fd, 'cueLabel') }

    case 'hero':
      return {
        headingLines: lines(fd.get('headingLines')),
        subheading: s(fd, 'subheading'),
        primaryCta: cta(fd, 'primaryCta'),
        secondaryCta: cta(fd, 'secondaryCta'),
        dividerWidth: n(fd, 'dividerWidth', 430),
        showArt: fd.get('showArt') === 'on',
      }

    case 'videos':
      return { kicker: s(fd, 'kicker'), heading: s(fd, 'heading'), subheading: s(fd, 'subheading') }

    case 'top_picks':
      return {
        heading: s(fd, 'heading'),
        limit: n(fd, 'limit', 12),
        cta: cta(fd, 'cta'),
        shelfImage: previous.shelfImage ?? '/assets/shelf.png',
      }

    case 'reviews':
      return {
        heading: s(fd, 'heading'),
        limit: n(fd, 'limit', 6),
        readMoreLabel: s(fd, 'readMoreLabel'),
        cta: cta(fd, 'cta'),
      }

    case 'book_of_week':
      return { heading: s(fd, 'heading'), subheading: s(fd, 'subheading'), cta: cta(fd, 'cta') }

    case 'interviews':
      return {
        heading: s(fd, 'heading'),
        subheading: s(fd, 'subheading'),
        limit: n(fd, 'limit', 4),
        cta: cta(fd, 'cta'),
      }

    case 'mission':
      return {
        heading: s(fd, 'heading'),
        body: s(fd, 'body'),
        image: s(fd, 'image'),
        imageAlt: s(fd, 'imageAlt'),
        stats: lines(fd.get('stats')).map((row) => {
          const [target, suffix, ...rest] = row.split('|').map((x) => x.trim())
          return { target: Number(target) || 0, suffix: suffix ?? '', label: rest.join('|') || '' }
        }),
      }

    case 'community':
      return {
        headingLines: lines(fd.get('headingLines')),
        body: s(fd, 'body'),
        cta: cta(fd, 'cta'),
        image: s(fd, 'image'),
        imageAlt: s(fd, 'imageAlt'),
      }

    case 'offer':
      return {
        kicker: s(fd, 'kicker'),
        heading: s(fd, 'heading'),
        subheadingLines: lines(fd.get('subheadingLines')),
        footerText: s(fd, 'footerText'),
      }

    case 'newsletter':
      return {
        heading: s(fd, 'heading'),
        body: s(fd, 'body'),
        placeholder: s(fd, 'placeholder'),
        submitLabel: s(fd, 'submitLabel'),
        successLabel: s(fd, 'successLabel'),
        image: s(fd, 'image'),
        imageAlt: s(fd, 'imageAlt'),
      }

    default:
      return previous
  }
}
