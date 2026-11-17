import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: P) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconChat = (p: P) => (
  <Base {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
    <path d="M9 11h.01M12 11h.01M15 11h.01" />
  </Base>
);
export const IconDownload = (p: P) => (
  <Base {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Base>
);
export const IconBranch = (p: P) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="8" r="2.5" />
    <path d="M6 8.5v7M18 10.5c0 4-6 3-10.5 6" />
  </Base>
);
export const IconLinkedin = (p: P) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
  </Base>
);
export const IconMail = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Base>
);
export const IconLock = (p: P) => (
  <Base {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Base>
);
export const IconArrow = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);
export const IconCode = (p: P) => (
  <Base {...p}>
    <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
  </Base>
);
export const IconExternal = (p: P) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Base>
);
export const IconUser = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Base>
);
export const IconBot = (p: P) => (
  <Base {...p}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 4v4M9 14h.01M15 14h.01" />
  </Base>
);
export const IconClose = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);
export const IconSend = (p: P) => (
  <Base {...p}>
    <path d="M4 12l16-8-6 16-2-7-8-1z" />
  </Base>
);
export const IconEdit = (p: P) => (
  <Base {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
  </Base>
);
export const IconTrash = (p: P) => (
  <Base {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Base>
);
export const IconUp = (p: P) => (
  <Base {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Base>
);
export const IconDown = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Base>
);
export const IconPlus = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export function Waves({ className, colors = ['#13A0DC', '#06213F'] }: { className?: string; colors?: [string, string] }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 320 320" preserveAspectRatio="none">
      <path d="M0 210 C 50 185, 90 235, 160 210 S 270 185, 320 210 V 320 H 0 Z" fill={colors[0]} opacity="0.55" />
      <path d="M0 240 C 60 215, 100 265, 170 240 S 280 220, 320 240 V 320 H 0 Z" fill={colors[1]} opacity="0.5" />
    </svg>
  );
}
