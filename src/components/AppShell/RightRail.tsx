import styles from './RightRail.module.css'

export function RightRail() {
  return (
    <aside className={styles.wrap} aria-label="Right panel">
      <section className={styles.card}>
        <div className={styles.cardTitle}>Assignee</div>
        <div className={styles.assigneeRow}>
          <div className={styles.avatar} aria-hidden="true" />
          <div className={styles.assigneeEmail}>sadams@reliancesecurities.com</div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.statusRow}>
          <div className={styles.statusLabel}>Curent Status:</div>
          <div className={styles.statusPill}>Auto Approved</div>
        </div>
        <div className={styles.reasonTitle}>Reason Behind the Status</div>
        <div className={styles.reasonText}>No Issues faced by the user</div>
      </section>

      <section className={styles.card}>
        <div className={styles.commentTitle}>COMMENTS</div>
        <div className={styles.textareaWrap}>
          <div className={styles.textareaPlaceholder}>Add your comments here...</div>
          <div className={styles.sendIcon} aria-hidden="true">
            ↗
          </div>
        </div>
      </section>
    </aside>
  )
}

