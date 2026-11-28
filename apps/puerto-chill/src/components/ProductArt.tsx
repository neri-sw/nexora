import type { ArtKind } from "@/lib/types";

/**
 * Ilustraciones de producto dibujadas en línea con aguada de color translúcida.
 * Son marcadores hasta tener fotos reales de cada producto.
 */

const INK = "#2f2924";
const S = { stroke: INK, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Shelf() {
  return (
    <g>
      <path d="M14 168h172" {...S} />
      <path d="M22 168v6M178 168v6" {...S} strokeWidth={1.6} />
    </g>
  );
}

const arts: Record<ArtKind, React.ReactNode> = {
  jarra: (
    <g>
      {/* jarra */}
      <path d="M44 64h46l-4 98H48z" fill="#bcd0d2" fillOpacity={0.55} {...S} />
      <path d="M90 78c18 0 20 34 0 38" fill="none" {...S} />
      <path d="M44 64l-6-6" {...S} />
      <path d="M50 100h34" {...S} strokeWidth={1.4} strokeDasharray="2 5" />
      {/* hielera */}
      <path d="M104 110h40l-3 52h-34z" fill="#58633f" fillOpacity={0.35} {...S} />
      <path d="M100 110h48" {...S} />
      <path d="M112 102a12 8 0 0 1 24 0" fill="none" {...S} />
      {/* vasos */}
      <path d="M152 128h22l-2 34h-18z" fill="#bcd0d2" fillOpacity={0.55} {...S} />
      <path d="M156 140h14" {...S} strokeWidth={1.4} />
      <path d="M118 128h0" {...S} />
    </g>
  ),
  cocina: (
    <g>
      <path d="M78 98h52l-4 64H82z" fill="#c9a77c" fillOpacity={0.5} {...S} />
      <path d="M82 116h44" {...S} strokeWidth={1.4} />
      {/* espátula */}
      <path d="M90 98V48" {...S} />
      <rect x="80" y="30" width="20" height="22" rx="3" fill="#2f2924" fillOpacity={0.12} {...S} />
      {/* cucharón */}
      <path d="M106 98V40" {...S} />
      <path d="M96 40a10 9 0 0 0 20 0z" fill="#2f2924" fillOpacity={0.12} {...S} />
      {/* batidor */}
      <path d="M122 98V58" {...S} />
      <path d="M122 58c-9-6-9-26 0-30 9 4 9 24 0 30zM122 58c-4-6-4-24 0-30" fill="none" {...S} strokeWidth={1.6} />
      {/* cuchara de madera */}
      <path d="M58 162l22-70" {...S} />
      <ellipse cx="83" cy="84" rx="6" ry="10" transform="rotate(18 83 84)" fill="#c9a77c" fillOpacity={0.6} {...S} />
    </g>
  ),
  mate: (
    <g>
      <path d="M58 104c-8 22-4 58 26 58s34-36 26-58z" fill="#7a5a3a" fillOpacity={0.45} {...S} />
      <path d="M56 104h56" {...S} />
      <path d="M62 104c2-6 40-6 44 0" fill="#58633f" fillOpacity={0.5} {...S} />
      <path d="M92 108l14-58" {...S} />
      <path d="M104 50l6-4" {...S} />
      <rect x="124" y="92" width="38" height="70" rx="6" fill="#22414f" fillOpacity={0.35} {...S} />
      <path d="M124 104h38" {...S} />
      <path d="M134 128h18" {...S} strokeWidth={1.4} />
    </g>
  ),
  vasos: (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${36 + i * 44} 0)`}>
          <path d="M0 96h36l-4 66H4z" fill="#bcd0d2" fillOpacity={0.5} {...S} />
          <path d="M5 124h26" {...S} strokeWidth={1.4} />
          <path d="M8 104v44" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
    </g>
  ),
  bolso: (
    <g>
      <path d="M42 84h116l-10 78H52z" fill="#2f2924" fillOpacity={0.75} {...S} />
      <path d="M72 84c0-40 56-40 56 0" fill="none" {...S} strokeWidth={4} />
      <path d="M60 104h80" stroke="#c9a77c" strokeWidth={1.6} strokeDasharray="3 4" />
    </g>
  ),
  cartera: (
    <g>
      <path d="M46 92h108l-6 70H52z" fill="#2f2924" fillOpacity={0.8} {...S} />
      <path d="M70 92c0-34 60-34 60 0" fill="none" {...S} strokeWidth={4} />
      <path d="M62 92h76v38c0 6-4 10-10 10H72c-6 0-10-4-10-10z" fill="#4a423b" {...S} />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={68 + i * 8} cy={134} r={1.8} fill="#c9c2b8" />
      ))}
      <rect x="94" y="134" width="12" height="20" rx="2" fill="#4a423b" {...S} strokeWidth={1.6} />
    </g>
  ),
  rinonera: (
    <g>
      <path d="M20 112c40 10 120 10 160 0" fill="none" {...S} strokeWidth={4} stroke="#7a5a3a" />
      <path d="M52 104c0-10 8-16 18-16h60c10 0 18 6 18 16v34c0 14-10 24-24 24H76c-14 0-24-10-24-24z" fill="#a8743f" fillOpacity={0.7} {...S} />
      <path d="M58 118h84" {...S} />
      <path d="M120 112v12" {...S} strokeWidth={2.6} />
    </g>
  ),
  billetera: (
    <g>
      <rect x="48" y="88" width="104" height="70" rx="8" fill="#5e4636" fillOpacity={0.7} {...S} />
      <path d="M112 106h40v32h-40a6 6 0 0 1-6-6v-20a6 6 0 0 1 6-6z" fill="#4a3a2e" {...S} />
      <circle cx="120" cy="122" r="3.5" fill="#c9c2b8" />
      <path d="M58 98h40" stroke="#c9a77c" strokeWidth={1.4} strokeDasharray="3 4" />
    </g>
  ),
};

/** Solo la línea de estante, con la misma geometría que las ilustraciones. */
export function ShelfLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Shelf />
    </svg>
  );
}

const grounds: Record<ArtKind, string> = {
  jarra: "#e4e6da",
  cocina: "#eee6d8",
  mate: "#e9e4d6",
  vasos: "#e2e8e6",
  bolso: "#e8dfd0",
  cartera: "#e5dccd",
  rinonera: "#ece3d3",
  billetera: "#e8e0d2",
};

export function ProductArt({
  kind,
  title,
  className,
  plate = true,
}: {
  kind: ArtKind;
  title?: string;
  className?: string;
  /** Sin placa: el objeto solo, para pararlo sobre un estante real. */
  plate?: boolean;
}) {
  return (
    <svg
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      viewBox={plate ? "0 0 200 200" : "10 20 180 150"}
      preserveAspectRatio={plate ? "xMidYMid slice" : "xMidYMax meet"}
    >
      {plate && <rect width="200" height="200" fill={grounds[kind]} />}
      {plate && <circle cx="100" cy="112" r="64" fill="#fff" opacity={0.35} />}
      {arts[kind]}
      {plate && <Shelf />}
    </svg>
  );
}
