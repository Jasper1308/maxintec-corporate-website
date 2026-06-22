export interface Condominio {
  id: string;
  name: string;
  blocks: string[]; // Blocos/Torres específicos de cada um
}

export const condominiosDisponiveis: Condominio[] = [
  { 
    id: 'cond-001', 
    name: 'Condomínio Jardim das Allamandas', 
    blocks: ['Torre A', 'Torre B'] 
  },
  { 
    id: 'cond-002', 
    name: 'Condomínio Nayara', 
    blocks: ['Torre Única'] 
  },
  { 
    id: 'cond-003', 
    name: 'Condomínio Porto Imperiale', 
    blocks: ['Torre Única'] 
  },
  { 
    id: 'cond-004', 
    name: 'Condomínio Texas Tower', 
    blocks: ['Torre Única'] 
  },
];