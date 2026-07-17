import { ArrowLeft, FileSearch, Play } from "lucide-react";
import { StatusDot, STATUS_LABELS } from "./StatusDot.jsx";

export function ReplayReport({ cluster, tickets, replay, onBack, onDraft }) {
  const afterById = new Map((replay?.evaluations || []).map((evaluation) => [evaluation.ticketId, evaluation]));

  return (
    <section className="replay-page">
      <div className="replay-page-heading">
        <button className="text-button" onClick={onBack}><ArrowLeft size={19} /> Back to radar</button>
        <div>
          <h2>{cluster?.label || "Historical replay"}</h2>
          <p>Every row is a historical customer question tested against the documentation before and after the proposed patch.</p>
        </div>
        <button className="primary-button" onClick={onDraft}>
          <Play size={18} strokeWidth={1.8} />
          {replay ? "Edit and rerun patch" : "Draft patch and replay"}
        </button>
      </div>

      {replay ? (
        <div className="replay-scoreboard">
          <div><span>Before coverage</span><strong>{replay.beforeCoverage}%</strong></div>
          <div><span>Projected coverage</span><strong>{replay.afterCoverage}%</strong></div>
          <div><span>Questions improved</span><strong>{replay.improvedCount}</strong></div>
          <p>{replay.summary}{replay.sampleProvenance ? <small>{replay.sampleProvenance}</small> : null}</p>
        </div>
      ) : (
        <div className="replay-empty">
          <FileSearch size={25} strokeWidth={1.7} />
          <div>
            <strong>No patch has been replayed yet.</strong>
            <p>Draft an evidence-grounded article, then GPT-5.6 will retest each question.</p>
          </div>
        </div>
      )}

      <div className="replay-table-wrap">
        <table className="replay-table">
          <thead>
            <tr>
              <th>Historical question</th>
              <th>Before</th>
              <th>After proposed patch</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const after = afterById.get(ticket.id);
              return (
                <tr key={ticket.id}>
                  <td>
                    <strong>{ticket.subject}</strong>
                    <span>{ticket.id} · {ticket.description}</span>
                  </td>
                  <td><StatusDot status={ticket.status} withLabel /></td>
                  <td>{after ? <StatusDot status={after.status} withLabel /> : <span className="not-run">Not replayed</span>}</td>
                  <td>{after?.rationale || ticket.rationale || STATUS_LABELS[ticket.status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
