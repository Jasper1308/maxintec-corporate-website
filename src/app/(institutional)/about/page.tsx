import { institutionalAboutContent } from "@/data/institutionalContent";
import { responsiveHeadings } from "@/data/typographyScale";

export default function AboutPage() {
  const content = institutionalAboutContent;

  return (
    <main className="bg-slate-950 text-white">
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_35%),_linear-gradient(180deg,_rgb(15_23_42)_0%,_rgb(15_23_42)_100%)] py-20">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6 max-w-2xl">
              <p className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-blue-300">
                Visão Corporativa
              </p>
              <h1 className={`${responsiveHeadings.h1} text-white`}>{content.hero.title}</h1>
              <p className="max-w-3xl text-slate-300 text-lg leading-8">{content.hero.subtitle}</p>
              <p className="max-w-3xl text-slate-400 leading-7">{content.hero.description}</p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
              <div className="space-y-6">
                {content.pillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-3xl bg-slate-950/90 p-6">
                    <h2 className="text-xl font-semibold text-white">{pillar.title}</h2>
                    <p className="mt-3 text-slate-300 leading-7">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-white">{content.mission.title}</h2>
            <p className="mt-5 text-slate-300 leading-8">{content.mission.description}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-white">Nossos valores</h2>
            <div className="mt-6 space-y-4 text-slate-300">
              {content.values.map((value) => (
                <div key={value} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-blue-500" />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/80 py-20">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 to-blue-950/80 p-10 shadow-2xl shadow-blue-950/30">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Diferenciais</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Nossa abordagem tecnológica e humana</h2>
            <p className="mt-5 max-w-3xl text-slate-300 leading-8">
              Cada projeto da Maxintec nasce da união entre análise técnica, engenharia certificada e uma entrega pensada para a experiência do usuário final.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {content.values.map((value) => (
                <div key={value} className="rounded-3xl bg-slate-900/90 p-6 text-slate-200">
                  <p className="font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
