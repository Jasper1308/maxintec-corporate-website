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
        <section className="relative min-h-screen overflow-hidden py-16">

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

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 ">
                <img
                    src="/maxinteclogo.webp"
                    alt="Error"
                    className="h-12 w-auto max-lg:mx-auto"
                />
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-16 lg:gap-16">
                    <div >
                        <div className="mt-25 mb-10 border-1 border-white rounded-[4rem] p-4 inline-block max-lg:w-full max-lg:text-center">
                            <h1 className="text-white text-base font-bold">{title}</h1>
                        </div>
                        <h2 className="whitespace-pre-line text-white mb-6 font-bold leading-tight
                                        text-[clamp(1.8rem,3vw,2rem)]
                                        max-lg:text-center">{subtitle}</h2>
                        <p className="whitespace-pre-line text-white max-lg:w-full max-lg:text-center text-[clamp(0.5rem,3.5vw,1rem)]">{description}</p>
                        <div className="mt-5 border border-white rounded-[2rem] p-3 inline-block 
                                      bg-green-600 hover:bg-green-700 transition duration-200 
                                        cursor-pointer hover:scale-115 flex-1 flex justify-center
                                        max-lg:w-full max-lg:text-center">

                            <a
                                href="https://web.whatsapp.com/send/?phone=554733390678&text&type=phone_number&app_absent=0"
                                className="flex text-black text-xs font-bold gap-1 max-lg:justify-center max-lg:text-base max-lg:py-4"
                            >
                                <img src="whatsapp.png" alt="Whatsapp" className="h-4 max-lg:h-5" />
                                FALE AGORA
                            </a>

                        </div>
                    </div>
                    <div>
                        <img
                            src={image}
                            alt="ERROR"
                            className="mt-15 hidden lg:block w-[clamp(360px,50vw,650px)] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}