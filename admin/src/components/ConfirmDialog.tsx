// Silmə təsdiqi — Modal üzərində qurulub.
import { Modal } from './Modal';

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Sil',
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width={420}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel}>
            Ləğv et
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{message}</p>
    </Modal>
  );
}
