import WhatsAppButton from "./ui/WhatsAppButton";
import SectionTag from "./ui/SectionTag";

type HeroProps = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

export default function HeroSection({
  title,
  subtitle,
  description,
  image
}: HeroProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center py-10 lg:py-20">
      
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          poster="/videos/bg-poster.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/videos/bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-blue-800/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-12 w-full">
        
        <div className="mb-8 flex justify-center lg:justify-start">
          <img
            src="/maxinteclogo.webp"
            alt="Maxintec soluções em segurança eletrônica"
            className="h-10 w-auto md:h-12"
          />
        </div>

        <div className="grid grid-cols-1 items-center gap-32 lg:grid-cols-2">

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

            <SectionTag
              text={title}
              className="border-2 border-white/60 text-white"
            />
            
            <h1 className="mb-4 text-2xl font-bold leading-[1.2] text-white sm:text-3xl lg:text-3xl max-w-[40ch] lg:max-w-none">
              {subtitle}
            </h1>

            <p className="mb-8 text-base text-gray-200 md:text-lg max-w-[45ch] leading-relaxed">
              {description}
            </p>

            <WhatsAppButton className="bg-green-600 text-black border-green-600 hover:bg-green-500 shadow-green-900/20" />
          </div>

          <div className="hidden lg:flex justify-center lg:justify-end">
            <img
              src={image}
              alt="Ilustração representando segurança eletrônica inteligente"
              className="w-full max-w-md lg:max-w-xl object-contain drop-shadow-2xl [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
            />
          </div>

        </div>
      </div>
    </section>
  );
}