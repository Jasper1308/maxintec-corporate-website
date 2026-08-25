import type { ReactNode } from 'react';

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{description && <p className="mt-2 text-slate-400">{description}</p>}</div>{action}</div>;
}
