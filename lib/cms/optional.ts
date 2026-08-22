/**
 * Blank means hidden.
 *
 * Every field in the admin is optional. The rule the whole site follows is the
 * same one everywhere, per field and per entry: something an editor left empty
 * is not rendered at all — no label, no icon, no dash, no box holding its
 * place. A field that has content carries on exactly as it always did.
 *
 * These are the two questions a component asks before drawing anything, so the
 * answer is the same in all of them rather than a different `?.` dance in each.
 */

/** Text worth putting on the page: present, and not only whitespace. */
export const has = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim() !== ''

/**
 * A number worth putting on the page.
 *
 * A cleared number field comes back from the form as null and is stored as
 * null, but the view models flatten that to 0 — and no book has nought pages
 * or a nought-star rating, so the two cases mean the same thing here.
 */
export const hasNum = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

/** A list worth putting on the page. */
export const hasList = (value: readonly unknown[] | null | undefined): boolean =>
  Array.isArray(value) && value.length > 0
