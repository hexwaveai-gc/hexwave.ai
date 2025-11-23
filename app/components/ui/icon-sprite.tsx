/**
 * SVG Icon Sprite - Contains icon definitions for use with <use> elements
 * This matches the pattern used in the reference application
 */
export function IconSprite() {
  return (
    <svg style={{ display: "none" }} aria-hidden="true">
      <defs>
        <symbol id="icon-empty" viewBox="0 0 100 100" fill="none">
          {/* Swirling/orbiting circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          {/* Landscape frame */}
          <rect
            x="30"
            y="35"
            width="40"
            height="30"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          {/* Mountains inside frame */}
          <path
            d="M35 55 L42 48 L48 52 L55 45 L62 50 L62 60 L35 60 Z"
            fill="currentColor"
            opacity="0.5"
          />
          {/* Sun/Moon */}
          <circle cx="55" cy="42" r="4" fill="currentColor" opacity="0.6" />
        </symbol>
      </defs>
    </svg>
  );
}

