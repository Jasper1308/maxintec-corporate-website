import SectionTag from './ui/SectionTag';
import WhatsAppButton from './ui/WhatsAppButton';
import SolutionImageCard from './ui/SolutionImageCard';
import { solutionsContent } from '../data/solutionContent';

type SoluctionsProps = {
  variant?: 'standard' | 'aspiration' | 'fire';
};

export default function Soluctions({ variant = 'standard' }: SoluctionsProps) {
  const solutions = solutionsContent[variant];

  return (
    <section className="py-20 px-4 bg-white flex flex-col items-center">
      
      <div className="text-center mb-16 max-w-4xl">
        <SectionTag
          text="Nossas Soluções"
          className="bg-slate-800 text-white"
        />
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#444] mb-6">
          Com a Maxintec é proteção completa para quem mais importa!
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-20 justify-items-center">
        {solutions.map((solution) => (
          <SolutionImageCard
            key={solution.title}
            image={solution.image}
            title={solution.title}
            description={solution.description}
          />
        ))}
      </div>

      <WhatsAppButton
        dataCtaLocation="solutions"
        className="bg-green-600 text-black border-green-600 hover:bg-green-500 shadow-green-900/20"
      />

    </section>
  );
}