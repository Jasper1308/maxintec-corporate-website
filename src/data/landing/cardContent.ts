export interface Review {
    name: string;
    role: string;
    text: string;
    stars: number;
    image: string;
}

export const reviews: Review[] = [
    {
        name: "Celso Fernando",
        role: "Síndico",
        text: "Valorizo muito empresas comprometidas e profissionais no atendimento ao nosso condomínio. Fomos muito bem atendidos pela equipe da MaxlnTec, sempre atenciosos e com excelente execução do serviço. Parabéns, equipe nota 10!",
        stars: 5,
        image: "/celsoFernando.png"
    },
    {
        name: "Alexandre Stein",
        role: "Empresário",
        text: "Fiz uma reunião com eles e fiquei surpreso com o atendimento consultivo e, principalmente, ao perceber como minha visão sobre segurança e soluções era limitada. Em uma única reunião com a MaxInTec, encontraram soluções que eu nem imaginava. Recomendo que, antes de iniciar sua obra, faça uma visita/reunião com eles. Tenho certeza de que seu projeto vai subir de nível em várias áreas!",
        stars: 5,
        image: "/alexandreStein.png"
    },
    {
        name: "Leandro Pereira",
        role: "Síndico",
        text: "Maxintec é uma excelente empresa de Segurança e Automação, profissionais técnicos Roberto e João são muito competentes e organizados! Sou síndico 3 condomínios, sempre me atendem com excelência. Super indico essa empresa.",
        stars: 5,
        image: "/leandroPereira.png"
    },
];