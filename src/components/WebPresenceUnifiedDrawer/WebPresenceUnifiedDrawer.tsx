import { useEffect, useMemo, useState } from 'react'
import type { WebPresencePayload } from '../../samplePayload'
import { Drawer } from '../Drawer/Drawer'
import drawerStyles from '../Drawer/Drawer.module.css'
import styles from './WebPresenceUnifiedDrawer.module.css'
import {
  WEB_PRESENCE_ROWS,
  computeWebPresenceRowStatus,
} from '../WebPresenceSummaryTable/WebPresenceSummaryTable'

type HeaderVariant =
  | 'Variation A'
  | 'Variation B'
  | 'Variation C'
  | 'Variation 4'
  | 'Variation 5'
  | 'Variation 6'
  | 'Variation 7'

const VARIATION_DEFS: { value: HeaderVariant; label: string; description: string }[] = [
  {
    value: 'Variation A',
    label: 'Variation A',
    description: 'Compact single-line header — title, status pill, strength, and source count aligned on one row.',
  },
  {
    value: 'Variation B',
    label: 'Variation B',
    description: 'Two-column grid header — status pill anchors left across two rows, with a live claim snippet preview below the title.',
  },
  {
    value: 'Variation C',
    label: 'Variation C',
    description: 'Expanded single-line header — same structure as A but with more vertical breathing room between rows.',
  },
  {
    value: 'Variation 4',
    label: 'Variation 4',
    description: 'Full example data mode — AI summary paragraph above a structured source table with date, source, and authority columns.',
  },
  {
    value: 'Variation 5',
    label: 'Variation 5',
    description: 'Split-pane preview — clicking a source slides in a detail panel on the right instead of opening an external link.',
  },
  {
    value: 'Variation 6',
    label: 'Variation 6',
    description: 'Full-width mode — preview panel hidden, content stretches across the full available column width.',
  },
  {
    value: 'Variation 7',
    label: 'Variation 7',
    description: 'Full-width mode without AI summary — source table only, no generated narrative above the results.',
  },
]

type SubcheckUiRow = { label: string; valueKey?: string }

const SUBCHECK_UI: Record<string, SubcheckUiRow[]> = {
  businessOwnershipDiscrepancy: [
    {
      label: 'Direct ownership connection',
      valueKey: 'linkageVerificationInsufficient',
    },
    {
      label: "Applicant’s ownership of business",
      valueKey: 'ownershipConnectionInsufficient',
    },
    {
      label: 'Other owners identified',
      valueKey: 'otherOwnersIdentified',
    },
  ],
  businessHistoryDiscrepancy: [
    {
      label: 'Business start date discrepancy',
      valueKey: 'reviewStartDateDiscrepancy',
    },
    {
      label: 'Non-compliant business',
      valueKey: 'stateLicenseVerificationFailed',
    },
  ],
  adverseMediaPresence: [
    {
      label: 'Legal issues',
      valueKey: 'negativeMediaSearchPresence',
    },
    { label: 'Plaintiff is an MCA funder', valueKey: 'businessAdverseMediaPresence' },
  ],
  socialMediaPresence: [
    { label: 'Platforms identified' },
    { label: 'Total reviews' },
    { label: 'Average rating' },
    { label: 'BBB score / complaints' },
  ],
  fundingHistoryExistence: [
    { label: 'Funding rounds in last 12 months' },
    { label: 'Funding within last 10 years' },
    { label: 'Funding details (amount, date, investors)' },
  ],
  convictedSexOffender: [
    { label: 'Sex offender registry match', valueKey: 'sexOffenderRegistryMatch' },
  ],
}

function getSubcheckRows(
  checkKey: string,
  subchecks: Record<string, string>,
  mode: 'new_labels' | 'old_labels'
) {
  if (mode === 'old_labels') {
    return Object.entries(subchecks).map(([k, v]) => ({ label: prettifyKey(k), value: v || '-' }))
  }
  const ui = SUBCHECK_UI[checkKey]
  if (ui?.length) {
    return ui.map((r) => ({
      label: r.label,
      value: r.valueKey ? subchecks[r.valueKey] ?? '-' : '-',
    }))
  }
  return Object.entries(subchecks).map(([k, v]) => ({ label: prettifyKey(k), value: v || '-' }))
}

