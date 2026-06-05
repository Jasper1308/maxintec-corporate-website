import Link from "next/link";
import ImageCarousel from "@/components/ui/ImageCarousel";
import { institutionalHomeContent } from "@/data/institutionalContent";
import { responsiveHeadings } from "@/data/typographyScale";

export default function InstitutionalPage() {
  const content = institutionalHomeContent;

  return (
    <main className="bg-slate-950 text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 py-24 sm:py-28">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6 max-w-2xl">
              <span className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.28em] text-blue-300">
                {content.hero.pretitle}
              </span>
              <h1 className={`${responsiveHeadings.h1} text-white`}>{content.hero.headline}</h1>
              <p className="max-w-3xl text-slate-300 text-lg leading-8">
                {content.hero.subtitle}
              </p>
              <p className="max-w-3xl text-slate-400 leading-7">
                {content.hero.description}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={content.hero.ctaPrimaryHref}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  {content.hero.ctaPrimary}
                </Link>
                <Link
                  href={content.hero.ctaSecondaryHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/10"
                >
                  {content.hero.ctaSecondary}
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
              <div className="space-y-8">
                {content.highlights.map((item) => (
                  <div key={item.title} className="space-y-3 rounded-3xl border border-white/5 bg-white/5 p-6">
                    <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                    <p className="text-slate-300 leading-7">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-20">
        <div className="space-y-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-blue-300">
              Projetos em destaque
            </p>
            <h2 className="mt-6 text-3xl font-bold text-white">Galeria de soluções corporativas</h2>
            <p className="mt-4 text-slate-300 leading-7">
              Imagens de instalações projetadas para segurança, automação e operação contínua.
            </p>
          </div>

          <ImageCarousel images={content.carouselImages} />
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          {content.stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-7 text-center shadow-xl shadow-slate-950/20">
              <p className="text-4xl font-extrabold text-white">{stat.value}</p>
              <p className="mt-3 text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/80 py-20">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2">
            {content.sections.map((section) => (
              <div key={section.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/10">
                <h2 className="mb-6 text-2xl font-semibold text-white">{section.title}</h2>
                <ul className="space-y-4 text-slate-300">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 to-blue-950/80 p-10 shadow-2xl shadow-blue-950/30">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Somos parceiros estratégicos</p>
              <h2 className="mt-4 text-3xl font-bold text-white">Transformamos seu espaço em um ambiente tecnológico e seguro</h2>
              <p className="mt-5 max-w-2xl text-slate-300 leading-8">
                Nossa proposta é unir tecnologia de ponta e operação consistente para entregar um sistema de segurança que seja confiável, simples de usar e preparado para crescimento.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-200">
                <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Performance</p>
                <p className="mt-4 text-lg font-semibold">Resposta rápida e visibilidade total.</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-200">
                <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Confiabilidade</p>
                <p className="mt-4 text-lg font-semibold">Projetos testados e homologados.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
