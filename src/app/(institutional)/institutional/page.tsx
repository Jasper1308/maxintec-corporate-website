import Link from "next/link";
import Image from "next/image";
import ImageCarousel from "@/components/ui/ImageCarousel";
import Footer from "@/components/ui/Footer";
import { institutionalHomeContent } from "@/data/institutionalContent";
import { responsiveHeadings } from "@/data/typographyScale";

export default function InstitutionalPage() {
  const content = institutionalHomeContent;

  return (
    <main className="bg-slate-950 text-white relative">
      
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-60"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000')" 
          }} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-slate-950/30" />
        
        <div className="relative z-10 text-center space-y-6 px-6 max-w-4xl">
          <span className="inline-flex rounded-full border border-blue-500/40 bg-slate-950/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-blue-400 backdrop-blur-sm">
            {content.hero.pretitle}
          </span>
          
          <div className="relative inline-block px-8 py-6 md:px-16 md:py-8 my-4 bg-slate-950/40 backdrop-blur-xs rounded-xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500" />
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wider text-white uppercase leading-tight drop-shadow-xl">
              Sua Segurança é nossa prioridade
            </h1>
          </div>
          
          <p className="text-white text-lg md:text-xl font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            {content.hero.subtitle}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-center pt-4">
            <Link
              href={content.hero.ctaPrimaryHref}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/30"
            >
              {content.hero.ctaPrimary}
            </Link>
            <Link
              href={content.hero.ctaSecondaryHref}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-slate-950/60 px-8 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-slate-900/60 backdrop-blur-sm"
            >
              {content.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-20 bg-slate-950 border-t border-white/5">
        
        <section className="container mx-auto px-6 lg:px-10 py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.highlights.map((item) => (
              <div key={item.title} className="space-y-3 rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {content.featuredLogos && content.featuredLogos.length > 0 && (
          <section className="container mx-auto px-6 lg:px-10 pb-20">
            <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-8 lg:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                  Grandes marcas que confiam em nossa engenharia
                </p>
                <Link 
                  href="/clientes" 
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider shrink-0"
                >
                  Ver todos os clientes atendidos &rarr;
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
                {content.featuredLogos.map((logo, idx) => (
                  <div key={idx} className="relative w-full h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center group">
                    <Image 
                      src={logo.src} 
                      alt={logo.alt || "Cliente MaxInTec"} 
                      fill 
                      className="object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container mx-auto px-6 lg:px-10 py-12">
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

        {content.featuredVideos && content.featuredVideos.length > 0 && (
          <section className="container mx-auto px-6 lg:px-10 py-20 space-y-10">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Sucesso na Prática</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">Depoimentos e Operações Reais</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {content.featuredVideos.map((videoId, index) => (
                <div key={index} className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-lg shadow-slate-950/50 aspect-video w-full relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={`Depoimento MaxInTec ${index + 1}`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="container mx-auto px-6 lg:px-10 py-20">
          <div className="grid gap-10 lg:grid-cols-3">
            {content.stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 text-center shadow-xl shadow-slate-950/20">
                <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="mt-3 text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/30 border-y border-white/5 py-20">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-2">
              {content.sections.map((section) => (
                <div key={section.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/10">
                  <h2 className="mb-6 text-2xl font-semibold text-white">{section.title}</h2>
                  <ul className="space-y-4 text-slate-300 text-sm">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />
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
                <p className="mt-5 max-w-2xl text-slate-300 text-sm md:text-base leading-relaxed">
                  Nossa proposta é unir tecnologia de ponta e operation consistente para entregar um sistema de segurança que seja confiável, simples de usar e preparado para crescimento.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-200 border border-white/5">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Performance</p>
                  <p className="mt-4 text-base font-semibold">Resposta rápida e visibilidade total.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-200 border border-white/5">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Confiabilidade</p>
                  <p className="mt-4 text-base font-semibold">Projetos testados e homologados.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

    </main>
  );
}