import { useState } from "react";
import { AlertTriangle, Download, FilePenLine, Play, ShieldAlert, X } from "lucide-react";

export function ArticleWorkbench({ open, cluster, draft, markdown, replay, busy, onChange, onClose, onReplay, onExport }) {
  const [mode, setMode] = useState("edit");
  if (!open) return null;

  return (
    <div className="workbench-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <aside className="article-workbench" role="dialog" aria-modal="true" aria-labelledby="workbench-title">
        <header className="workbench-header">
          <div>
            <span>Evidence-grounded patch</span>
            <h2 id="workbench-title">{draft?.title || cluster?.label || "Preparing draft"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close article workbench">
            <X size={22} strokeWidth={1.8} />
          </button>
        </header>

        {busy && !draft ? (
          <div className="workbench-loading">
            <span className="loading-radar" aria-hidden="true" />
            <strong>GPT-5.6 is tracing the evidence.</strong>
            <p>Checking resolved outcomes against current documentation before writing.</p>
          </div>
        ) : null}

        {draft ? (
          <>
            <div className={`draft-safety ${draft.safeToDraft ? "is-safe" : "is-blocked"}`}>
              {draft.safeToDraft ? <FilePenLine size={19} strokeWidth={1.8} /> : <ShieldAlert size={19} strokeWidth={1.8} />}
              <div>
                <strong>{draft.safeToDraft ? "Draftable from supplied evidence" : "Human policy decision required"}</strong>
                <p>{draft.summary}</p>
              </div>
            </div>

            {draft.blockingConflicts?.length ? (
              <div className="blocking-conflicts" role="alert">
                <AlertTriangle size={19} strokeWidth={1.9} />
                <div>
                  <strong>Blocking conflicts</strong>
                  <ul>{draft.blockingConflicts.map((conflict) => <li key={conflict}>{conflict}</li>)}</ul>
                </div>
              </div>
            ) : null}

            <div className="workbench-toolbar">
              <div className="view-switch" aria-label="Article view">
                <button className={mode === "edit" ? "is-active" : ""} onClick={() => setMode("edit")}>Edit</button>
                <button className={mode === "preview" ? "is-active" : ""} onClick={() => setMode("preview")}>Preview</button>
              </div>
              <button className="secondary-button compact-button" onClick={onExport} disabled={!markdown}>
                <Download size={17} strokeWidth={1.8} />
                Export Markdown
              </button>
            </div>

            {mode === "edit" ? (
              <textarea
                className="markdown-editor"
                value={markdown}
                onChange={(event) => onChange(event.target.value)}
                aria-label="Proposed documentation Markdown"
                spellCheck="true"
              />
            ) : (
              <pre className="markdown-preview">{markdown}</pre>
            )}

            <section className="provenance-block">
              <h3>Source basis</h3>
              <div>{draft.sourceBasis.map((source) => <span key={source}>{source}</span>)}</div>
              {draft.sampleProvenance ? (
                <p className="sample-provenance"><strong>Sample provenance:</strong> {draft.sampleProvenance}</p>
              ) : null}
              {draft.unansweredQuestions?.length ? (
                <p><strong>Still unanswered:</strong> {draft.unansweredQuestions.join(" · ")}</p>
              ) : null}
            </section>

            {replay ? (
              <section className="workbench-replay-result">
                <div>
                  <span>Before</span>
                  <strong>{replay.beforeCoverage}%</strong>
                </div>
                <span className="replay-arrow" aria-hidden="true">→</span>
                <div>
                  <span>Projected</span>
                  <strong>{replay.afterCoverage}%</strong>
                </div>
                <p>{replay.improvedCount} historical questions improved. {replay.summary}</p>
              </section>
            ) : null}

            <footer className="workbench-footer">
              <p>Projected coverage is an AI evaluation, not guaranteed ticket deflection.</p>
              <button className="primary-button" onClick={onReplay} disabled={busy || !draft.safeToDraft || !markdown.trim()}>
                <Play size={18} strokeWidth={1.8} />
                {busy ? "Replaying questions…" : `Replay ${cluster.ticketCount} questions`}
              </button>
            </footer>
          </>
        ) : null}
      </aside>
    </div>
  );
}
