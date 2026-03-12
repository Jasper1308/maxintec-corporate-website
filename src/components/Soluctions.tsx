import { Camera, Bell, UserCheck, DoorOpen, Clock, Smartphone } from 'lucide-react';
import SectionTag from './ui/SectionTag';
import SystemCard from './ui/SystemCard';
import WhatsAppButton from './ui/WhatsAppButton';
import { solutions } from '../data/solutionContent';

const iconMap = {
  camera: Camera,
  bell: Bell,
  userCheck: UserCheck,
  doorOpen: DoorOpen,
  clock: Clock,
  smartphone: Smartphone,
} as const;

export default function SolutionsSection() {
  return (
    <section className="py-20 px-4 bg-white flex flex-col items-center">
      
      <div className="text-center mb-16 max-w-4xl">
        <SectionTag
          text="Nossas Soluções"
          className="bg-slate-800 text-white"
        />
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#444] mb-6">
          Com a Maxintec é proteção completa para quem mais importa!
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-20 justify-items-center">
        {solutions.map((solution) => (
          <SystemCard
            key={solution.title}
            icon={iconMap[solution.icon]}
            title={solution.title}
            description={solution.description}
          />
        ))}
      </div>

      <WhatsAppButton className="bg-green-600 text-black border-green-600 hover:bg-green-500 shadow-green-900/20" />

   </section>
  );
}