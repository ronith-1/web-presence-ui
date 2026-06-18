import { useState } from 'react'
import styles from './DigilockerModuleCard.module.css'

function IconTile() {
  return (
    <div className={styles.iconTile} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1" fill="#553EF1" opacity="0.85" />
        <rect x="11" y="2" width="7" height="7" rx="1" fill="#553EF1" opacity="0.55" />
        <rect x="2" y="11" width="7" height="7" rx="1" fill="#553EF1" opacity="0.55" />
        <rect x="11" y="11" width="7" height="7" rx="1" fill="#553EF1" opacity="0.35" />
      </svg>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#14804A" />
      <path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DocumentImage() {
  return (
    <div className={styles.docImageWrap} aria-label="Aadhaar document image">
      <div className={styles.docImageInner}>
        <div className={styles.docHeader}>
          <div className={styles.docHeaderLine} />
          <div className={styles.docHeaderText}>Digilocker verified e-Aadhaar</div>
          <div className={styles.docSubText}>This document is generated from verified Aadhaar XML, obtained from DigiLocker with due user consent and authentication</div>
        </div>
        <div className={styles.docBody}>
          <div className={styles.docFields}>
            {[
              ['Document Type', 'e-Aadhar generated from DigiLocker verified Aadhaar XML'],
              ['Generation date', '2025-02-27T14:57.302'],
              ['Download date', '2025-02-27T14:57.682'],
              ['Masked Aadhaar Number', 'xxxxxxxx4763'],
              ['Name', 'SAIBAL SAHA'],
              ['Date of Birth', '21-05-1989'],
              ['Gender', 'Male'],
              ['LID', ''],
              ['Address', 'TRAFUL, NUAPARA (NUAPADA)\nBengalore p...'],
              ['', 'Kolkata, West Bengal, 700097'],
              ['Landmark', 'BELGATAHA'],
              ['District', 'Kolkata'],
              ['City', 'Kolkata'],
              ['Pincode', '700037'],
              ['State', 'West Bengal'],
            ].slice(0, 8).map(([k, v], i) => (
              <div key={i} className={styles.docFieldRow}>
                <div className={styles.docFieldKey}>{k}</div>
                <div className={styles.docFieldVal}>{v}</div>
              </div>
            ))}
          </div>
          <div className={styles.docPhoto} aria-label="Applicant photo" />
        </div>
      </div>
    </div>
  )
}

type DataRow = { label: string; value: string }

function DataTable({ rows }: { rows: DataRow[] }) {
  return (
    <div className={styles.dataTable}>
      {rows.map((row, i) => (
        <div key={i} className={styles.dataRow}>
          <div className={styles.dataLabel}>{row.label}</div>
          <div className={styles.dataValue}>{row.value}</div>
        </div>
      ))}
    </div>
  )
}

type ResultRow = { label: string; value: string; pass: boolean }

function ResultsTable({ rows }: { rows: ResultRow[] }) {
  return (
    <div className={styles.resultsTable}>
      {rows.map((row, i) => (
        <div key={i} className={styles.resultRow}>
          <div className={styles.resultLabel}>{row.label}</div>
          <div className={`${styles.resultValue} ${row.pass ? styles.resultPass : styles.resultFail}`}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  )
}

type StepRow = { name: string; description: string; count: number }

function StepItem({ step }: { step: StepRow }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.stepRow}>
      <button
        className={styles.stepBtn}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <svg
          className={`${styles.stepCaret} ${expanded ? styles.stepCaretOpen : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          aria-hidden="true"
        >
          <path d="M4 3L8 6L4 9" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.stepName}>{step.name}</span>
        <span className={styles.stepDot} aria-hidden="true">•</span>
        <span className={styles.stepDesc}>{step.description}</span>
        <span className={styles.stepCount}>({step.count})</span>
      </button>
      {expanded && (
        <div className={styles.stepExpanded}>
          <span className={styles.stepExpandedText}>Step details coming soon.</span>
        </div>
      )}
    </div>
  )
}

const aadhaarRows: DataRow[] = [
  { label: 'Aadhaar Name', value: 'SAIBAL SAHA' },
  { label: 'Date Of Birth', value: '21-05-1989' },
  { label: 'Masked Aadhar', value: 'xxxxxxxx4763' },
]

const panRows: DataRow[] = [
  { label: 'PAN Name', value: 'SAIBAL SAHA' },
  { label: 'PAN Number', value: 'GQPPS6200H' },
  { label: 'PAN DOB', value: '21-05-1989' },
]

const resultRows: ResultRow[] = [
  { label: 'Digilocker Consent', value: 'True', pass: true },
  { label: 'Digiocker XML Fetched', value: 'True', pass: true },
  { label: 'DocDetails Fetched', value: 'True', pass: true },
]

const steps: StepRow[] = [
  { name: 'Health API', description: 'Checks the status of digilocker database', count: 3 },
  { name: 'Digilocker API', description: 'User account details collection', count: 3 },
  { name: 'Digilocker docDetails API', description: 'Matching account name with applicant name', count: 1 },
]

export function DigilockerModuleCard() {
  return (
    <section className={styles.card} aria-label="DigiLocker module">
      <header className={styles.header}>
        <IconTile />
        <div className={styles.title}>DigiLocker</div>
      </header>

      <div className={styles.tabsBar}>
        <div className={styles.tabActive}>
          <CheckIcon />
          <span className={styles.tabLabel}>1st Attempt</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.attemptedAt}>
          <span className={styles.attemptedAtLabel}>Attempted at:</span>
          <span className={styles.attemptedAtValue}>11:17 pm, Feb 27, 2025</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.colLeft}>
            <div className={styles.sectionLabel}>FETCHED DETAILS</div>
            <DocumentImage />
            <a className={styles.sourceLink} href="#" onClick={(e) => e.preventDefault()}>
              Source: DigiLocker Aadhaar Fetch
            </a>
            <DataTable rows={aadhaarRows} />
            <DataTable rows={panRows} />
          </div>

          <div className={styles.colRight}>
            <div className={styles.sectionLabel}>RESULTS</div>
            <ResultsTable rows={resultRows} />
          </div>
        </div>

        <div className={styles.stepsSection}>
          <div className={styles.sectionLabel}>STEPS INVOLVED IN VERIFICATION</div>
          <div className={styles.stepsList}>
            {steps.map((step) => (
              <StepItem key={step.name} step={step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
