import styles from './TopNav.module.css'

function SegmentedTabs() {
  return (
    <div className={styles.segmented} role="tablist" aria-label="View switcher">
      <button className={styles.segBtn} role="tab" aria-selected="false">
        Overview
      </button>
      <div className={styles.segDivider} aria-hidden="true" />
      <button className={styles.segBtn} role="tab" aria-selected="false">
        Timeline
      </button>
      <div className={styles.segDivider} aria-hidden="true" />
      <button className={styles.segBtnActive} role="tab" aria-selected="true">
        All Modules
      </button>
    </div>
  )
}

export function TopNav() {
  return (
    <header className={styles.wrap}>
      <div className={styles.navbar} aria-label="Page header">
        <div className={styles.left}>
          <div className={styles.back} aria-hidden="true">
            ‹
          </div>
          <div className={styles.title} title="THAKOR SHAILESHBHAI SHANKARJIasdasd">
            THAKOR SHAILESHBHAI SHANKARJIasdasd
          </div>
        </div>

        <SegmentedTabs />

        <div className={styles.right}>
          <button className={styles.shareBtn} type="button">
            <span className={styles.shareIcon} aria-hidden="true">
              ↗
            </span>
            Share Link
          </button>
          <div className={styles.appsPill}>
            <span className={styles.appsIcon} aria-hidden="true">
              ↔
            </span>
            3/20 Applications
            <span className={styles.appsCaret} aria-hidden="true">
              ▾
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

