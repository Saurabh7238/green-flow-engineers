type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-slate-600">{subtitle}</p>
        )}
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}
