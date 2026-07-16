import FeedbackCard from "../ui/FeedbackCard";
import WhatsAppButton from "../ui/WhatsAppButton";
import { reviews } from "../../data/landing/cardContent";
import SectionTag from "../ui/SectionTag";

export default function TestimonialsSection() {
    return (
        <section className="relative z-10 w-full min-h-screen flex flex-col justify-center py-10 lg:py-20 text-center bg-zinc-950">
            <div className="absolute inset-0 -z-10 w-full h-full">
                <img
                    src="cityBackground.webp"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-800/15" />
            </div>

            <div className="mx-auto max-w-6xl px-6 w-full relative z-20">
                 <SectionTag
                    text="FEEDBACK CLIENTES"
                    className="bg-white text-[#16569B] shadow-md"
                 />

                <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-12">
                    Quem confia na Maxintec, recomenda
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center w-full">
                    {reviews.map((rev) => (
                        <FeedbackCard key={rev.name} {...rev} />
                    ))}
                </div>

                <div className="mt-16 flex flex-wrap justify-center gap-6 w-full">
                    <WhatsAppButton
                        size="lg"
                        dataCtaLocation="testimonials"
                        className="border-white text-black bg-green-600 hover:bg-green-500 shadow-green-900/20"
                    />
                </div>
            </div>
        </section>
    );
}