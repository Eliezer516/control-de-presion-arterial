interface ConfirmDialogProps {
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog nb-card" role="dialog" aria-modal="true">
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn nb-btn nb-btn-primary nb-btn-sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button type="button" className="btn nb-btn nb-btn-ghost nb-btn-sm" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog