"use client";

import Link from "next/link";
import { headerNavigation } from "@/data/headerContent"; 
// Dica: Se preferir, pode criar o @/data/footerContent específico e importar dele.
// Aqui estou reaproveitando a logo e itens estruturais do headerContent fornecido.

export default function Footer() {
  const { logo, navItems, solutions, buttons } = headerNavigation;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-blue-900/40 text-slate-400">
      {/* Seção Principal do Footer */}
      <div className="container mx-auto px-6 lg:px-10 py-16">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          
          {/* Coluna 1: Branding e Descrição Breve */}
          <div className="space-y-6">
            <Link href="/institutional" className="inline-block">
              <img
                src={logo}
                alt="Maxintec"
                className="h-9 w-auto object-contain xl:h-11 brightness-110"
              />
            </Link>
            <p className="text-sm leading-6 text-slate-400">
              Soluções inteligentes em automação e infraestrutura de segurança para indústrias, empresas e condomínios de alta performance.
            </p>
          </div>

          {/* Coluna 2: Navegação Institucional */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Institucional
            </h3>
            <ul className="space-y-3 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Soluções e Serviços */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {solutions.label}
            </h3>
            <ul className="space-y-3 text-sm">
              {solutions.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Suporte e Contato Rápido */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Área de Atendimento
            </h3>
            <p className="text-sm leading-6 text-slate-400">
              Precisa de manutenção, suporte técnico ou quer iniciar um novo projeto do zero?
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={buttons.clientArea.href}
                className="inline-flex items-center gap-2 justify-center rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {buttons.clientArea.label}
              </Link>
              <Link
                href={buttons.requestProject.href}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/10"
              >
                {buttons.requestProject.label}
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Linha Inferior: Copyright & Termos */}
      <div className="border-t border-blue-950 bg-slate-950/40">
        <div className="container mx-auto px-6 lg:px-10 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <p>
            &copy; {currentYear} Maxintec Tecnologia. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Políticas de Privacidade
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}