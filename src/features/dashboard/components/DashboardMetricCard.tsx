import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
          <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-400">{description}</p>
      {href && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
          Ver detalhes
          <ArrowUpRight className="h-3.5 w-3.5" />
        </p>
      )}
    </>
  );

  const className = 'portal-card p-6';

  if (!href) {
    return <article className={className}>{content}</article>;
  }

  return (
    <Link
      href={href}
      className={`${className} portal-card-interactive group`}
    >
      {content}
    </Link>
  );
}