function prettifyKey(k: string) {
  return k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function safeHostFromLink(link: unknown): string | null {
  if (!link || typeof link !== 'string') return null
  try {
    const u = new URL(link)
    const h = u.hostname.replace(/^www\./, '')
    return h || null
  } catch {
    return null
  }
}

function truncate(s: string, max: number) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type Authority = 'High' | 'Medium' | 'Low' | 'Unknown'

function computeAuthority(res: Record<string, unknown>): Authority {
  const link = typeof (res as any).link === 'string' ? ((res as any).link as string) : null
  const host = safeHostFromLink(link)
  const sourceType = String((res as any).sourceType || (res as any).sourcePlatform || '')
  if (host?.endsWith('.gov')) return 'High'
  if (/court|clerk|registry|state|license/i.test(sourceType)) return 'High'
  if (host && /justia\.com|pacermonitor\.com/i.test(host)) return 'High'
  if (host && /\.(edu)$/.test(host)) return 'High'
  if (host && /(reuters|apnews|bloomberg|wsj|ft\.com|nytimes|bbc|cnn)/i.test(host))
    return 'High'
  if (host) return 'Medium'
  return 'Unknown'
}

function randomPick<T>(arr: T[], seed: number): T {
  const i = Math.abs(seed) % arr.length
  return arr[i]!
}

function makeExampleSourcesForCheck(checkKey: string): Array<{
  title: string
  results: Array<Record<string, unknown>>
}> {
  const baseHosts = [
    'https://sec.gov/Archives/',
    'https://www.justia.com/cases/',
    'https://www.bbb.org/us/',
    'https://www.reuters.com/article/',
    'https://apnews.com/article/',
    'https://cityclerk.cityofomaha.org/',
    'https://sos.nebraska.gov/',
    'https://courts.nebraska.gov/',
    'https://omaha.com/',
    'https://www.wowt.com/',
    'https://www.yelp.com/biz/',
    'https://www.facebook.com/',
    'https://www.linkedin.com/company/',
  ]

  const templates: Record<
    string,
    { section: string; adverse?: string; bullets: string[]; sourceType?: string }
  > = {
    adverseMediaPresence: {
      section: 'Media coverage',
      adverse: 'Fraud',
      sourceType: 'News',
      bullets: [
        'Allegations of billing fraud and misappropriation of funds in civil filings.',
        'Court filings reference disputed invoices and settlement discussions.',
        'Local reporting summarizes the dispute timeline and parties involved.',
        'Follow-up piece notes procedural updates and scheduled hearings.',
      ],
    },
    businessOwnershipDiscrepancy: {
      section: 'Linkage verification',
      sourceType: 'License databases',
      bullets: [
        'Public license journal lists an applicant name tied to the business entity.',
        'Secretary of State record shows organizers/managers not matching application.',
        'Business registration filing includes a mailing address matching applicant.',
        'Corporate profile lists prior DBAs connected to the same principal.',
      ],
    },
    businessHistoryDiscrepancy: {
      section: 'Operational history',
      sourceType: 'Business databases',
      bullets: [
        'Domain registration indicates the website existed for several years.',
        'Archived snapshots show the business operating at the listed location.',
        'Directory listing indicates consistent phone/address across years.',
        'Review activity start date appears inconsistent across platforms.',
      ],
    },
    fundingHistoryExistence: {
      section: 'Funding signals',
      sourceType: 'Business databases',
      bullets: [
        'Profile indicates prior institutional funding within the last 10 years.',
        'Press mentions seed/series funding; amounts and dates vary by source.',
        'Company page lists investors; verification required.',
        'Database entry suggests a recent financing event (recency check needed).',
      ],
    },
    socialMediaPresence: {
      section: 'Reviews and social',
      sourceType: 'Social',
      bullets: [
        'Review aggregator shows limited volume; rating may be unstable.',
        'Social page appears active but has minimal engagement.',
        'Business page includes address/phone consistent with application.',
        'Mentions include customer complaints requiring manual context.',
      ],
    },
    convictedSexOffender: {
      section: 'Registry search',
      sourceType: 'Registry',
      bullets: [
        'Registry search performed; results may require DOB/address confirmation.',
        'Name-only match can be ambiguous without additional identifiers.',
        'No definitive match found in sampled records.',
        'Potential partial-match requires manual verification.',
      ],
    },
  }

  const t = templates[checkKey] ?? {
    section: 'Example sources',
    sourceType: 'Web',
    bullets: [
      'Example source summary for stress-testing the UI.',
      'Additional record found; verify relevance before use.',
      'Potential match on name/address; needs confirmation.',
      'Reference material discovered; context required.',
    ],
  }

  const results: Array<Record<string, unknown>> = []
  const socialHosts = [
    { label: 'Yelp', linkBase: 'https://www.yelp.com/biz/' },
    { label: 'Google', linkBase: 'https://www.google.com/search?q=' },
    { label: 'Trustpilot', linkBase: 'https://www.trustpilot.com/review/' },
    { label: 'Houzz', linkBase: 'https://www.houzz.com/pro/' },
    { label: 'HomeAdvisor', linkBase: 'https://www.homeadvisor.com/rated.' },
    { label: 'Angi', linkBase: 'https://www.angi.com/companylist/' },
    { label: 'Porch', linkBase: 'https://porch.com/' },
    { label: 'Thumbtack', linkBase: 'https://www.thumbtack.com/' },
    { label: 'BuildZoom', linkBase: 'https://www.buildzoom.com/contractor/' },
  ]

  // Generate 9 sources per check for stress testing.
  for (let i = 0; i < 9; i++) {
    const blt = randomPick(t.bullets, i * 13 + checkKey.length * 7)
    const social = t.sourceType === 'Social' ? socialHosts[i % socialHosts.length] : null
    const hostBase = social ? social.linkBase : randomPick(baseHosts, i * 17 + checkKey.length * 11)
    const link = social
      ? `${hostBase}${encodeURIComponent('example-business-' + (i + 1))}`
      : `${hostBase}${encodeURIComponent(checkKey)}/${i + 1}`
    results.push({
      sourceType: t.sourceType,
      sourcePlatform: t.sourceType === 'Social' ? social?.label : undefined,
      adverseNature: t.adverse,
      summary: blt,
      excerpts: truncate(
        `${blt} This is representative excerpt text to validate truncation, hover previews, and table density.`,
        220
      ),
      publishedAt: `2026-01-${String(((i + 7) % 28) + 1).padStart(2, '0')}`,
      link,
    })
  }

  return [
    {
      title: t.section,
      results,
    },
  ]
}

function AuthorityPill({ authority }: { authority: Authority }) {
  const cls =
    authority === 'High'
      ? styles.pillAuthorityHigh
      : authority === 'Medium'
        ? styles.pillAuthorityMedium
        : authority === 'Low'
          ? styles.pillAuthorityLow
          : styles.pillAuthorityUnknown
  return <span className={`${styles.pill} ${styles.pillAuthority} ${cls}`}>{authority}</span>
}

type PreviewItem = {
  title: string
  publishedAt: string | null
  authority: Authority
  link: string | null
  source: string
  excerpt: string
  highlightTerms: string[]
}

function highlightTermsForCheck(checkKey: string, title: string): string[] {
  const base: Record<string, string[]> = {
    businessOwnershipDiscrepancy: ['ownership', 'owner', 'principal', 'applicant', 'registr', 'license'],
    businessHistoryDiscrepancy: ['start date', 'established', 'operat', 'license', 'good standing'],
    adverseMediaPresence: ['lawsuit', 'bankruptcy', 'fraud', 'attorney general', 'cease and desist', 'injunction'],
    socialMediaPresence: ['reviews', 'rating', 'complaint', 'profile', 'bbb'],
    fundingHistoryExistence: ['funding', 'venture', 'private equity', 'investor', 'round', 'seed', 'series'],
    convictedSexOffender: ['registry', 'sex offender', 'match'],
  }

  const terms = base[checkKey] ?? []
  // Also include up to 2 meaningful words from the title for better matching.
  const extra = title
    .split(/\s+/)
    .map((w) => w.replace(/[^\w-]/g, '').toLowerCase())
    .filter((w) => w.length >= 5)
    .slice(0, 2)
  return Array.from(new Set([...terms, ...extra])).slice(0, 8)
}

function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  const cleanTerms = Array.from(new Set(terms.map((t) => t.trim()).filter(Boolean))).slice(0, 6)
  if (!cleanTerms.length) return <span>{text}</span>
  const re = new RegExp(`(${cleanTerms.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(re)
  return (
    <span>
      {parts.map((p, idx) => {
        const isHit = cleanTerms.some((t) => t.toLowerCase() === p.toLowerCase())
        return isHit ? (
          <mark key={idx} className={styles.hl}>
            {p}
          </mark>
        ) : (
          <span key={idx}>{p}</span>
        )
      })}
    </span>
  )
}

function SourcePreviewPane({
  item,
  onClose,
}: {
  item: PreviewItem | null
  onClose: () => void
}) {
  const [embedMode, setEmbedMode] = useState<'live' | 'reader'>('live')

  useEffect(() => {
    setEmbedMode('live')
  }, [item?.link])

  if (!item) return null

  const liveSrc = item.link ?? ''
  // Public reader proxy — often works when the origin blocks iframe embedding (X-Frame-Options / CSP).
  const readerSrc = liveSrc ? `https://r.jina.ai/${liveSrc.trim()}` : ''

  return (
    <aside className={styles.previewPane} aria-label="Source preview panel">
      <div className={styles.previewTop}>
        <div className={styles.previewTitle}>{item.title}</div>
        <button type="button" className={styles.previewClose} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className={styles.previewMeta}>
        <span className={styles.previewMetaRow}>
          <span className={styles.previewMetaKey}>Published</span>
          <span className={styles.previewMetaVal}>{item.publishedAt ?? '—'}</span>
        </span>
        <span className={styles.previewMetaRow}>
          <span className={styles.previewMetaKey}>Source</span>
          <span className={styles.previewMetaVal}>{item.source || '—'}</span>
        </span>
        <span className={styles.previewMetaRow}>
          <span className={styles.previewMetaKey}>Authority</span>
          <AuthorityPill authority={item.authority} />
        </span>
      </div>
      <div className={styles.previewBody}>
        <div className={styles.previewBodyLabel}>Highlights</div>
        <div className={styles.previewBodyText}>
          <HighlightedText text={item.excerpt || item.title} terms={item.highlightTerms} />
        </div>
      </div>
      {item.link ? (
        <>
          <div className={styles.previewWeb}>
            <div className={styles.previewWebHeader}>
              <div className={styles.previewWebHost}>{safeHostFromLink(item.link) ?? item.link}</div>
              <span className={styles.previewWebActions}>
                <button
                  type="button"
                  className={`${styles.embedTab} ${embedMode === 'live' ? styles.embedTabActive : ''}`}
                  onClick={() => setEmbedMode('live')}
                >
                  Live
                </button>
                <button
                  type="button"
                  className={`${styles.embedTab} ${embedMode === 'reader' ? styles.embedTabActive : ''}`}
                  onClick={() => setEmbedMode('reader')}
                >
                  Reader
                </button>
                <a className={styles.previewWebOpen} href={item.link} target="_blank" rel="noreferrer">
                  Open ↗
                </a>
              </span>
            </div>
            <iframe
              className={styles.previewIframe}
              key={`${embedMode}-${embedMode === 'live' ? liveSrc : readerSrc}`}
              src={embedMode === 'live' ? liveSrc : readerSrc}
              title="Source website"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className={styles.previewIframeHint}>
              If Live is blank, the page likely blocks iframes — try Reader or Open ↗.
            </div>
          </div>
        </>
      ) : (
        <div className={styles.previewNoLink}>No URL available for this source.</div>
      )}
    </aside>
  )
}

function SourceLogo({
  hostOrPlatform,
  title,
}: {
  hostOrPlatform: string
  title?: string
}) {
  const key = hostOrPlatform.toLowerCase()
  const kind =
    key.includes('yelp')
      ? 'yelp'
      : key.includes('google')
        ? 'google'
        : key.includes('trustpilot')
          ? 'trustpilot'
          : key.includes('houzz')
            ? 'houzz'
            : key.includes('homeadvisor')
              ? 'homeadvisor'
              : key.includes('angi')
                ? 'angi'
                : key.includes('porch')
                  ? 'porch'
                  : key.includes('thumbtack')
                    ? 'thumbtack'
                    : key.includes('buildzoom')
                      ? 'buildzoom'
                      : 'web'

  const label =
    kind === 'yelp'
      ? 'Yelp'
      : kind === 'google'
        ? 'Google'
        : kind === 'trustpilot'
          ? 'Trustpilot'
          : kind === 'houzz'
            ? 'Houzz'
            : kind === 'homeadvisor'
              ? 'HomeAdvisor'
              : kind === 'angi'
                ? 'Angi'
                : kind === 'porch'
                  ? 'Porch'
                  : kind === 'thumbtack'
                    ? 'Thumbtack'
                    : kind === 'buildzoom'
                      ? 'BuildZoom'
                      : title || hostOrPlatform || 'Web'

  // Intentionally simplified “logo-like” glyphs for prototype use.
  return (
    <span className={styles.sourceLogo} title={label} aria-label={label}>
      <span className={`${styles.sourceMark} ${styles[`sourceMark_${kind}`] ?? ''}`} aria-hidden="true">
        {kind === 'web' ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path
              d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M2 12h20M12 2c3.2 3 3.2 17 0 20M12 2c-3.2 3-3.2 17 0 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span className={styles.sourceLetter}>
            {kind === 'yelp'
              ? 'y'
              : kind === 'google'
                ? 'G'
                : kind === 'trustpilot'
                  ? '★'
                  : kind === 'houzz'
                    ? 'h'
                    : kind === 'homeadvisor'
                      ? 'H'
                      : kind === 'angi'
                        ? 'a'
                        : kind === 'porch'
                          ? 'p'
                          : kind === 'thumbtack'
                            ? 't'
                            : kind === 'buildzoom'
                              ? 'bz'
                              : '?'}
          </span>
        )}
      </span>
    </span>
  )
}

