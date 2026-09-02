export interface ProposalItem {
  id: string;
  name: string;
  description: string;
  qty: number;
  price: number;
}

export interface ProposalData {
  proposalNumber: string;
  validity: number;
  issueDate: string;
  seller: string;
  sellerPhone?: string;
  sellerEmail?: string;
  
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;

  items: ProposalItem[];

  paymentTerms: string;
  deliveryTime: string;
  warranty: string;
  notes: string;

  logoUrl?: string;
  logoType?: 'custom' | 'default';
  showCompanyWatermark?: boolean;

  layoutMode?: 'standard' | 'compact';
  customFooterText?: string;
  customCoverFooter?: string;
}

export const INITIAL_PROPOSAL_DATA: ProposalData = {
  proposalNumber: 'CR-2026-001',
  validity: 7,
  issueDate: new Date().toISOString().slice(0, 10),
  seller: 'Carlos Eduardo Mendes',
  sellerPhone: '(11) 98765-4321',
  sellerEmail: 'contato@ciavolt.com.br',

  layoutMode: 'standard',
  customFooterText: 'CIAVOLT ENERGIA SOLAR',
  customCoverFooter: 'CONFIANÇA QUE MOVE NEGÓCIOS • CIAVOLT ENERGIA SOLAR',

  clientName: 'Fazenda & Indústria Solar LTDA',
  clientDocument: '12.345.678/0001-90',
  clientPhone: '(19) 99888-7766',
  clientEmail: 'comercial@fazendasolar.com.br',
  clientAddress: 'Rodovia dos Bandeirantes, Km 82, Campinas - SP',

  items: [
    {
      id: '1',
      name: 'Módulos Fotovoltaicos Monocristalinos 550W',
      description: 'Painéis solares Tier 1 de alta eficiência com tecnologia PERC Half-Cell e vidro antirreflexo.',
      qty: 24,
      price: 680.00
    },
    {
      id: '2',
      name: 'Inversor Solar On-Grid Trifásico 12kW',
      description: 'Inversor inteligente com duplo MPPT, monitoramento Wi-Fi integrado e eficiência de 98.6%.',
      qty: 1,
      price: 7950.00
    },
    {
      id: '3',
      name: 'Estrutura de Fixação em Alumínio para Telhado',
      description: 'Estrutura reforçada em perfil de alumínio anodizado e fixadores em aço inox para 24 módulos.',
      qty: 1,
      price: 1850.00
    },
    {
      id: '4',
      name: 'String Box CC/CA com DPS e Disjuntores',
      description: 'Caixa de proteção completa com chaves seccionadoras, fusíveis e supressores de surto.',
      qty: 1,
      price: 1200.00
    },
    {
      id: '5',
      name: 'Cabos Solares 6mm² e Conectores MC4',
      description: 'Cabos com proteção UV 1.8kV CC e conectores blindados IP68.',
      qty: 1,
      price: 780.00
    },
    {
      id: '6',
      name: 'Projeto de Engenharia, Homologação e ART',
      description: 'Elaboração do projeto elétrico, parecer de acesso junto à concessionária de energia e laudo técnico.',
      qty: 1,
      price: 2500.00
    }
  ],

  paymentTerms: '50% de entrada na aprovação da proposta e 50% na conclusão da entrega dos equipamentos.',
  deliveryTime: '15 a 20 dias úteis após a aprovação e confirmação técnica.',
  warranty: 'Módulos: 12 anos de fabricação e 25 anos de desempenho linear (84.8%). Inversor: 10 anos de garantia de fábrica.',
  notes: 'Incluso frete com seguro até o endereço de instalação. A homologação junto à concessionária de energia local é conduzida pela equipe de engenharia da CIAVOLT.',
  logoType: 'default'
};

