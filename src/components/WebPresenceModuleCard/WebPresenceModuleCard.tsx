import { useState } from 'react'
import type { WebPresencePayload } from '../../samplePayload'
import { WebPresenceSummaryTable } from '../WebPresenceSummaryTable/WebPresenceSummaryTable'
import styles from './WebPresenceModuleCard.module.css'
import type { WebPresenceRow } from '../WebPresenceSummaryTable/WebPresenceSummaryTable'
import { WebPresenceUnifiedDrawer } from '../WebPresenceUnifiedDrawer/WebPresenceUnifiedDrawer'

function IconTile() {
  return (
    <div className={styles.iconTile} aria-hidden="true">
      <div className={styles.iconMark} />
    </div>
  )
}

export function WebPresenceModuleCard({ payload }: { payload: WebPresencePayload }) {
  const attemptedAt = '11:17 pm, Feb 27, 2025'
  const [activeRow, setActiveRow] = useState<WebPresenceRow | null>(null)

  // These "inputs" are placeholders matching the Figma snapshot.
  // We’ll wire them to real payload fields once we confirm the actual input keys.
  const inputs = [
    { k: 'Business Name', v: 'Blue Oak Technologies LLC' },
    {
      k: 'Business address',
      v: '1458 Pacific Avenue, Suite 301,\nSan Francisco, CA 94109',
    },
    { k: 'Owner name', v: '-' },
  ]

  const uploads = [
    'Bank 6862 - Dec 2024 - 2025-01-31 21_15_14.xml',
    'Bank 6862 - Nov 2024 - 2025-01-31 21_15_13.xml',
  ]

  return (
    <>
      <section className={styles.card} aria-label="Web Presence">
      <header className={styles.header}>
        <IconTile />
        <div className={styles.title}>Web Presence</div>
      </header>

      <div className={styles.tabsBar}>
        <div className={styles.tabActive}>
          <span className={styles.tabDot} aria-hidden="true" />
          <span className={styles.tabLabel}>1st attempt</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.attemptedAt}>
          <span className={styles.attemptedAtLabel}>Attempted at:</span>
          <span className={styles.attemptedAtValue}>{attemptedAt}</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.col}>
            <div className={styles.sectionLabel}>INPUTS</div>
            <div className={styles.inputsBox}>
              <div className={styles.inputsTable} role="table" aria-label="Inputs">
                {inputs.map((row, idx) => (
                  <div
                    key={row.k}
                    className={`${styles.inputRow} ${idx === 1 ? styles.rowAlt : ''}`}
                    role="row"
                  >
                    <div className={styles.inputCellLeft} role="cell">
                      {row.k}
                    </div>
                    <div className={styles.inputCellRight} role="cell">
                      <span className={styles.inputValue}>{row.v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sectionSpacer} />

            <div className={styles.sectionLabel}>File Uploads</div>
            <div className={styles.uploads}>
              {uploads.map((name) => (
                <div key={name} className={styles.uploadRow}>
                  <div className={styles.fileType}>XML</div>
                  <div className={styles.fileName} title={name}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.colFixed}>
            <div className={styles.sectionLabel}>Output</div>
            <WebPresenceSummaryTable
              payload={payload}
              variant="figma"
              onRowClick={(row) => setActiveRow(row)}
            />
          </div>
        </div>
      </div>
      </section>

      <WebPresenceUnifiedDrawer
        open={Boolean(activeRow)}
        payload={payload}
        initialKey={activeRow?.key ?? null}
        onClose={() => setActiveRow(null)}
      />
    </>
  )
}

