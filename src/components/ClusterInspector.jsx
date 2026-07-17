import { AlertTriangle, ArrowRight, FileText, FileWarning, X } from "lucide-react";

export function ClusterInspector({ cluster, selectedTicket, busy, onClose, onDraft, onInspect }) {
  if (!cluster) {
    return (
      <aside className="cluster-inspector inspector-empty">
        <p>Select a cluster to inspect its evidence.</p>
      </aside>
    );
  }

  return (
    <aside className="cluster-inspector" aria-label={`Details for ${cluster.label}`}>
      <div className="inspector-header">
        <h2>{cluster.label}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close cluster inspector">
          <X size={21} strokeWidth={1.8} />
        </button>
      </div>

      <section className="coverage-block">
        <span>Current coverage</span>
        <strong>{cluster.coverage}%</strong>
        <div className="coverage-bar" aria-hidden="true">
          <span style={{ width: `${cluster.coverage}%` }} />
        </div>
      </section>

      <section className="inspector-section">
        <h3>Why this fails</h3>
        <p>{cluster.whyItFails}</p>
      </section>

      <section className="inspector-section evidence-section">
        <h3>Evidence <span>(from {cluster.ticketCount} tickets)</span></h3>
        <ul>
          {cluster.evidence.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
        </ul>
        {selectedTicket ? (
          <div className="selected-ticket-evidence">
            <strong>{selectedTicket.id}</strong>
            <span>{selectedTicket.subject}</span>
          </div>
        ) : null}
      </section>

      {cluster.conflicts?.length ? (
        <section className="conflict-note" role="alert">
          <AlertTriangle size={18} strokeWidth={1.9} />
          <div>
            <strong>Conflicting evidence</strong>
            <p>{cluster.conflicts[0]}</p>
          </div>
        </section>
      ) : null}

      <section className="inspector-section source-section">
        <h3>Best source</h3>
        <div className="source-file">
          <FileText size={21} strokeWidth={1.7} />
          <span>{cluster.bestSource}</span>
        </div>
      </section>

      <div className="inspector-actions">
        <button className="primary-button draft-button" onClick={onDraft} disabled={busy}>
          {cluster.safeToDraft ? <FileText size={19} strokeWidth={1.8} /> : <FileWarning size={19} strokeWidth={1.8} />}
          <span>{busy ? "Asking GPT-5.6…" : cluster.safeToDraft ? "Draft evidence-grounded patch" : "Open conflict report"}</span>
        </button>
        <button className="text-button inspect-button" onClick={onInspect}>
          <span>Inspect {cluster.ticketCount} tickets</span>
          <ArrowRight size={21} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
