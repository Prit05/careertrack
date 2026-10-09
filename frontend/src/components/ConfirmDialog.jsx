export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="modal-backdrop"
            onClick={onCancel}
        >
            <div
                className="confirm-modal"
                role="dialog"
                aria-modal="true"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <h2>{title}</h2>

                <p>{message}</p>

                <div className="form-actions">
                    <button
                        className="secondary-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        className="danger-button"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}