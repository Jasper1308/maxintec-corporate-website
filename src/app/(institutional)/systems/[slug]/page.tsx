import { notFound } from "next/navigation";
import Link from "next/link";
import { systemContent } from "@/data/systemContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SistemaDynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const system = systemContent[slug];

  if (!system) {
    notFound();
  }

  return (
    <main className="bg-slate-950 text-white min-h-screen">
      
      <section className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden border-b border-blue-900/20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url(${system.heroImage || '/images/fallback-system.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-blue-950/30" />
        <div className="absolute inset-0 bg-slate-950/30" />

        <div className="relative z-10 text-center space-y-5 px-6 max-w-4xl">
          <span className="inline-flex rounded-full border border-blue-500/40 bg-slate-950/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-blue-400 backdrop-blur-sm">
            {system.pretitle}
          </span>
          
          <div className="relative inline-block px-8 py-6 md:px-16 md:py-8 my-4 bg-slate-950/40 backdrop-blur-xs rounded-xl">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500" />
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wider text-white uppercase drop-shadow-md">
              {system.title}
            </h1>
          </div>
          
          <p className="text-white text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            {system.subtitle}
          </p>
        </div>
      </section>

      {system.ecossistema && system.ecossistema.length > 0 && (
        <section className="container mx-auto px-6 lg:px-10 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Arquitetura de Conectividade</p>
            <h2 className="text-2xl md:text-3xl font-bold">Como funciona a engenharia do system</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-4 relative">
            {system.ecossistema.map((step: any, index: number) => (
              <div key={index} className="relative rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{step.Passo}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {system.equipamentos && system.equipamentos.length > 0 && (
        <section className="bg-slate-900/40 border-y border-white/5 py-20">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="max-w-2xl mb-12 space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Componentes Homologados</p>
              <h2 className="text-2xl md:text-3xl font-bold">Equipamentos e Tecnologia Utilizada</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {system.equipamentos.map((equip: any, index: number) => (
                <div 
                  key={index} 
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/20 group"
                >
                  <div className="h-1.5 w-12 rounded-full bg-blue-600 mb-6 transition-all group-hover:w-20" />
                  <h3 className="text-lg font-semibold text-white mb-2">{equip.nome}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{equip.detalhe}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-6 lg:px-10 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white tracking-wide">Padrões Operacionais</h3>
            {system.specs && system.specs.length > 0 ? (
              <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate-900/20">
                {system.specs.map((spec: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 p-4 text-sm border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <span className="font-semibold text-slate-300">{spec.label}</span>
                    <span className="text-slate-400 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Especificações e padrões técnicos sob consulta de projeto.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-blue-950/50 p-8 md:p-10 text-center lg:text-left space-y-6 shadow-2xl shadow-blue-950/40">
            <h3 className="text-2xl font-bold text-white">Precisa de Engenharia Especializada para este Sistema?</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Desenhamos soluções sob medida adequadas à infraestrutura do seu condomínio ou planta industrial, garantindo suporte preventivo ativo e certificações.
            </p>
            <div className="pt-2">
              <Link 
                href="#contact" 
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/10"
              >
                Solicitar Estudo de Viabilidade
              </Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}