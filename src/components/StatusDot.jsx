const LABELS = {
  covered: "Covered",
  partial: "Partial",
  missing: "Missing",
  contradiction: "Contradiction",
};

export function StatusDot({ status, withLabel = false, size = "md" }) {
  return (
    <span className={`status-dot-wrap status-${status} status-${size}`} title={LABELS[status]}>
      <span className="status-dot" aria-hidden="true" />
      {withLabel ? <span>{LABELS[status]}</span> : <span className="sr-only">{LABELS[status]}</span>}
    </span>
  );
}

export const STATUS_LABELS = LABELS;
