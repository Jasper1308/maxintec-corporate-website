type SolutionImageCardProps = {
  image: string;
  title: string;
  description?: string;
  onClick?: () => void;
};

export default function SolutionImageCard({
  image,
  title,
  description,
  onClick,
}: SolutionImageCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative w-full max-w-[350px] h-[280px] rounded-2xl overflow-hidden cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all duration-500" />

      <div className="relative z-10 h-full p-6 text-white flex items-end">

        <div className="relative w-full">

          <h3 className="text-xl font-bold transition-all duration-500 group-hover:-translate-y-6">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-white/80 mt-2
              opacity-0 max-h-0
              overflow-hidden
              group-hover:opacity-100 group-hover:max-h-20
              transition-all duration-500">
              {description}
            </p>
          )}

        </div>

      </div>
    </div>
  );
}