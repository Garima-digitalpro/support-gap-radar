import { useMemo } from "react";
import { StatusDot } from "./StatusDot.jsx";

const COLORS = {
  covered: "#18aa75",
  partial: "#f3a000",
  missing: "#ff6559",
  contradiction: "#8f31a9",
};

const POSITIONS = [
  { x: 235, y: 195, rx: 122, ry: 98, labelX: 120, labelY: 58 },
  { x: 615, y: 150, rx: 86, ry: 72, labelX: 560, labelY: 62 },
  { x: 665, y: 350, rx: 84, ry: 76, labelX: 730, labelY: 345 },
  { x: 455, y: 485, rx: 88, ry: 70, labelX: 405, labelY: 575 },
  { x: 160, y: 410, rx: 94, ry: 72, labelX: 72, labelY: 520 },
  { x: 430, y: 285, rx: 78, ry: 64, labelX: 380, labelY: 210 },
];

function semanticPosition(label, index) {
  const normalized = label.toLowerCase();
  if (normalized.includes("refund")) return POSITIONS[0];
  if (normalized.includes("invoice")) return POSITIONS[1];
  if (normalized.includes("sso")) return POSITIONS[2];
  if (normalized.includes("export")) return POSITIONS[3];
  if (normalized.includes("seat")) return POSITIONS[4];
  return POSITIONS[index % POSITIONS.length];
}

function midpoint(left, right) {
  return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
}

function blobPath({ x, y, rx, ry }, seed) {
  const points = Array.from({ length: 12 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 12;
    const wobble = 1 + Math.sin(index * 1.73 + seed * 2.1) * 0.08;
    return {
      x: x + Math.cos(angle) * rx * wobble,
      y: y + Math.sin(angle) * ry * wobble,
    };
  });
  const start = midpoint(points.at(-1), points[0]);
  let path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;
  for (let index = 0; index < points.length; index += 1) {
    const next = points[(index + 1) % points.length];
    const mid = midpoint(points[index], next);
    path += ` Q ${points[index].x.toFixed(2)} ${points[index].y.toFixed(2)} ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
  }
  return `${path} Z`;
}

function ticketPosition(position, index, count) {
  if (index === 0) return { x: position.x, y: position.y };
  const angle = index * 2.399963 + count * 0.17;
  const progress = Math.sqrt(index / Math.max(1, count - 1));
  const radiusX = 22 + progress * position.rx * 0.62;
  const radiusY = 18 + progress * position.ry * 0.62;
  return {
    x: position.x + Math.cos(angle) * radiusX,
    y: position.y + Math.sin(angle) * radiusY,
  };
}

export function EvidenceMap({ clusters, tickets, selectedClusterId, selectedTicketId, onSelectCluster, onSelectTicket }) {
  const ticketMap = useMemo(() => {
    const grouped = new Map();
    for (const ticket of tickets || []) {
      if (!grouped.has(ticket.clusterId)) grouped.set(ticket.clusterId, []);
      grouped.get(ticket.clusterId).push(ticket);
    }
    return grouped;
  }, [tickets]);

  return (
    <section className="evidence-map-wrap" aria-label="Documentation coverage gap map">
      <div className="evidence-map-scroll">
        <svg className="evidence-map" viewBox="0 0 840 620" role="img">
          <title>Ticket clusters colored by documentation coverage</title>
          <g className="contours" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <circle key={index} cx="430" cy="310" r={34 + index * 33} />
            ))}
          </g>

          <g className="cluster-connectors" aria-hidden="true">
            {clusters.map((cluster, index) => {
              const position = semanticPosition(cluster.label, index);
              return <line key={cluster.clusterId} x1="430" y1="310" x2={position.x} y2={position.y} />;
            })}
          </g>

          {clusters.map((cluster, index) => {
            const position = semanticPosition(cluster.label, index);
            const clusterTickets = ticketMap.get(cluster.clusterId) || [];
            const selected = cluster.clusterId === selectedClusterId;
            return (
              <g
                key={cluster.clusterId}
                className={`cluster-group ${selected ? "is-selected" : ""}`}
                role="button"
                tabIndex="0"
                aria-label={`${cluster.label}, ${cluster.ticketCount} tickets, ${cluster.missingRate}% missing`}
                onClick={() => onSelectCluster(cluster.clusterId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelectCluster(cluster.clusterId);
                }}
              >
                <path className="cluster-outline" d={blobPath(position, index)} />
                {clusterTickets.map((ticket, ticketIndex) => {
                  const dot = ticketPosition(position, ticketIndex, clusterTickets.length);
                  const ticketSelected = ticket.id === selectedTicketId;
                  return (
                    <g
                      key={ticket.id}
                      className={`ticket-point ${ticketSelected ? "is-selected" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectCluster(cluster.clusterId);
                        onSelectTicket(ticket.id);
                      }}
                    >
                      <title>{`${ticket.id}: ${ticket.subject} — ${ticket.status}`}</title>
                      {ticketSelected ? <circle cx={dot.x} cy={dot.y} r="13" className="ticket-focus-ring" /> : null}
                      <circle cx={dot.x} cy={dot.y} r="7.5" fill={COLORS[ticket.status] || COLORS.missing} />
                    </g>
                  );
                })}

                {selected ? (
                  <g className="selected-cluster-label" transform={`translate(${position.labelX} ${position.labelY})`}>
                    <rect width="254" height="72" rx="12" />
                    <text x="16" y="28" className="cluster-title">{cluster.label}</text>
                    <text x="16" y="53" className="cluster-subtitle">
                      {cluster.ticketCount} tickets · <tspan>{cluster.missingRate}% missing</tspan>
                    </text>
                  </g>
                ) : (
                  <text x={position.labelX} y={position.labelY} className="map-cluster-label">{cluster.label}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="map-legend" aria-label="Coverage status legend">
        {Object.keys(COLORS).map((status) => <StatusDot key={status} status={status} withLabel />)}
      </div>
    </section>
  );
}
