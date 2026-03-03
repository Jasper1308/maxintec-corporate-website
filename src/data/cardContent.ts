export interface Review {
    name: string;
    role: string;
    text: string;
    stars: number;
    image: string;
}

export const reviews: Review[] = [
    {
        name: "Felipe G.",
        role: "Síndico",
        text: "A portaria remota trouxe mais tranquilidade para os moradores. Antes gastávamos muito com portaria presencial e ainda tínhamos falhas. Agora temos segurança reforçada e um atendimento imediato sempre que precisamos.",
        stars: 5,
        image: "/felipeGImage.webp"
    },
    {
        name: "Guilherme F.",
        role: "Empresário",
        text: "Instalamos o sistema de controle de acesso facial da Maxintec na nossa empresa e foi um divisor de águas. Além de segurança, ganhamos agilidade no dia a dia. O atendimento foi rápido e muito profissional.",
        stars: 5,
        image: "/guilhermeFImage.webp"
    },
    {
        name: "Patrícia L.",
        role: "Residencial",
        text: "Atendimento rápido e eficiente. A instalação das câmeras foi feita no mesmo dia e o suporte sempre responde prontamente. Gostei muito da experiência.",
        stars: 5,
        image: "/patriciaLImage.webp"
    },
];