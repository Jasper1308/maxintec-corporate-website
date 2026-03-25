export const solutionsContent = {
  standard: [
    {
      title: 'Central de Monitoramento',
      image: '/monitoramento.jpg',
      description: 'Monitoramento 24h com resposta imediata.',
    },
    {
      title: 'Alarme de Incêndio',
      image: '/incendio.jpg',
      description: 'Sistema inteligente para detecção e resposta rápida a incêndios.',
    },
    {
      title: 'Automação',
      image: '/automacao.jpg',
      description: 'Controle automatizado para mais segurança e praticidade no dia a dia.',
    },
  ],

  aspiration: [
    {
      title: 'Automação Residencial',
      image: '/automacao.jpg',
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
      description: 'Proteção eficiente integrada ao seu ambiente residencial premium.',
    },
  ],

  fire: [
    {
      title: 'Câmeras de Alta Resolução',
      image: '/cftv.jpg',
      description: 'Imagens precisas para monitoramento de áreas críticas e preventivas.',
    },
    {
      title: 'Automação via Celular',
      image: '/automacao.jpg',
      description: 'Gerenciamento remoto de sistemas de segurança e prevenção.',
    },
    {
      title: 'Central de Monitoramento',
      image: '/monitoramento.jpg',
      description: 'Controle em tempo real para resposta rápida a emergências.',
    },
  ],
} as const;

export type SolutionVariant = keyof typeof solutionsContent;