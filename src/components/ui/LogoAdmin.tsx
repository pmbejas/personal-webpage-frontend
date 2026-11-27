import React from "react";

interface PropiedadesLogoAdmin {
  colapsado?: boolean;
  className?: string;
}

/**
 * Isotipo oficial del Robot desarrollador de Pablo Bejas para el panel de administración.
 * Renderiza el vector con trazo neón azul cielo (#38bdf8), antena, orejas, ojos, sonrisa y llaves de código { }.
 */
export function IsotipoRobotAdmin({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={164}
      height={232}
      viewBox="18 0 164 232"
      fill="none"
      className={`overflow-hidden shrink-0 max-w-full ${className}`}
      aria-label="Isotipo Robot Pablo Bejas"
    >
      <defs>
        <style>{`
          .trazo-neon-admin {
            stroke: #38bdf8;
            stroke-width: 6.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            filter: drop-shadow(0 0 4px #0ea5e9) drop-shadow(0 0 10px rgba(14, 165, 233, 0.75));
          }
          .relleno-neon-admin {
            fill: #38bdf8;
            filter: drop-shadow(0 0 4px #0ea5e9) drop-shadow(0 0 8px rgba(14, 165, 233, 0.8));
          }
        `}</style>
      </defs>

      <g transform="translate(15, 10)">
        {/* Antena */}
        <line className="trazo-neon-admin" x1="85" y1="36" x2="85" y2="18" />
        <circle className="relleno-neon-admin" cx="85" cy="14" r="8" />

        {/* Orejas */}
        <rect className="trazo-neon-admin" x="18" y="58" width="10" height="24" rx="5" />
        <rect className="trazo-neon-admin" x="142" y="58" width="10" height="24" rx="5" />

        {/* Cabeza */}
        <rect className="trazo-neon-admin" x="28" y="36" width="114" height="68" rx="22" />

        {/* Ojos */}
        <circle className="trazo-neon-admin" cx="62" cy="70" r="10" strokeWidth="5.5" />
        <circle className="relleno-neon-admin" cx="62" cy="70" r="4.5" />
        <circle className="trazo-neon-admin" cx="108" cy="70" r="10" strokeWidth="5.5" />
        <circle className="relleno-neon-admin" cx="108" cy="70" r="4.5" />

        {/* Sonrisa */}
        <path className="trazo-neon-admin" d="M 71 85 Q 85 96 99 85" strokeWidth="5.5" />

        {/* Cuerpo: Llaves de código { } */}
        <path
          className="trazo-neon-admin"
          d="M 64 126 C 52 126, 46 135, 46 148 C 46 158, 44 163, 31 166 C 44 169, 46 174, 46 184 C 46 197, 52 206, 64 206"
          strokeWidth="7"
        />
        <path
          className="trazo-neon-admin"
          d="M 106 126 C 118 126, 124 135, 124 148 C 124 158, 126 163, 139 166 C 126 169, 124 174, 124 184 C 124 197, 118 206, 106 206"
          strokeWidth="7"
        />
      </g>
    </svg>
  );
}

/**
 * Logotipo completo oficial en SVG para el ERP (Robot + Pablo Bejas + ERP PRIVADO CORE).
 */
export function LogoCompletoAdmin({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={242}
      height={64}
      viewBox="-6 -6 242 64"
      fill="none"
      className={`overflow-hidden shrink-0 max-w-full ${className}`}
      aria-label="Pablo Bejas ERP Privado Core"
    >
      <defs>
        <style>{`
          .trazo-neon-admin-c {
            stroke: #38bdf8;
            stroke-width: 6.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            filter: drop-shadow(0 0 4px #0ea5e9) drop-shadow(0 0 10px rgba(14, 165, 233, 0.75));
          }
          .relleno-neon-admin-c {
            fill: #38bdf8;
            filter: drop-shadow(0 0 4px #0ea5e9) drop-shadow(0 0 8px rgba(14, 165, 233, 0.8));
          }
          .fuente-nombre-admin {
            font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          .fuente-subtitulo-admin {
            font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.16em;
          }
        `}</style>
      </defs>

      {/* Isotipo Robot */}
      <g transform="translate(0, 3) scale(0.215) translate(-28, -10)">
        <g transform="translate(15, 10)">
          <line className="trazo-neon-admin-c" x1="85" y1="36" x2="85" y2="18" />
          <circle className="relleno-neon-admin-c" cx="85" cy="14" r="8" />
          <rect className="trazo-neon-admin-c" x="18" y="58" width="10" height="24" rx="5" />
          <rect className="trazo-neon-admin-c" x="142" y="58" width="10" height="24" rx="5" />
          <rect className="trazo-neon-admin-c" x="28" y="36" width="114" height="68" rx="22" />
          <circle className="trazo-neon-admin-c" cx="62" cy="70" r="10" strokeWidth="5.5" />
          <circle className="relleno-neon-admin-c" cx="62" cy="70" r="4.5" />
          <circle className="trazo-neon-admin-c" cx="108" cy="70" r="10" strokeWidth="5.5" />
          <circle className="relleno-neon-admin-c" cx="108" cy="70" r="4.5" />
          <path className="trazo-neon-admin-c" d="M 71 85 Q 85 96 99 85" strokeWidth="5.5" />
          <path
            className="trazo-neon-admin-c"
            d="M 64 126 C 52 126, 46 135, 46 148 C 46 158, 44 163, 31 166 C 44 169, 46 174, 46 184 C 46 197, 52 206, 64 206"
            strokeWidth="7"
          />
          <path
            className="trazo-neon-admin-c"
            d="M 106 126 C 118 126, 124 135, 124 148 C 124 158, 126 163, 139 166 C 126 169, 124 174, 124 184 C 124 197, 118 206, 106 206"
            strokeWidth="7"
          />
        </g>
      </g>

      {/* Tipografía Oficial */}
      <g>
        <text x="40" y="26" className="fuente-nombre-admin">
          <tspan fill="#FFFFFF">Pablo </tspan>
          <tspan fill="#38bdf8">Bejas</tspan>
        </text>
        <text x="41" y="42" className="fuente-subtitulo-admin" fill="#38bdf8">
          ERP PRIVADO CORE
        </text>
      </g>
    </svg>
  );
}

/**
 * Componente principal de Logo para el ERP.
 * Cambia automáticamente entre el Logo Completo (expandido) y solo el Robot (contraído).
 */
export function LogoAdmin({ colapsado = false, className = "" }: PropiedadesLogoAdmin) {
  if (colapsado) {
    return <IsotipoRobotAdmin className={className || "w-8 h-8"} />;
  }

  return <LogoCompletoAdmin className={className || "h-10 w-auto"} />;
}
