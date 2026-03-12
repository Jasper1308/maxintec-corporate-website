type SectionTagProps = {
  text: string;
  className?: string;
};

export default function SectionTag({ text, className = "" }: SectionTagProps) {
  return (
    <span
      className={`inline-block mb-4 rounded-full px-5 py-2 text-[14px] font-bold uppercase tracking-widest ${className}`}
    >
      {text}
    </span>
  );
}