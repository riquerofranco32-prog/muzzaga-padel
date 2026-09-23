"use client";

import { formatARS, formatDate } from "../../../../lib/format";

const W = 720;
const H = 220;
const PAD = { top: 12, right: 12, bottom: 28, left: 52 };
const SERIES = [
  { key: "cobradoTurnos", label: "Turnos", className: "is-turnos" },
  { key: "cantina", label: "Cantina", className: "is-cantina" },
];

function niceMax(value) {
  if (value <= 0) return 10000;
  const pow = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].map((s) => s * pow).find((v) => v >= value);
}

const shortK = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);

/** Recaudación diaria en líneas: turnos vs. cantina. */
export default function DailyChart({ days }) {
  const max = niceMax(
    Math.max(...days.flatMap((d) => SERIES.map((s) => d[s.key]))),
  );
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) =>
    PAD.left +
    (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(days.length / 10));
  const totals = SERIES.map((s) => days.reduce((sum, d) => sum + d[s.key], 0));

  return (
    <figure className="admin-linechart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Recaudación diaria del período: turnos ${formatARS(totals[0])}, cantina ${formatARS(totals[1])}.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className="admin-linechart-grid"
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              className="admin-linechart-axis"
            >
              {shortK(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={d.date}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="admin-linechart-axis"
            >
              {formatDate(d.date)}
            </text>
          ) : null,
        )}
        {SERIES.map((s) => (
          <g key={s.key} className={s.className}>
            <polyline
              fill="none"
              points={days.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")}
            />
            {days.map((d, i) => (
              <circle
                key={d.date}
                cx={x(i)}
                cy={y(d[s.key])}
                r={days.length > 40 ? 2 : 3.5}
              >
                <title>{`${formatDate(d.date, "long")} · ${s.label}: ${formatARS(d[s.key])}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <figcaption className="admin-weekchart-legend">
        {SERIES.map((s, i) => (
          <span key={s.key} className={s.className}>
            {s.label} {formatARS(totals[i])}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
