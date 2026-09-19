// components/ui/BrandLogo.tsx
// Single source of truth for the SKA Trust brand mark: a red rounded-square
// badge (coin + growth arrow) with camera-scan-frame corner brackets, plus
// an optional two-tone wordmark and tagline. Reused by the sidebar, login
// page, and loading screen instead of each duplicating the markup.
//
// The icon is hand-built inline SVG (not a raster image/emoji) per spec, so
// it stays crisp at every size; the same shapes back the static
// public/logo.svg and app/icon.svg files for contexts that can't render a
// React component (Electron's access-gate.html, the browser favicon).
const BADGE_RED = "#e02020";
const DARK_INK = "#1a1d24";
const LIGHT_INK = "#f2f2f2";

const SIZE_MAP = {
  sm: { icon: 32, wordmark: "text-sm", tagline: "text-[8px]" },
  md: { icon: 40, wordmark: "text-base", tagline: "text-[9px]" },
  lg: { icon: 68, wordmark: "text-2xl", tagline: "text-[11px]" },
} as const;

export function BrandLogoIcon({
  size = 40,
  showBrackets = true,
}: {
  size?: number;
  showBrackets?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      {showBrackets && (
        <g stroke={BADGE_RED} strokeWidth={3} strokeLinecap="round">
          <path d="M10,20 L10,10 L20,10" />
          <path d="M80,10 L90,10 L90,20" />
          <path d="M10,80 L10,90 L20,90" />
          <path d="M80,90 L90,90 L90,80" />
        </g>
      )}
      <rect x="15" y="15" width="70" height="70" rx="21" fill={BADGE_RED} />
      <circle cx="36" cy="58" r="13" fill="none" stroke="#fff" strokeWidth="4" />
      <text
        x="36"
        y="63"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        ₹
      </text>
      <path
        d="M26,62 L48,40 L62,50 L76,26"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="76,26 64,30 70,40" fill="#fff" />
    </svg>
  );
}

export default function BrandLogo({
  size = "md",
  showWordmark = true,
  showTagline = false,
  dark = false,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  showTagline?: boolean;
  /** Set when placed on a dark background — swaps "SKA" to a light ink. */
  dark?: boolean;
  className?: string;
}) {
  const s = SIZE_MAP[size];

  return (
    <div className={`flex items-center gap-2.5 ${size === "lg" ? "flex-col" : ""} ${className}`}>
      <BrandLogoIcon size={s.icon} />
      {showWordmark && (
        <div className={size === "lg" ? "flex flex-col items-center mt-2" : "leading-tight"}>
          <p className={`${s.wordmark} font-bold tracking-tight`} style={{ letterSpacing: "-0.01em" }}>
            <span style={{ color: dark ? LIGHT_INK : DARK_INK }}>SKA</span>{" "}
            <span style={{ color: BADGE_RED }}>Trust</span>
          </p>
          {showTagline && (
            <p
              className={`${s.tagline} font-bold uppercase text-center`}
              style={{ color: BADGE_RED, letterSpacing: "0.14em" }}
            >
              Loans you can rely on
            </p>
          )}
        </div>
      )}
    </div>
  );
}
