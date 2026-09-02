type IconProps = {
  className?: string;
  title?: string;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconPlane({ className, title }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        {...base}
        d="M10.5 6.5 21 12l-10.5 5.5V14L5 16.5 3.5 15l5-3-5-3L5 7.5 10.5 10V6.5Z"
      />
    </svg>
  );
}

export function IconShieldCheck({ className, title }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path {...base} d="M12 3 5 6.5v5.2c0 4.1 2.8 7.8 7 8.8 4.2-1 7-4.7 7-8.8V6.5L12 3Z" />
      <path {...base} d="m9.2 12.2 1.9 1.9 3.7-3.8" />
    </svg>
  );
}

export function IconDesk({ className, title }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path {...base} d="M4 10h16v8H4z" />
      <path {...base} d="M8 10V7.5A2.5 2.5 0 0 1 10.5 5h3A2.5 2.5 0 0 1 16 7.5V10" />
      <path {...base} d="M8 18v2M16 18v2" />
    </svg>
  );
}

export function IconLuggage({ className, title }: IconProps) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path {...base} d="M8 7h8v12H8z" />
      <path {...base} d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7" />
      <path {...base} d="M8 11h8M10 19v1.5M14 19v1.5" />
    </svg>
  );
}

export function IconRoute({ className, title }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="6" cy="18" r="2.25" {...base} />
      <circle cx="18" cy="6" r="2.25" {...base} />
      <path {...base} d="M8 16.5 16 7.5" />
    </svg>
  );
}

export function IconSearch({ className, title }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="11" cy="11" r="6.5" {...base} />
      <path {...base} d="m16 16 4 4" />
    </svg>
  );
}
