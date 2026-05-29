import Link from "next/link";

type LogoProps = {
  locale: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

export function Logo({ locale, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 36, text: "text-base" },
    md: { icon: 44, text: "text-lg" },
    lg: { icon: 56, text: "text-xl" },
  };
  const s = sizes[size];

  return (
    <Link href={`/${locale}`} className="flex items-center gap-3 group">
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="32" cy="32" r="30" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
        <circle cx="32" cy="32" r="18" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4 3" />
        <circle cx="32" cy="32" r="8" fill="#0284c7" />
        <path
          d="M32 8 C38 18 42 24 32 32 C22 24 26 18 32 8Z"
          fill="#059669"
        />
        <path
          d="M28 30 C26 34 24 38 32 42 C40 38 38 34 36 30"
          fill="#16a34a"
          opacity="0.9"
        />
        <path
          d="M32 42 L32 52 M28 48 L32 52 L36 48"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold text-brand-green-dark ${s.text}`}>
            Green Flow
          </span>
          <span className="text-xs font-semibold text-brand-blue tracking-wide uppercase">
            Engineers
          </span>
        </div>
      )}
    </Link>
  );
}
