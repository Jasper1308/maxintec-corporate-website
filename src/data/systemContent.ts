export interface SystemSchema {
  title: string;
  subtitle: string;
  heroImage: string;
  pretitle: string;
  ecossistema: { Passo: string; desc: string }[];
  equipamentos: { nome: string; detalhe: string }[];
  specs: { label: string; value: string }[];
}

export const systemContent: Record<string, SystemSchema> = {
  "cftv": {
    title: "CFTV Inteligente",
    pretitle: "Monitoramento Avançado",
    subtitle: "Sistemas de vídeo monitoramento IP com análise inteligente de vídeo e gravação centralizada de alta disponibilidade.",
    heroImage: "/images/sistemas/cftv.jpg",
    ecossistema: [
      { Passo: "Captação IP", desc: "Câmeras de alta resolução com detecção térmica e analíticos de linha virtual." },
      { Passo: "Transmissão", desc: "Cabeamento estruturado blindado Cat6 ou Fibra Óptica dedicada." },
      { Passo: "Processamento", desc: "NVRs de alta capacidade com inteligência artificial para reconhecimento facial." },
      { Passo: "Gestão / Central", desc: "Monitoramento em tempo real unificado via VMS e alertas integrados." }
    ],
    equipamentos: [
      { nome: "Câmeras Speed Dome IP", detalhe: "Zoom óptico avançado e rastreamento automático de alvos." },
      { nome: "NVRs Corporativos", detalhe: "Redundância de gravação RAID para proteção total dos dados." },
      { nome: "Analíticos de IA", detalhe: "Leitura de placas (LPR) e contagem de pessoas integrada." }
    ],
    specs: [
      { label: "Resolução Suportada", value: "Até 4K / Ultra HD" },
      { label: "Monitoramento Ativo", value: "Integração via protocolo ONVIF / RTSP" },
      { label: "Armazenamento", value: "Redundância Hot-Swap" }
    ]
  },
  "controle-de-acesso": {
    title: "Controle de Acesso",
    pretitle: "Alta Segurança",
    subtitle: "Gerenciamento inteligente de fluxo de pedestres e veículos com autenticação rápida e relatórios em tempo real.",
    heroImage: "/images/sistemas/acesso.jpg",
    ecossistema: [
      { Passo: "Identificação", desc: "Leitores biométricos, reconhecimento facial ou tags RFID de alta segurança." },
      { Passo: "Validação", desc: "Controladoras processam as permissões e regras de horários na hora." },
      { Passo: "Bloqueio Físico", desc: "Liberação de catracas flautadas, portas eletroímãs ou cancelas." },
      { Passo: "Auditoria", desc: "Registro instantâneo no banco de dados e disparo de logs para a gestão." }
    ],
    equipamentos: [
      { nome: "Leitores Faciais 3D", detalhe: "Autenticação em menos de 0.2 segundos com detecção de vivacidade." },
      { nome: "Controladoras de Porta IP", detalhe: "Operação autônoma mesmo com queda de conexão de rede." },
      { nome: "Eletroímãs de Alta Carga", detalhe: "Força de retenção magnética superior a 300kg por folha." }
    ],
    specs: [
      { label: "Capacidade de Usuários", value: "Ilimitado via Software Central" },
      { label: "Protocolo de Comunicação", value: "OSDP / Wiegand Criptografado" },
      { label: "Autonomia da Bateria", value: "Até 12 horas em modo no-break" }
    ]
  },
  "alarme-de-intrusao": {
    title: "Alarme de Intrusão",
    pretitle: "Proteção Perimetral",
    subtitle: "Sistemas de detecção de invasão microprocessados de alta confiabilidade contra falsos disparos.",
    heroImage: "/images/sistemas/intrusao.jpg",
    ecossistema: [
      { Passo: "Detecção", desc: "Sensores de movimento de dupla tecnologia varrem o ambiente continuamente." },
      { Passo: "Análise", desc: "A central processa os sinais eliminando ruídos ambientais ou pequenos animais." },
      { Passo: "Notificação", desc: "Disparo automático de sirenes locais de alta potência acústica." },
      { Passo: "Transmissão Remota", desc: "Envio imediato via redundância IP/GPRS para a central de monitoramento." }
    ],
    equipamentos: [
      { nome: "Sensores IVP Dupla Tecnologia", detalhe: "Infravermelho combinado com micro-ondas imune a pets." },
      { nome: "Centrais Modulares Bus", detalhe: "Supervisão total de fiação contra sabotagem e corte de cabos." },
      { nome: "Teclados Touchscreen", detalhe: "Interface amigável para ativação por partições do edifício." }
    ],
    specs: [
      { label: "Zonas de Monitoramento", value: "Expansível até 128 zonas" },
      { label: "Vias de Comunicação", value: "Ethernet, Wi-Fi e Celular 4G/GPRS" },
      { label: "Homologação", value: "Grau de Segurança ANATEL / CE" }
    ]
  },
  // Slugs pré-mapeados para você preencher os textos específicos depois
  "video-porteiro": { title: "Vídeo Porteiro IP", pretitle: "Comunicação Residencial", subtitle: "Interfonia de vídeo modular conectada diretamente ao seu smartphone ou central predial.", heroImage: "/images/sistemas/interfonia.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "automacao-de-portas-e-portoes": { title: "Automação de Portas e Portões", pretitle: "Acesso Veicular Rápido", subtitle: "Motores e automatizadores de alta velocidade e ciclo contínuo para condomínios e indústrias.", heroImage: "/images/sistemas/motores.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "cerca-eletrica": { title: "Cerca Elétrica Industrial", pretitle: "Segurança Perimetral", subtitle: "Eletrificadores de alta potência com monitoramento de corte e aterramento supervisionado.", heroImage: "/images/sistemas/cerca.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "alarme-de-incendio": { title: "Sistemas de Alarme de Incêndio", pretitle: "Proteção à Vida", subtitle: "Centrais endereçáveis de detecção de fumaça e calor em conformidade estrita com as normas técnicas.", heroImage: "/images/sistemas/incendio.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "iluminacao-de-emergencia": { title: "Iluminação de Emergência", pretitle: "Segurança em Evacuação", subtitle: "Sistemas centralizados por bloco de baterias ou gerador para rotas de fuga seguras.", heroImage: "/images/sistemas/emergencia.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "internet-predial-e-redes": { title: "Internet Predial & Redes Corporativas", pretitle: "Conectividade de Alta Performance", subtitle: "Projetos de cabeamento estruturado Cat6/Cat6A, fibra óptica interna e redes Wi-Fi empresariais.", heroImage: "/images/sistemas/redes.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "automacao-predial": { title: "Automação Predial", pretitle: "Gestão Eficiente", subtitle: "Controle integrado de utilidades, iluminação, bombas de água e consumo de energia do edifício.", heroImage: "/images/sistemas/automacao-predial.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "aspiracao-central": { title: "Aspiração Central", pretitle: "Conforto & Higiene", subtitle: "Infraestrutura de tubulação embutida com tomadas de sucção integradas a uma central de vácuo.", heroImage: "/images/sistemas/aspiracao.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "piso-aquecido": { title: "Piso Aquecido", pretitle: "Climatização Invisível", subtitle: "Sistemas de calefação por piso radiante elétrico ou hidráulico para máximo conforto térmico.", heroImage: "/images/sistemas/piso.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "sonorizacao": { title: "Sonorização Comercial & Predial", pretitle: "Sistemas de Áudio", subtitle: "Áudio ambiente setorizado e sistemas de evacuação por voz para chamadas e avisos.", heroImage: "/images/sistemas/som.jpg", ecossistema: [], equipamentos: [], specs: [] },
  "carregamento-veicular": { title: "Carregamento Veicular", pretitle: "Eletromobilidade", subtitle: "Estações de recarga inteligentes para veículos elétricos com rateio de consumo por apartamento.", heroImage: "/images/sistemas/carregador.jpg", ecossistema: [], equipamentos: [], specs: [] },
};