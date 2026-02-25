type LandingProps = {
    title: string
    subtitle: string
    description: string
    image: string
}

export default function LandingPageTemplate({
    title,
    subtitle,
    description,
    image
}: LandingProps) {
    return (
        <section className="relative h-screen w-full overflow-hidden">

            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/videos/bg.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 mt-10 px-50">
                <img
                    src="/maxinteclogo.webp"
                    alt="Error"
                    className="h-12 w-auto"
                />
                <div className="flex">
                    <div>
                        <div className="mt-25 mb-10 border-1 border-white rounded-[4rem] p-4 inline-block">
                            <h1 className="text-white text-base font-bold">{title}</h1>
                        </div>
                        <h2 className="whitespace-pre-line text-white mb-5 text-2xl font-bold">{subtitle}</h2>
                        <p className="whitespace-pre-line text-white">{description}</p>
                        <div className="mt-5 border-1 border-white rounded-[2rem] p-3 inline-block bg-green-600 hover:bg-green-700 transition duration-200 cursor-pointer hover:scale-115">
                            <a href="https://web.whatsapp.com/send/?phone=554733390678&text&type=phone_number&app_absent=0" className="flex text-black text-xs font-bold gap-1">
                                <img src="whatsapp.png" alt="Whatsapp" className="h-4" />
                                FALE AGORA
                            </a>
                        </div>
                    </div>
                    <div>
                        <img
                            src={image}
                            alt="ERROR"
                            className="h-100 ml-20 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}