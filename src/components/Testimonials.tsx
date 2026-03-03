import Card from "./ui/Card";
import WhatsAppButton from "./ui/WhatsAppButton";
import { reviews } from "../data/cardContent";

export default function TestimonialsSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center py-10 lg:py-20 text-center">

            <div className="absolute inset-0 -z-10">
                <img src="cityBackground.jpg" alt="" />
                <div className="absolute inset-0 bg-black/75" />
            </div>

            <div className="mx-auto max-w-6xl">
                {/* Badge superior */}
                <div className="inline-block bg-white text-[#0077b6] font-bold px-6 py-2 rounded-full mb-8 shadow-md">
                    FEEDBACK CLIENTES
                </div>

                <h2 className="text-white text-3xl md:text-5xl font-bold mb-12">
                    Quem confia na Maxintec, recomenda
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((rev, i) => (
                        <Card key={i} {...rev} />
                    ))}
                </div>

                {/* Buttons */}
                <div className="mt-16 flex flex-wrap justify-center gap-4">
                    <WhatsAppButton />
                </div>
            </div>
        </section>
    );
}