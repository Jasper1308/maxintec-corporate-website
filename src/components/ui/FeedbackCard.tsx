type FeedbackCardProps = {
    name: string;
    role: string;
    stars: number;
    text: string;
    image: string;
}

export default function FeedbackCard({
    name,
    role,
    stars,
    text,
    image,
}: FeedbackCardProps) {
    return (
        <div className="bg-[#1e3a5f] rounded-[1rem] p-8 flex flex-col items-center shadow-2xl">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4">
                <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-white font-bold text-xl">{name}</h3>
            <p className="text-gray-300 text-sm mb-2">{role}</p>
            <div className="flex gap-1 mb-4">
                {[...Array(stars)].map((_, s) => (
                    <span key={s} className="text-yellow-400 text-xl">★</span>
                ))}
            </div>
            <p className="text-gray-200 text-sm leading-relaxed italic">
                "{text}"
            </p>
        </div>
    )
}