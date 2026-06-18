import styles from './LeftNav.module.css'

type NavItem = { label: string; active?: boolean }

const appDetails: NavItem[] = [
  { label: 'Workflow Details' },
  { label: 'User Information' },
]

const modulesUsed: NavItem[] = [
  { label: 'Geo IP API' },
  { label: 'Personal Details API' },
  { label: 'Digilocker API', active: true },
  { label: 'Extracts age from DOB' },
  { label: 'Additional details API' },
  { label: 'NSDL Pan verification' },
  { label: 'PAN Dedupe' },
  { label: 'AML Screening' },
  { label: 'KRA Search & Verify' },
  { label: 'Bank Account Verification' },
  { label: 'Selfie Verification' },
  { label: 'Face Match' },
  { label: 'Wet Signature' },
  { label: 'Segment selection data...' },
  { label: 'Nominee and Guardian...' },
]

function Section({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.items}>
        {items.map((it) => (
          <div
            key={it.label}
            className={`${styles.item} ${it.active ? styles.itemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden="true" />
            <span className={styles.itemLabel}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeftNav() {
  return (
    <aside className={styles.wrap} aria-label="Left navigation">
      <Section title="Application Details" items={appDetails} />
      <Section title="Modules Used" items={modulesUsed} />
    </aside>
  )
}