export const SUNCLEAR_POST_SALES_PROPOSAL_DATA: ProposalData = {
  proposalNumber: 'PV-SC-2026-042',
  validity: 5,
  issueDate: new Date().toISOString().slice(0, 10),
  seller: 'Departamento de Pós-Venda SunClear',
  sellerPhone: '(11) 98765-4321',
  sellerEmail: 'posvenda@sunclear.com.br',

  clientName: 'Cliente SunClear - Assistência Técnica & O&M',
  clientDocument: '34.567.890/0001-12',
  clientPhone: '(11) 99876-5432',
  clientEmail: 'operacao@cliente.com.br',
  clientAddress: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',

  items: [
    {
      id: 'pv-1',
      name: 'Visita Técnica e Diagnóstico Especializado',
      description: 'Deslocamento de equipe técnica especializada (habilitada em NR-10 e NR-35) para inspeção visual detalhada, medição de grandezas elétricas (tensão Voc, corrente Isc, isolamento CC/CA e aterramento) e diagnóstico preciso de anomalias no sistema fotovoltaico.',
      qty: 1,
      price: 350.00
    },
    {
      id: 'pv-2',
      name: 'Configuração e Parametrização de Inversor',
      description: 'Atualização do firmware de fábrica, verificação e reparametrização de curvas de operação conforme exigências da distribuidora (limites de sobretensão/subtensão e frequência), restabelecimento de sincronismo CA e calibração de canais MPPT para reativação da geração.',
      qty: 1,
      price: 280.00
    },
    {
      id: 'pv-3',
      name: 'Troca de Disjuntor Termomagnético',
      description: 'Substituição de disjuntor danificado por componente novo dimensionado conforme projeto elétrico, com reaperto de bornes com torquímetro e teste de atuação sob carga para garantir proteção confiável contra sobrecorrente e curto-circuito.',
      qty: 1,
      price: 220.00
    },
    {
      id: 'pv-4',
      name: 'Troca de DPS (Dispositivo de Proteção contra Surtos)',
      description: 'Substituição de cartuchos/módulos de DPS avariados (Classe II CC e/ou CA) por novas unidades certificadas, restabelecendo o escoamento seguro de transientes e sobretensões atmosféricas para o barramento de equipotencialização.',
      qty: 1,
      price: 260.00
    },
    {
      id: 'pv-5',
      name: 'Manutenção Preventiva e Corretiva do Sistema',
      description: 'Revisão e reaperto de todas as conexões dos quadros elétricos com torquímetro, inspeção de conectores MC4 e integridade da isolação dos cabos solares, checagem da fixação mecânica das estruturas e emissão de relatório técnico de conformidade.',
      qty: 1,
      price: 450.00
    },
    {
      id: 'pv-6',
      name: 'Antena Datalogger / Módulo de Comunicação Wi-Fi',
      description: 'Fornecimento e instalação de nova antena/datalogger de comunicação compatível com o inversor, pareamento com a rede Wi-Fi local e sincronização completa com a plataforma em nuvem para monitoramento remoto de geração e alarmes em tempo real.',
      qty: 1,
      price: 390.00
    },
    {
      id: 'pv-7',
      name: 'Limpeza Técnica Especializada de Módulos Fotovoltaicos',
      description: 'Higienização técnica da superfície dos módulos solares com água tratada e escovas de cerdas macias anti-risco de uso fotovoltaico exclusivo (sem agentes químicos corrosivos ou abrasivos), removendo fuligem e poeira acumuladas para recuperação imediata do rendimento energético.',
      qty: 1,
      price: 320.00
    }
  ],

  paymentTerms: 'À vista via PIX ou Transferência; ou parcelado em até 3x sem juros no cartão de crédito.',
  deliveryTime: 'Prazo de Atendimento/Execução: Agendamento e início da execução técnica em até 48 a 72 horas úteis após a aprovação formal da proposta.',
  warranty: 'Garantia legal de 90 (noventa) dias sobre a mão de obra dos serviços prestados e garantia do fabricante sobre os componentes específicos substituídos. A presente garantia não abrange o sistema gerador fotovoltaico completo nem defeitos originados por causas externas, intervenção de terceiros ou descargas atmosféricas diretas além da capacidade nominal dos protetores.',
  notes: 'O escopo desta proposta é estritamente restrito aos serviços e componentes de assistência técnica discriminados acima. Quaisquer adequações civis, substituição de cabeamento fora do padrão ou custos extras de deslocamento não contemplados nesta proposta serão previamente informados e orçados. A SunClear isenta-se expressamente de responsabilidade por vícios ocultos, danos pré-existentes ou defeitos em equipamentos não fornecidos ou substituídos nesta intervenção técnica.',
  logoType: 'default',
  layoutMode: 'standard',
  customFooterText: 'SUNCLEAR ENERGIA SOLAR • DEPARTAMENTO DE PÓS-VENDA',
  customCoverFooter: 'CONFIANÇA & EFICIÊNCIA EM PÓS-VENDA SOLAR • SUNCLEAR'
};
