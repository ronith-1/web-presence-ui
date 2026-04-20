import { useEffect } from 'react'
import styles from './Drawer.module.css'

export function Drawer({
  open,
  title,
  onClose,
  subHeader,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  subHeader?: React.ReactNode
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} type="button" onClick={onClose}>
            ✕
          </button>
        </header>
        {subHeader}
        <div className={styles.body}>{children}</div>
      </aside>
    </div>
  )
}

