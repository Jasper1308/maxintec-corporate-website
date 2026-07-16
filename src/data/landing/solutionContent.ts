export const solutionsContent = {
  standard: [
    {
      title: 'Central de Monitoramento',
      image: '/monitoramento.webp',
      description: 'Monitoramento 24h com resposta imediata.',
    },
    {
      title: 'Alarme de Incêndio',
      image: '/incendio.jpg',
      description: 'Sistema inteligente para detecção e resposta rápida a incêndios.',
    },
    {
      title: 'Automação',
      image: '/automacao.webp',
      description: 'Controle automatizado para mais segurança e praticidade no dia a dia.',
    },
  ],

  aspiration: [
    {
      title: 'Automação Residencial',
      image: '/automacao.webp',
      description: 'Controle completo da sua casa pelo celular com conforto e sofisticação.',
    },
    {
      title: 'CFTV',
      image: '/cftv.jpg',
      description: 'Monitoramento com design discreto e tecnologia de ponta.',
    },
    {
      title: 'Alarme de Incêndio',
      image: '/incendio.jpg',
      description: 'Proteção eficiente integrada ao seu ambiente.',
    },
  ],

  fire: [
    {
      title: 'Sistema de Desenfumagem',
      image: '/desenfumagem.jpg',
      description: 'Tecnologia de ponta para controle de fumaça, projetada para proteger seu edifício e cumprir as normas de segurança contra incêndios.',
    },
    {
      title: 'Alarme de Incêndio',
      image: '/incendio.jpg',
      description: 'Identifique focos de incêndio antes que se tornem tragédias. Nossas soluções são inteligentes, 100% confiáveis e sob medida para o seu negócio.',
    },
    {
      title: 'Iluminação de Emergência',
      image: '/iluminacaoemergencia.jpg',
      description: 'Acionamento automático imediato, máxima autonomia e total conformidade com as normas do Corpo de Bombeiros. Ideal para indústrias, condomínios e comércios.',
    },
  ],
} as const;

export type SolutionVariant = keyof typeof solutionsContent;