function extractEvidenceSections(detailsForCheck: unknown): Array<{
  title: string
  results: Array<Record<string, unknown>>
}> {
  if (!detailsForCheck || typeof detailsForCheck !== 'object') return []
  if (Array.isArray(detailsForCheck)) return []

  const obj = detailsForCheck as Record<string, unknown>

  // Flat shape: { searchResults: [...] } — treat as a single unnamed section
  if (Array.isArray(obj.searchResults) && obj.searchResults.length) {
    return [{ title: 'Results', results: obj.searchResults as Array<Record<string, unknown>> }]
  }

  const sections: Array<{ title: string; results: Array<Record<string, unknown>> }> = []
  for (const [k, v] of Object.entries(obj)) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    const sr = (v as any).searchResults
    if (Array.isArray(sr) && sr.length) {
      sections.push({ title: prettifyKey(k), results: sr as Array<Record<string, unknown>> })
    }
  }
  return sections
}


function StatusPill({ status }: { status: string }) {
  const cls =
    status === 'Decline'
      ? styles.pillDecline
      : status === 'Review'
        ? styles.pillReview
        : status === 'Informational'
          ? styles.pillInfo
          : styles.pillNone
  return <span className={`${styles.pill} ${cls}`}>{status}</span>
}

function shouldShowAccordionStatus(status: string) {
  return status === 'Review'
}

