type IconProps = {
  className?: string;
};

export function HouseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.2 12 4l8 7.2" />
      <path d="M7 10.2V20h10v-9.8" />
      <path d="M10 20v-5.2h4V20" />
    </svg>
  );
}

export function WalkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="14" cy="4.8" r="1.7" />
      <path d="M13.2 7.6 10.4 13" />
      <path d="M11.8 10.2 8 12.6" />
      <path d="M11.6 10.8 16.4 12.2" />
      <path d="M10.4 13 8 19.6" />
      <path d="M10.7 13.1 15.8 18.8" />
    </svg>
  );
}

export function NeighborsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 12.8V10a1.5 1.5 0 0 1 3 0" />
      <path d="M10.2 11.4V7.8a1.5 1.5 0 0 1 3 .2" />
      <path d="M13.2 10.6V7.4a1.5 1.5 0 0 1 3 .3v4.2" />
      <path d="M16.2 12v-.2a1.45 1.45 0 0 1 2.7.8c.3 2-.3 3.6-1.5 4.8-1.1 1.1-2.6 1.7-4.6 1.7-2.3 0-3.9-.9-4.7-2.4" />
    </svg>
  );
}

export function LunchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 3.5v6.5" />
      <path d="M5.8 3.5v4.2a2.2 2.2 0 0 0 4.4 0V3.5" />
      <path d="M8 10v10.5" />
      <path d="M16 3.5c1.3 2.1 1.9 4 1.9 6.2 0 1.7-.9 2.7-1.9 2.9V20.5" />
    </svg>
  );
}
