import Link from 'next/link';
import type { ReactNode } from 'react';

interface DashboardMetricCardProps {
  title: string;
  value: number | string;
  description: string;
  href?: string;
  icon: ReactNode;
}

export function DashboardMetricCard({
  title,
  value,
  description,
  href,
  icon,
}: DashboardMetricCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-400">{description}</p>
      {href && (
        <p className="mt-4 text-sm font-medium text-blue-400">
          Ver detalhes →
        </p>
      )}
    </>
  );

  const className =
    'rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition';

  if (!href) {
    return <article className={className}>{content}</article>;
  }

  return (
    <Link
      href={href}
      className={`${className} group hover:border-blue-500/40 hover:bg-slate-900`}
    >
      {content}
    </Link>
  );
}
