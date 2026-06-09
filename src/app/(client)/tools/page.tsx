'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const tools = [
  {
    id: 'condominio-registration',
    title: 'Cadastro de Condomínio',
    description: 'Realize o cadastro de seus dados de condomínio e documentação necessária',
    icon: '🏢',
    href: '/tools/condominio-registration',
  },
];

export default function ToolsPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Sair
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group bg-slate-800/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 hover:bg-slate-800/80 transition backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                {tool.title}
              </h2>
              <p className="text-slate-400 text-sm">{tool.description}</p>
              <div className="mt-4 inline-block text-blue-400 group-hover:translate-x-1 transition">
                Acessar →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
