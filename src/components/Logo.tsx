import Image from "next/image";
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
      <Image
        src="/images/green-flow-logo.png"
        alt="Green Flow Engineers"
        width={s.icon}
        height={s.icon}
        className="shrink-0 object-contain"
      />
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