function LeftStatusBadge({ status }: { status: string }) {
  if (status === 'Decline') {
    return (
      <span className={styles.leftStatusDecline}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.5" stroke="#C83532" />
          <path d="M7 4v3.5" stroke="#C83532" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="7" cy="10" r="0.7" fill="#C83532" />
        </svg>
        Decline
      </span>
    )
  }
  if (status === 'Review') {
    return <span className={styles.leftStatusReview}>Review</span>
  }
  if (status === 'Informational') {
    return <span className={styles.leftStatusInfo}>Informational</span>
  }
  return <span className={styles.leftStatusPass}>Pass</span>
}


function computeEvidenceMeta(evidenceSections: Array<{
  title: string
  results: Array<Record<string, unknown>>
}>): {
  sourcesCount: number
  preview: Array<{
    id: string
    sourceLabel: string
    title: string
    tags: string[]
    link: string | null
  }>
} {
  const flattened: Array<{
    sectionTitle: string
    res: Record<string, unknown>
    idx: number
  }> = []
  evidenceSections.forEach((s) => {
    s.results.forEach((res, idx) => flattened.push({ sectionTitle: s.title, res, idx }))
  })

  const hosts = new Set<string>()
  for (const it of flattened) {
    const host = safeHostFromLink((it.res as any).link)
    if (host) hosts.add(host)
  }
  const sourcesCount = hosts.size

  const preview = flattened.slice(0, 3).map((it, i) => {
    const sourceType = (it.res as any).sourceType || (it.res as any).sourcePlatform
    const link = typeof (it.res as any).link === 'string' ? ((it.res as any).link as string) : null
    const host = safeHostFromLink(link)
    const sourceLabel = sourceType || host || 'Source'
    const summary = typeof (it.res as any).summary === 'string' ? ((it.res as any).summary as string) : ''
    const adverse = typeof (it.res as any).adverseNature === 'string'
      ? ((it.res as any).adverseNature as string)
      : null
    const tags: string[] = []
    if (adverse) tags.push(truncate(adverse, 28))
    tags.push(`#${i + 1}`)
    return {
      id: `ev-${i + 1}`,
      sourceLabel: truncate(String(sourceLabel), 36),
      title: truncate(summary || it.sectionTitle, 110),
      tags,
      link,
    }
  })

  return { sourcesCount, preview }
}

