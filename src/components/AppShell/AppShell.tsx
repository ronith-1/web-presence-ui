import type { WebPresencePayload } from '../../samplePayload'
import { LeftNav } from './LeftNav'
import { RightRail } from './RightRail'
import { TopNav } from './TopNav'
import { WebPresenceModuleCard } from '../WebPresenceModuleCard/WebPresenceModuleCard'
import styles from './AppShell.module.css'

export function AppShell({ payload }: { payload: WebPresencePayload }) {
  return (
    <div className={styles.page}>
      <TopNav />
      <div className={styles.contentRow}>
        <LeftNav />
        <main className={styles.main}>
          <div className={styles.mainInner}>
            <WebPresenceModuleCard payload={payload} />
          </div>
        </main>
        <RightRail />
      </div>
    </div>
  )
}

