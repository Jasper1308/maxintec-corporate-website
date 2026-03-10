export type SolutionIconKey =
  | 'camera'
  | 'bell'
  | 'userCheck'
  | 'doorOpen'
  | 'clock'
  | 'smartphone';

export interface Solution {
  icon: SolutionIconKey;
  title: string;
  description: string;
}

export const solutions: Solution[] = [
  {
    icon: 'camera',
    title: 'Câmeras Inteligentes',
    description: 'Alta definição e acesso remoto',
  },
  {
    icon: 'bell',
    title: 'Alarmes monitorados',
    description: 'Resposta rápida 24h',
  },
  {
    icon: 'userCheck',
    title: 'Controle de acesso facial',
    description: 'Praticidade e máxima segurança',
  },
  {
    icon: 'doorOpen',
    title: 'Portaria autônoma/remota',
    description: 'Gestão eficiente e redução de custos',
  },
  {
    icon: 'clock',
    title: 'Monitoramento 24 horas',
    description: 'Equipe dedicada',
  },
  {
    icon: 'smartphone',
    title: 'Integração via app',
    description: 'Seu patrimônio na palma da mão',
  },
];