function HoverCard({
  title,
  published,
  body,
  authority,
  href,
}: {
  title: string
  published?: string
  body?: string
  authority: Authority
  href: string | null
}) {
  const riskBadgeClass =
    authority === 'High'
      ? styles.hcRiskHigh
      : authority === 'Medium'
        ? styles.hcRiskMedium
        : authority === 'Low'
          ? styles.hcRiskLow
          : null

  const urlDisplay = href
    ? (() => {
        try {
          const u = new URL(href)
          return `${u.hostname.replace(/^www\./, '')}${u.pathname}`
        } catch {
          return href
        }
      })()
    : null

  return (
    <span className={styles.hoverCard} role="dialog" aria-label="Source preview">
      <span className={styles.hcMain}>
        <span className={styles.hcTitleRow}>
          <span className={styles.hcTitle}>{title}</span>
          {riskBadgeClass ? (
            <span className={`${styles.hcRiskBadge} ${riskBadgeClass}`}>
              {authority}
            </span>
          ) : null}
        </span>
        {body ? (
          <span className={styles.hcBody}>
            <HighlightedText text={body} terms={[]} />
          </span>
        ) : null}
        {published ? <span className={styles.hcPublished}>Published: {published}</span> : null}
      </span>

      <span className={styles.hcLinkRow}>
        <span className={styles.hcLinkIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6.667 4H4a1.333 1.333 0 0 0-1.333 1.333v6.667A1.333 1.333 0 0 0 4 13.333h6.667a1.333 1.333 0 0 0 1.333-1.333V9.333" stroke="#616161" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.333 2.667H13.333V6.667" stroke="#616161" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.667 9.333L13.333 2.667" stroke="#616161" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className={styles.hcLinkText}>
          {urlDisplay ?? '—'}
        </span>
      </span>
    </span>
  )
}

function InlineRef({
  n,
  onClick,
}: {
  n: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={styles.inlineRef}
      onClick={onClick}
      aria-label={`Open reference ${n}`}
    >
        {n}
    </button>
  )
}

function buildAiSummary(items: Array<{ title: string; authority: Authority }>) {
  if (!items.length) return { textA: 'No sources were returned for this check.', refs: [] as number[] }
  const top = items.slice(0, 3)
  const refs = top.map((_, i) => i + 1)
  const clauses = top.map((it) => truncate(it.title, 90))
  const sentence =
    clauses.length === 1
      ? clauses[0]
      : clauses.length === 2
        ? `${clauses[0]} and ${clauses[1]}`
        : `${clauses[0]}, ${clauses[1]}, and ${clauses[2]}`
  return {
    textA: `Across sources, the key signals include: ${sentence}`,
    refs,
  }
}

function toMediaRowsFromSections(sections: Array<{ title: string; results: Array<Record<string, unknown>> }>) {
  const rows = sections.flatMap((s) =>
    s.results.map((res) => {
      const link = typeof (res as any).link === 'string' ? ((res as any).link as string) : null
      const host = safeHostFromLink(link)
      const sourceType = (res as any).sourceType || (res as any).sourcePlatform || null
      const source = String(sourceType || host || '')

      // Build a human-readable title from whatever fields are available
      const summary = typeof (res as any).summary === 'string' ? (res as any).summary as string : ''
      const excerpts = typeof (res as any).excerpts === 'string' ? (res as any).excerpts as string : ''
      const platform = typeof (res as any).sourcePlatform === 'string' ? (res as any).sourcePlatform as string : ''
      const avgRating = (res as any).averageRating
      const numReviews = (res as any).numberOfReviews
      const fundingType = typeof (res as any).fundingType === 'string' ? (res as any).fundingType as string : ''
      const fundingAmount = typeof (res as any).fundingAmount === 'string' ? (res as any).fundingAmount as string : ''

      let title = summary || excerpts
      if (!title && platform) {
        const ratingPart = avgRating && avgRating !== 'unavailable' ? ` · ${avgRating}★` : ''
        const reviewPart = numReviews && numReviews !== '0' ? ` · ${numReviews} reviews` : ''
        title = `${platform}${ratingPart}${reviewPart}`
      }
      if (!title && fundingType) {
        title = fundingAmount ? `${fundingType} — ${fundingAmount}` : fundingType
      }
      if (!title) title = s.title

      const publishedAt =
        typeof (res as any).publishedAt === 'string'
          ? (res as any).publishedAt as string
          : typeof (res as any).fundingDate === 'string'
            ? (res as any).fundingDate as string
            : null

      return {
        link,
        source,
        title: truncate(title, 140),
        authority: computeAuthority(res),
        excerpt: excerpts,
        publishedAt,
      }
    })
  )
  const ai = buildAiSummary(rows.map((r) => ({ title: r.title, authority: r.authority })))
  return { rows, ai }
}

export function WebPresenceUnifiedDrawer({
  open,
  payload,
  initialKey,
  onClose,
}: {
  open: boolean
  payload: WebPresencePayload
  initialKey: string | null
  onClose: () => void
}) {
  const defaultKey =
    initialKey ??
    (WEB_PRESENCE_ROWS.find(
      (r) => computeWebPresenceRowStatus(r.key, payload) === 'Decline'
    )?.key ?? null)
  const [expandedKey, setExpandedKey] = useState<string | null>(defaultKey)
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>('Variation A')
  const [exampleSourcesOn, setExampleSourcesOn] = useState(false)
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null)
  const [variantsMenuOpen, setVariantsMenuOpen] = useState(false)

  // Keep initial click respected when opening.
  useMemo(() => {
    if (open) setExpandedKey(defaultKey)
  }, [open, defaultKey])

  useEffect(() => {
    setPreviewItem(null)
  }, [headerVariant])

  useEffect(() => {
    if (!variantsMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVariantsMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [variantsMenuOpen])

  const leftItems = WEB_PRESENCE_ROWS.map((r) => {
    const status = computeWebPresenceRowStatus(r.key, payload)
    return { key: r.key, label: r.label, status }
  })

  const flaggedTabs = leftItems.filter(
    (it) => it.status === 'Review' || it.status === 'Decline'
  )

  const flagTabBar =
    flaggedTabs.length > 0 ? (
      <div className={drawerStyles.flagTabs} role="tablist" aria-label="Flagged checks">
        {flaggedTabs.map((it) => (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={expandedKey === it.key}
            data-label={it.label}
            className={`${drawerStyles.flagTab} ${expandedKey === it.key ? drawerStyles.flagTabActive : ''}`}
            onClick={() => setExpandedKey(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
    ) : null

  return (
    <Drawer open={open} title="Web Presence - Deep Dive" onClose={onClose} subHeader={flagTabBar}>
      <div className={styles.wrap}>
        <aside className={styles.left} aria-label="Checks summary">
          <div className={styles.leftCard}>
            {leftItems.map((it, idx) => {
              const subchecks =
                (payload.result.checkListSummary.details[it.key] as
                  | Record<string, string>
                  | undefined) ?? {}
              const rows = getSubcheckRows(it.key, subchecks, 'old_labels')
              return (
                <div key={it.key}>
                  {idx > 0 && <div className={styles.leftDivider} />}
                  <div
                    className={`${styles.leftSection} ${
                      expandedKey === it.key ? styles.leftSectionActive : ''
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.leftHeader}
                      onClick={() => setExpandedKey(it.key)}
                    >
                      <span className={styles.leftTitle}>{it.label}</span>
                      <LeftStatusBadge status={it.status} />
                    </button>
                    {rows.length ? (
                      <div className={styles.subchecks}>
                        {rows.map((r) => (
                          <div key={r.label} className={styles.subRow}>
                            <span className={styles.subKey}>{r.label}</span>
                            <span className={styles.subVal}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        <section className={styles.right} aria-label="Checks detail">
          <div
            className={`${styles.rightSplit} ${
              headerVariant === 'Variation 6' ||
              headerVariant === 'Variation 7' ||
              (headerVariant === 'Variation 5' && !previewItem)
                ? styles.rightSplitNoPreview
                : ''
            }`}
          >
            <div className={styles.rightMain} aria-label="Checks content">
              {WEB_PRESENCE_ROWS.map((r) => {
            const status = computeWebPresenceRowStatus(r.key, payload)
            const isOpen = expandedKey === r.key

            const rawDetails = (payload.result.details as Record<string, unknown>)[r.key]
            const baseEvidenceSections = extractEvidenceSections(rawDetails)
            const evidenceSections = exampleSourcesOn
              ? [...baseEvidenceSections, ...makeExampleSourcesForCheck(r.key)]
              : baseEvidenceSections
            const evidenceMeta = computeEvidenceMeta(evidenceSections)
            const v4 = toMediaRowsFromSections(evidenceSections)
            const isSocial = r.key === 'socialMediaPresence'

            const socialMeta = isSocial ? (() => {
              const d = rawDetails as any
              const agg = d?.reviewAggregators ?? {}
              const sm = d?.socialMedia ?? {}
              const platforms: Array<{ platform: string; link: string }> = (
                (sm.searchResults ?? []) as Array<Record<string, unknown>>
              ).map((p: any) => ({ platform: String(p.sourcePlatform || ''), link: String(p.link || '') }))
              return {
                platforms,
                totalReviews: agg.totalReviews ?? 0,
                avgRating: agg.averageRatingAcrossAllPlatforms ?? '—',
                reviewSiteCount: agg.count ?? 0,
              }
            })() : null

            return (
              <div key={r.key} className={styles.acc}>
                <button
                  type="button"
                  className={styles.accHeader}
                  onClick={() => setExpandedKey(isOpen ? null : r.key)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.chev} aria-hidden="true">
                    {isOpen ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6l6 6-6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {headerVariant === 'Variation A' ? (
                    <span className={styles.headerA}>
                      <span className={styles.headerTopLine}>
                        <span className={styles.accTitle}>{r.label}</span>
                        <span className={styles.headerPills}>
                          {shouldShowAccordionStatus(status) ? (
                            <StatusPill status={status} />
                          ) : null}
                          <span className={styles.sourcesText}>{evidenceMeta.sourcesCount} sources</span>
                        </span>
                      </span>
                    </span>
                  ) : headerVariant === 'Variation B' ? (
                    <span className={styles.headerB}>
                      <span className={styles.headerBStatus}>
                        {shouldShowAccordionStatus(status) ? (
                          <StatusPill status={status} />
                        ) : null}
                      </span>
                      <span className={styles.headerBMain}>
                        <span className={styles.headerBTitle}>{r.label}</span>
                        <span className={styles.headerBMeta}>
                          <span className={styles.sourcesText}>{evidenceMeta.sourcesCount} sources</span>
                        </span>
                      </span>
                      {evidenceMeta.preview[0]?.title ? (
                        <span className={styles.headerBClaim} aria-hidden="true">
                          {evidenceMeta.preview[0].title}
                          <span className={styles.citeInline}>
                            {' '}
                            {evidenceMeta.preview[0].tags[evidenceMeta.preview[0].tags.length - 1]}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className={styles.headerC}>
                      <span className={styles.headerTopLine}>
                        <span className={styles.accTitle}>{r.label}</span>
                        <span className={styles.headerPills}>
                          {shouldShowAccordionStatus(status) ? (
                            <StatusPill status={status} />
                          ) : null}
                          <span className={styles.sourcesText}>{evidenceMeta.sourcesCount} sources</span>
                        </span>
                      </span>
                    </span>
                  )}
                </button>

                {isOpen ? (
                  <div className={styles.accBody}>
                    {evidenceSections.length === 0 ? (
                      <div className={styles.noData}>No data available for this check.</div>
                    ) : (
                    <div className={styles.v4Wrap}>
                      {isSocial && socialMeta ? (
                        <div className={styles.socialCard}>
                          <div className={styles.socialStatsRow}>
                            <div className={styles.socialStat}>
                              <span className={styles.socialStatValue}>{socialMeta.platforms.length}</span>
                              <span className={styles.socialStatLabel}>Platforms found</span>
                            </div>
                            <div className={styles.socialStatDivider} />
                            <div className={styles.socialStat}>
                              <span className={styles.socialStatValue}>{socialMeta.reviewSiteCount}</span>
                              <span className={styles.socialStatLabel}>Review sites</span>
                            </div>
                            <div className={styles.socialStatDivider} />
                            <div className={styles.socialStat}>
                              <span className={styles.socialStatValue}>{socialMeta.totalReviews}</span>
                              <span className={styles.socialStatLabel}>Total reviews</span>
                            </div>
                            <div className={styles.socialStatDivider} />
                            <div className={styles.socialStat}>
                              <span className={styles.socialStatValue}>{socialMeta.avgRating}</span>
                              <span className={styles.socialStatLabel}>Avg rating</span>
                            </div>
                          </div>
                          {socialMeta.platforms.length > 0 && (
                            <div className={styles.socialPlatformRow}>
                              {socialMeta.platforms.map((p) => (
                                <a
                                  key={p.platform}
                                  href={p.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={styles.socialPlatformTag}
                                >
                                  <SourceLogo hostOrPlatform={p.platform} />
                                  <span>{p.platform}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : headerVariant === 'Variation 7' ? null : (
                        <div className={styles.aiSummary}>
                          <div className={styles.aiTitle}>AI Summary</div>
                          <div className={styles.aiText}>
                            <span className={styles.aiLead}>Across sources:</span>{' '}
                            {v4.rows.slice(0, 3).map((e, idx) => {
                              const sep = idx === 0 ? '' : idx === 2 ? ' and ' : ', '
                              return (
                                <span key={idx}>
                                  {sep}
                                  <span className={styles.aiKw}>{e.title}</span>
                                  <InlineRef
                                    n={idx + 1}
                                    onClick={() =>
                                      setPreviewItem({
                                        title: e.title,
                                        publishedAt: e.publishedAt ?? null,
                                        authority: e.authority,
                                        link: e.link,
                                        source: e.source,
                                        excerpt: truncate(e.excerpt || e.title, 520),
                                        highlightTerms: highlightTermsForCheck(r.key, e.title),
                                      })
                                    }
                                  />
                                </span>
                              )
                            })}
                            .
                          </div>
                        </div>
                      )}

                      <>
                        <div className={styles.tableWrap} role="table" aria-label="All sources">
                          <div
                            className={`${styles.tableHead} ${isSocial ? styles.tableHeadNoDate : ''}`}
                            role="row"
                          >
                            <div className={styles.th} role="columnheader" />
                            {!isSocial ? (
                              <div className={styles.th} role="columnheader">
                                Date
                              </div>
                            ) : null}
                            <div className={styles.th} role="columnheader">
                              Source
                            </div>
                            <div className={styles.th} role="columnheader">
                              Authority
                            </div>
                          </div>
                          {v4.rows.map((e, idx) => (
                            <div
                              key={idx}
                              className={`${styles.tr} ${isSocial ? styles.trNoDate : ''}`}
                              role="row"
                            >
                              <div className={styles.tdTitle} role="cell">
                                <span className={styles.titleLinkWrap}>
                                  {e.link ? (
                                    headerVariant === 'Variation 5' ? (
                                      <button
                                        type="button"
                                        className={styles.titleLink}
                                        onClick={() =>
                                          setPreviewItem({
                                            title: e.title,
                                            publishedAt: e.publishedAt ?? null,
                                            authority: e.authority,
                                            link: e.link,
                                            source: e.source,
                                            excerpt: truncate(e.excerpt || e.title, 520),
                                            highlightTerms: highlightTermsForCheck(r.key, e.title),
                                          })
                                        }
                                      >
                                        {truncate(e.title, 52)}
                                        <span className={styles.extIcon} aria-hidden="true">
                                          ↗
                                        </span>
                                      </button>
                                    ) : (
                                      <a
                                        className={styles.titleLink}
                                        href={e.link}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {truncate(e.title, 52)}
                                        <span className={styles.extIcon} aria-hidden="true">
                                          ↗
                                        </span>
                                      </a>
                                    )
                                  ) : (
                                    <span className={styles.titleLink}>{truncate(e.title, 52)}</span>
                                  )}
                                  <span className={styles.titleHover}>
                                    <HoverCard
                                      title={e.title}
                                      published={e.publishedAt ?? undefined}
                                      body={truncate(e.excerpt || e.title, 260)}
                                      authority={e.authority}
                                      href={e.link}
                                    />
                                  </span>
                                </span>
                              </div>
                              {!isSocial ? (
                                <div className={styles.td} role="cell">
                                  {e.publishedAt ?? '—'}
                                </div>
                              ) : null}
                              <div className={styles.td} role="cell">
                                {headerVariant === 'Variation 5' && e.link ? (
                                  <button
                                    type="button"
                                    className={styles.sourceLinkBtn}
                                    onClick={() =>
                                      setPreviewItem({
                                        title: e.title,
                                        publishedAt: e.publishedAt ?? null,
                                        authority: e.authority,
                                        link: e.link,
                                        source: e.source,
                                        excerpt: truncate(e.excerpt || e.title, 520),
                                        highlightTerms: highlightTermsForCheck(r.key, e.title),
                                      })
                                    }
                                  >
                                    {isSocial ? (
                                      <div className={styles.sourceCell}>
                                        <SourceLogo
                                          hostOrPlatform={
                                            e.source || (e.link ? safeHostFromLink(e.link) ?? '' : '')
                                          }
                                        />
                                        <span className={styles.sourceText}>{e.source || '—'}</span>
                                      </div>
                                    ) : (
                                      e.source || '—'
                                    )}
                                  </button>
                                ) : isSocial ? (
                                  <div className={styles.sourceCell}>
                                    <SourceLogo
                                      hostOrPlatform={e.source || (e.link ? safeHostFromLink(e.link) ?? '' : '')}
                                    />
                                    <span className={styles.sourceText}>{e.source || '—'}</span>
                                  </div>
                                ) : (
                                  e.source || '—'
                                )}
                              </div>
                              <div className={styles.td} role="cell">
                                <span className={
                                  e.authority === 'High'
                                    ? styles.riskHigh
                                    : e.authority === 'Medium'
                                      ? styles.riskMedium
                                      : e.authority === 'Low'
                                        ? styles.riskLow
                                        : styles.riskUnknown
                                }>
                                  {e.authority === 'Unknown' ? '—' : e.authority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    </div>
                    )}
                  </div>
                ) : null}
              </div>
            )
              })}

            </div>

            {headerVariant !== 'Variation 6' &&
            headerVariant !== 'Variation 7' &&
            (headerVariant !== 'Variation 5' || previewItem) ? (
              <div
                className={`${styles.rightPreview} ${
                  headerVariant === 'Variation 5' && previewItem ? styles.rightPreviewV5SlideIn : ''
                }`}
                aria-label="Source preview"
              >
                {previewItem ? (
                  <SourcePreviewPane item={previewItem} onClose={() => setPreviewItem(null)} />
                ) : (
                  <div className={styles.previewEmptyState}>
                    <div className={styles.previewEmptyTitle}>Select a source</div>
                    <div className={styles.previewEmptyText}>
                      Click a citation number or an Authority pill to open a split-view preview here.
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {variantsMenuOpen && (
        <div
          className={styles.variantsBackdrop}
          onClick={() => setVariantsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={styles.floatingVariants}>
        {variantsMenuOpen && (
          <div className={styles.variantsMenu} role="menu">
            {VARIATION_DEFS.map((def) => (
              <button
                key={def.value}
                type="button"
                role="menuitem"
                className={`${styles.variantsMenuItem} ${headerVariant === def.value ? styles.variantsMenuItemActive : ''}`}
                onClick={() => {
                  setHeaderVariant(def.value)
                  setVariantsMenuOpen(false)
                }}
              >
                <span className={styles.variantsMenuItemLabel}>{def.label}</span>
                <span className={styles.variantsMenuItemDesc}>{def.description}</span>
              </button>
            ))}
            <div className={styles.variantsMenuDivider} />
            <div className={styles.variantsMenuToggleRow}>
              <span className={styles.variantsMenuToggleLabel}>Example sources</span>
              <button
                type="button"
                className={`${styles.toggle} ${exampleSourcesOn ? styles.toggleOn : ''}`}
                role="switch"
                aria-checked={exampleSourcesOn}
                onClick={() => setExampleSourcesOn((v) => !v)}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className={`${styles.variantsFab} ${variantsMenuOpen ? styles.variantsFabOpen : ''}`}
          onClick={() => setVariantsMenuOpen((v) => !v)}
          aria-label="Change layout variation"
          aria-expanded={variantsMenuOpen}
          aria-haspopup="menu"
        >
          <svg className={styles.variantsFabIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
          <span className={styles.variantsFabLabel}>{headerVariant}</span>
        </button>
      </div>
    </Drawer>
  )
}

