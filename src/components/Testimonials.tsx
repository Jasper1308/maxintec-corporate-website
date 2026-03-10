import FeedbackCard from "./ui/FeedbackCard";
import WhatsAppButton from "./ui/WhatsAppButton";
import { reviews } from "../data/cardContent";
import SectionTag from "./ui/SectionTag";

export default function TestimonialsSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center py-10 lg:py-20 text-center">

            <div className="absolute inset-0 -z-10">
                <img
                    src="cityBackground.jpg"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-800/15" />
            </div>

            <div className="mx-auto max-w-6xl">
                 <SectionTag text={"FEEDBACK CLIENTES"}/>

                <h2 className="text-white text-3xl md:text-5xl font-bold mb-12">
                    Quem confia na Maxintec, recomenda
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((rev) => (
                        <FeedbackCard key={rev.name} {...rev} />
                    ))}
                </div>

                <div className="mt-16 flex flex-wrap justify-center gap-4">
                    <WhatsAppButton className="border-white text-white bg-transparent hover:bg-white/10 shadow-blue-900/30" />
                </div>
            </div>
        </section>
    );
}