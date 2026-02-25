export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tag: string;
  complexity: string;
  benefits: string[];
  image: string;
  highlight: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'DataStream Pro 360',
    description: 'Infraestrutura completa para análise preditiva e governança de dados em tempo real.',
    price: 499.90,
    category: 'SaaS',
    tag: 'AI Enabled',
    complexity: 'Medium',
    benefits: [
      'Redução de 40% no custo operacional',
      'Análise em tempo real',
      'Governança de dados integrada'
    ],
    image: 'https://picsum.photos/seed/data/800/600',
    highlight: 'Redução de 40% no custo operacional'
  },
  {
    id: '2',
    name: 'OmniChannel Enterprise',
    description: 'A plataforma líder para gestão de relacionamento com o cliente em grandes corporações.',
    price: 899.00,
    category: 'CRM',
    tag: 'High Complex',
    complexity: 'High',
    benefits: [
      'Integração nativa com ERP SAP/Oracle',
      'Visão 360 do cliente',
      'Automação de marketing'
    ],
    image: 'https://picsum.photos/seed/crm/800/600',
    highlight: 'Integração nativa com ERP SAP/Oracle'
  },
  {
    id: '3',
    name: 'SecureCloud Shield',
    description: 'Proteção cibernética avançada com camadas de criptografia quântica para ativos digitais.',
    price: 1200.00,
    category: 'Infra',
    tag: 'Hybrid Cloud',
    complexity: 'High',
    benefits: [
      'SLA de 99.99% garantido em contrato',
      'Criptografia de ponta a ponta',
      'Monitoramento 24/7'
    ],
    image: 'https://picsum.photos/seed/cloud/800/600',
    highlight: 'SLA de 99.99% garantido em contrato'
  }
];
