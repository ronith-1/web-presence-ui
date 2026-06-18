import type { WebPresencePayload } from '../../samplePayload'
import type { WebPresenceRow } from '../WebPresenceSummaryTable/WebPresenceSummaryTable'
import styles from './WebPresenceDeepDive.module.css'

type SearchResult = {
  sourceType?: string
  summary?: string
  excerpts?: string
  link?: string
  adverseNature?: string
  sourcePlatform?: string
  averageRating?: string
  numberOfReviews?: string
}

function isObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function extractEvidenceSections(detailsForCheck: unknown): Array<{
  title: string
  results: SearchResult[]
}> {
  if (!isObj(detailsForCheck)) return []

  const sections: Array<{ title: string; results: SearchResult[] }> = []

  for (const [k, v] of Object.entries(detailsForCheck)) {
    if (!isObj(v)) continue
    const sr = v.searchResults
    if (Array.isArray(sr) && sr.length) {
      sections.push({ title: prettifyKey(k), results: sr as SearchResult[] })
    }
  }

  return sections
}

function prettifyKey(k: string) {
  return k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export function WebPresenceDeepDive({
  payload,
  row,
}: {
  payload: WebPresencePayload
  row: WebPresenceRow
}) {
  const subchecks =
    (payload.result.checkListSummary.details[row.key] as
      | Record<string, string>
      | undefined) ?? {}

  const rawDetails = (payload.result.details as Record<string, unknown>)[row.key]
  const evidenceSections = extractEvidenceSections(rawDetails)

  const hasAnyContent =
    Object.keys(subchecks).length > 0 ||
    evidenceSections.some((s) => s.results.length > 0)

  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Status</span>
          <span className={styles.metaValue}>{row.status}</span>
        </div>
      </div>

      {Object.keys(subchecks).length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Checks</div>
          <div className={styles.kv}>
            {Object.entries(subchecks).map(([k, v]) => (
              <div key={k} className={styles.kvRow}>
                <div className={styles.kvKey}>{prettifyKey(k)}</div>
                <div className={styles.kvVal}>{v || '-'}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {evidenceSections.length ? (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Evidence</div>
          <div className={styles.sections}>
            {evidenceSections.map((s) => (
              <div key={s.title} className={styles.evidenceSection}>
                <div className={styles.evidenceTitle}>{s.title}</div>
                <div className={styles.cards}>
                  {s.results.map((r, idx) => (
                    <article key={idx} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardSource}>
                          {r.sourceType || r.sourcePlatform || 'Source'}
                        </div>
                        {r.adverseNature ? (
                          <div className={styles.cardTag}>{r.adverseNature}</div>
                        ) : null}
                      </div>
                      {r.summary ? <div className={styles.cardSummary}>{r.summary}</div> : null}
                      {r.excerpts ? (
                        <div className={styles.cardExcerpt}>{r.excerpts}</div>
                      ) : null}
                      {r.averageRating || r.numberOfReviews ? (
                        <div className={styles.cardMetrics}>
                          {r.averageRating ? `Rating: ${r.averageRating}` : null}
                          {r.numberOfReviews ? ` · Reviews: ${r.numberOfReviews}` : null}
                        </div>
                      ) : null}
                      {r.link ? (
                        <a className={styles.cardLink} href={r.link} target="_blank" rel="noreferrer">
                          Open source
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!hasAnyContent ? (
        <div className={styles.empty}>No content found</div>
      ) : null}
    </div>
  )
}

