import { Database, FileCheck2, FileText, FlaskConical, Play, UploadCloud } from "lucide-react";

export function SourcesPanel({ workspace, sourceMeta, busy, onTicketsFile, onDocumentFiles, onAnalyze, onLoadDemo }) {
  return (
    <section className="sources-page">
      <div className="sources-intro">
        <div>
          <h2>Bring your support evidence.</h2>
          <p>Upload historical tickets and the documentation they should have answered. Files are processed only for this analysis.</p>
        </div>
        <button className="secondary-button" onClick={onLoadDemo} disabled={busy}>
          <FlaskConical size={18} strokeWidth={1.8} />
          Load SaaS demo
        </button>
      </div>

      <div className="upload-grid">
        <label className="upload-zone">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onTicketsFile(file);
              event.target.value = "";
            }}
          />
          <span className="upload-icon"><UploadCloud size={25} strokeWidth={1.7} /></span>
          <strong>Ticket history</strong>
          <span>CSV with subject, description, and preferably resolution</span>
          <small>Up to 80 tickets · 2 MB</small>
        </label>

        <label className="upload-zone">
          <input
            type="file"
            multiple
            accept=".md,.markdown,.txt,.pdf,.doc,.docx,text/plain,text/markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              if (files.length) onDocumentFiles(files);
              event.target.value = "";
            }}
          />
          <span className="upload-icon"><FileText size={25} strokeWidth={1.7} /></span>
          <strong>Current documentation</strong>
          <span>Markdown, text, PDF, .doc, or .docx</span>
          <small>Up to 12 files · 3 MB each</small>
        </label>
      </div>

      <div className="source-inventory">
        <div className="inventory-heading">
          <div>
            <Database size={20} strokeWidth={1.8} />
            <h3>Workspace inventory</h3>
          </div>
          <span>{workspace.tickets.length} tickets · {workspace.documents.length} documents</span>
        </div>

        <div className="inventory-columns">
          <div>
            <h4>Ticket source</h4>
            <div className="inventory-row">
              <FileCheck2 size={19} strokeWidth={1.8} />
              <div>
                <strong>{sourceMeta.ticketName}</strong>
                <span>{workspace.tickets.length} parsed rows</span>
              </div>
            </div>
          </div>
          <div>
            <h4>Documentation</h4>
            <div className="document-list">
              {workspace.documents.length ? workspace.documents.map((document) => (
                <div className="inventory-row" key={document.name}>
                  <FileText size={18} strokeWidth={1.8} />
                  <div>
                    <strong>{document.name}</strong>
                    <span>{Math.max(1, Math.round(document.text.length / 1000))}k characters</span>
                  </div>
                </div>
              )) : <p className="empty-copy">No documentation loaded yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="source-footer">
        <p>GPT-5.6 evaluates answerability; embedding similarity is used only for grouping and retrieval.</p>
        <button
          className="primary-button analyze-button"
          onClick={onAnalyze}
          disabled={busy || workspace.tickets.length < 4 || !workspace.documents.length}
        >
          <Play size={18} strokeWidth={1.8} />
          {busy ? "Analyzing workspace…" : "Analyze workspace"}
        </button>
      </div>
    </section>
  );
}
