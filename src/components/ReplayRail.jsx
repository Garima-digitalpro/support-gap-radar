import { BarChart3 } from "lucide-react";

export function ReplayRail({ cluster, replay }) {
  if (!cluster) return null;
  const before = replay?.beforeCoverage ?? cluster.coverage;
  const after = replay?.afterCoverage ?? cluster.projectedCoverage;
  const answerable = replay
    ? `${replay.answerableAfter} of ${cluster.ticketCount} questions become answerable`
    : after != null && cluster.projectedAnswerable != null
      ? `${cluster.projectedAnswerable} of ${cluster.ticketCount} questions become answerable`
      : "Draft a patch to estimate coverage lift";

  return (
    <section className="replay-rail" aria-label="Before and after knowledge replay">
      <div className="rail-metric rail-before">
        <span>Before</span>
        <strong>{before}%</strong>
      </div>
      <div className="rail-track" aria-hidden="true">
        <span className="rail-segment before-segment" />
        <span className="rail-dots" />
        <span className="rail-knob" />
        <span className={`rail-segment after-segment ${after == null ? "is-empty" : ""}`} />
      </div>
      <div className="rail-metric rail-after">
        <span>Projected</span>
        <strong>{after == null ? "—" : `${after}%`}</strong>
      </div>
      <div className="rail-answerability">
        <span className="rail-icon"><BarChart3 size={20} strokeWidth={1.8} /></span>
        <strong>{answerable}</strong>
      </div>
    </section>
  );
}
