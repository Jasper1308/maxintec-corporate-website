import { LucideIcon } from 'lucide-react';

type SystemCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function SystemCard({
  icon: Icon,
  title,
  description
}: SystemCardProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 w-full max-w-[350px] min-h-[280px] text-center group">
      
      {/* Círculo do Ícone */}
      <div className="w-16 h-16 bg-[#16569B] rounded-full flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
        <Icon className="text-white w-8 h-8" />
      </div>

      {/* Título */}
      <h3 className="text-[#333] text-xl font-bold mb-3 tracking-tight">
        {title}
      </h3>

      {/* Descrição */}
      <p className="text-gray-500 text-[15px] leading-relaxed">
        {description}
      </p>
      
    </div>
  )
}