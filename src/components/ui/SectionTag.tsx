type SectionTagProps = {
    text: string;
}

export default function SectionTag({
    text
}: SectionTagProps){
    return(
        <span className="inline-block mb-4 rounded-full border-2 border-white/60 px-5 py-2 text-[14px] font-bold uppercase tracking-widest text-white">
              {text}
        </span>
    )
}