import type { WebPresencePayload } from '../../samplePayload'
import styles from './WebPresenceSummaryTable.module.css'

type RowStatus = 'Decline' | 'Review' | 'Informational' | 'None' | 'Pass'

type RowDef = {
  key: string
  label: string
  baseKind:
    | 'subchecks_any_yes_review_else_none'
    | 'social_informational_if_metrics_else_none'
    | 'sex_offender_decline_if_match_else_none'
    | 'funding_review_if_institutional_else_none'
}

export const WEB_PRESENCE_ROWS: RowDef[] = [
  {
    key: 'businessOwnershipDiscrepancy',
    label: 'Applicant/Business Ownership',
    baseKind: 'subchecks_any_yes_review_else_none',
  },
  {
    key: 'businessHistoryDiscrepancy',
    label: 'Business Existence and Operational History',
    baseKind: 'subchecks_any_yes_review_else_none',
  },
  {
    key: 'adverseMediaPresence',
    label: 'Adverse Media and Legal Scrutiny',
    baseKind: 'subchecks_any_yes_review_else_none',
  },
  {
    key: 'socialMediaPresence',
    label: 'Social media presence',
    baseKind: 'social_informational_if_metrics_else_none',
  },
  {
    key: 'fundingHistoryExistence',
    label: 'Financial and Funding History',
    baseKind: 'funding_review_if_institutional_else_none',
  },
  {
    key: 'convictedSexOffender',
    label: 'Convicted sex offender',
    baseKind: 'sex_offender_decline_if_match_else_none',
  },
]

function hasAnyYes(obj: Record<string, unknown> | undefined): boolean {
  if (!obj) return false
  return Object.values(obj).some((v) => v === 'Yes')
}

function computeBaseStatus(row: RowDef, payload: WebPresencePayload): RowStatus {
  const details = payload.result.checkListSummary.details
  const rowSubchecks = details[row.key] as Record<string, unknown> | undefined

  switch (row.baseKind) {
    case 'subchecks_any_yes_review_else_none': {
      return hasAnyYes(rowSubchecks) ? 'Review' : 'None'
    }
    case 'sex_offender_decline_if_match_else_none': {
      const match = rowSubchecks?.sexOffenderRegistryMatch
      return match === 'Yes' ? 'Decline' : 'None'
    }
    case 'funding_review_if_institutional_else_none': {
      const funding = (details.fundingHistoryExistence ??
        {}) as Record<string, unknown>
      return funding.institutionalFunding === 'Yes' ? 'Review' : 'None'
    }
    case 'social_informational_if_metrics_else_none': {
      const d = payload.result.details as any
      const agg = d?.socialMediaPresence?.reviewAggregators
      const hasMetrics = Boolean(agg?.count) || Boolean(agg?.totalReviews)
      return hasMetrics ? 'Informational' : 'None'
    }
  }
}

function computeRowStatus(row: RowDef, payload: WebPresencePayload): RowStatus {
  const base = computeBaseStatus(row, payload)

  // Decline-first: if the overall module action is "decline" and this check is cited
  // as a reason, we surface it as Decline in the table.
  const isDeclineReason =
    payload.result.summary.action.toLowerCase() === 'decline' &&
    payload.result.summary.details.includes(row.key)

  if (isDeclineReason) return 'Decline'
  return base
}

function statusClass(status: RowStatus): string {
  switch (status) {
    case 'Decline':
      return styles.statusDecline
    case 'Review':
      return styles.statusReview
    case 'Informational':
      return styles.statusInfo
    case 'Pass':
      return styles.statusPass
    case 'None':
    default:
      return styles.statusNone
  }
}

function StatusText({ status }: { status: RowStatus }) {
  return (
    <span className={`${styles.statusText} ${statusClass(status)}`}>{status}</span>
  )
}

export type WebPresenceRow = {
  key: string
  label: string
  status: RowStatus
}

export function computeWebPresenceRowStatus(
  rowKey: string,
  payload: WebPresencePayload
): RowStatus {
  const def = WEB_PRESENCE_ROWS.find((r) => r.key === rowKey)
  if (!def) return 'None'
  return computeRowStatus(def, payload)
}

export function WebPresenceSummaryTable({
  payload,
  onRowClick,
}: {
  payload: WebPresencePayload
  onRowClick?: (row: WebPresenceRow) => void
}) {
  return (
    <div
      className={styles.table}
      role="table"
      aria-label="Web Presence output"
    >
      {WEB_PRESENCE_ROWS.map((row) => {
        const status = computeRowStatus(row, payload)
        const rowModel: WebPresenceRow = { key: row.key, label: row.label, status }
        return (
          <button
            key={row.key}
            type="button"
            className={styles.row}
            role="row"
            onClick={() => onRowClick?.(rowModel)}
            aria-label={`${row.label}: ${status}`}
          >
            <div className={styles.cellLeft} role="cell">
              <span className={styles.label}>{row.label}</span>
            </div>
            <div className={styles.cellRight} role="cell">
              <StatusText status={status} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

