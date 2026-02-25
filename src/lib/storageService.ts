import { AdminProduct, AdminPartner, AdminUser, AdminSettings, PublicationRequest } from '../types/admin';
import { HomeContentConfig } from '../types/content';

const KEYS = {
  PRODUCTS: 'ENT_ADMIN_PRODUCTS',
  PARTNERS: 'ENT_ADMIN_PARTNERS',
  USERS: 'ENT_ADMIN_USERS',
  SETTINGS: 'ENT_ADMIN_SETTINGS',
  PUBLICATION_REQUESTS: 'ENT_ADMIN_PUBLICATION_REQUESTS',
  HOME_CONTENT: 'ENT_HOME_CONTENT',
};

export const storageService = {
  // Products
  getProducts(): AdminProduct[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      if (!data) return [];
      const products: AdminProduct[] = JSON.parse(data);
      
      // Migration / Compat
      return products.map(p => ({
        ...p,
        shortDescription: p.shortDescription || 'Solução estratégica para otimização de processos no varejo.',
        benefits: p.benefits || [
          { id: '1', text: 'Implementação ágil e suporte dedicado' },
          { id: '2', text: 'Integração nativa com sistemas ERP' },
          { id: '3', text: 'Dashboard de indicadores em tempo real' },
          { id: '4', text: 'Redução de custos operacionais comprovada' }
        ],
        testimonial: p.testimonial || {
          enabled: false,
          stars: 5,
          quote: '',
        },
        billingPeriod: p.billingPeriod || 'monthly',
        priceLabel: p.priceLabel || 'INVESTIMENTO MENSAL',
        ctaPrimaryLabel: p.ctaPrimaryLabel || 'Contratar agora',
        ctaSecondaryLabel: p.ctaSecondaryLabel || 'Agendar conversa',
        heroImageUrl: p.heroImageUrl || p.imageUrl,
      }));
    } catch (e) {
      console.error('Error reading products', e);
      return [];
    }
  },
  saveProducts(products: AdminProduct[]) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Partners
  getPartners(): AdminPartner[] {
    try {
      const data = localStorage.getItem(KEYS.PARTNERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading partners', e);
      return [];
    }
  },
  savePartners(partners: AdminPartner[]) {
    localStorage.setItem(KEYS.PARTNERS, JSON.stringify(partners));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Users
  getUsers(): AdminUser[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users', e);
      return [];
    }
  },
  saveUsers(users: AdminUser[]) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Settings
  getSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        platformName: 'ENT One Stop Shop',
        theme: 'Executivo Light',
        allowPublicPrices: false,
        requirePartnerApproval: true,
      };
    } catch (e) {
      return {
        platformName: 'ENT One Stop Shop',
        theme: 'Executivo Light',
        allowPublicPrices: false,
        requirePartnerApproval: true,
      };
    }
  },
  saveSettings(settings: AdminSettings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Publication Requests
  getPublicationRequests(): PublicationRequest[] {
    try {
      const data = localStorage.getItem(KEYS.PUBLICATION_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading publication requests', e);
      return [];
    }
  },
  savePublicationRequests(requests: PublicationRequest[]) {
    localStorage.setItem(KEYS.PUBLICATION_REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Home Content (CMS)
  getHomeContent(): HomeContentConfig {
    try {
      const data = localStorage.getItem(KEYS.HOME_CONTENT);
      if (!data) return { highlights: [], suggested: [], videocasts: [] };
      const config: HomeContentConfig = JSON.parse(data);
      return {
        highlights: config.highlights || [],
        suggested: config.suggested || [],
        videocasts: config.videocasts || [],
      };
    } catch (e) {
      return { highlights: [], suggested: [], videocasts: [] };
    }
  },
  saveHomeContent(config: HomeContentConfig) {
    localStorage.setItem(KEYS.HOME_CONTENT, JSON.stringify(config));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Seed
  seedInitialData() {
    const products = this.getProducts();
    const partners = this.getPartners();
    const users = this.getUsers();

    if (products.length === 0) {
      this.saveProducts([
        {
          id: '1',
          name: 'Checkii+',
          slug: 'checkii-plus',
          category: 'SaaS',
          priceCents: 29900,
          status: 'active',
          shortDescription: 'O checklist inteligente que garante a execução perfeita da sua loja.',
          longDescription: 'O Checkii+ é a solução definitiva para gestão de rotinas operacionais. Com ele, você digitaliza processos, monitora conformidade em tempo real e identifica gargalos antes que eles virem prejuízo.',
          heroImageUrl: 'https://picsum.photos/seed/checkii/1200/800',
          logoImageUrl: 'https://picsum.photos/seed/checkii-logo/200/200',
          billingPeriod: 'monthly',
          priceLabel: 'INVESTIMENTO MENSAL',
          benefits: [
            { id: 'b1', text: 'Digitalização completa de processos' },
            { id: 'b2', text: 'Relatórios automáticos por loja' },
            { id: 'b3', text: 'Alertas de não conformidade' },
            { id: 'b4', text: 'Suporte 24/7 especializado' }
          ],
          testimonial: {
            enabled: true,
            stars: 5,
            quote: 'O Checkii+ mudou nossa rotina. Hoje temos 100% de visibilidade sobre o que acontece no chão de loja.',
            authorName: 'Marcos Oliveira',
            authorRole: 'Gerente de Operações',
            company: 'Rede Varejo Top'
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'DataStream Pro 360',
          category: 'SaaS',
          priceCents: 49990,
          status: 'active',
          shortDescription: 'Visibilidade total dos seus dados de vendas e estoque em um só lugar.',
          heroImageUrl: 'https://picsum.photos/seed/data/800/600',
          createdAt: new Date().toISOString(),
          benefits: [
            { id: '1', text: 'Implementação ágil e suporte dedicado' },
            { id: '2', text: 'Integração nativa com sistemas ERP' },
            { id: '3', text: 'Dashboard de indicadores em tempo real' },
            { id: '4', text: 'Redução de custos operacionais comprovada' }
          ],
        },
        {
          id: '3',
          name: 'OmniChannel Enterprise',
          category: 'IA',
          priceCents: 89900,
          status: 'active',
          shortDescription: 'Inteligência Artificial para unificar seus canais de venda e atendimento.',
          heroImageUrl: 'https://picsum.photos/seed/crm/800/600',
          createdAt: new Date().toISOString(),
          benefits: [
            { id: '1', text: 'Implementação ágil e suporte dedicado' },
            { id: '2', text: 'Integração nativa com sistemas ERP' },
            { id: '3', text: 'Dashboard de indicadores em tempo real' },
            { id: '4', text: 'Redução de custos operacionais comprovada' }
          ],
        }
      ]);
    }

    if (partners.length === 0) {
      this.savePartners([
        {
          id: 'p1',
          name: 'Global Logistics S.A.',
          type: 'Tecnologia',
          contactName: 'Ricardo Alencar',
          email: 'ricardo@globallogistics.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'p2',
          name: 'Tech Solutions Ltd',
          type: 'Consultoria',
          contactName: 'Mariana Costa',
          email: 'mariana@techsolutions.com',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    if (users.length === 0) {
      this.saveUsers([
        {
          id: 'u1',
          name: 'Suporte ENT',
          email: 'suporte@ent.app.br',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'u2',
          name: 'Ana Silva',
          email: 'ana@ent.com',
          role: 'editor',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'u3',
          name: 'Carlos Oliveira',
          email: 'carlos@ent.com',
          role: 'viewer',
          status: 'inactive',
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    // Seed Home Content
    const homeContent = this.getHomeContent();
    if (homeContent.highlights.length === 0 && homeContent.suggested.length === 0 && homeContent.videocasts.length === 0) {
      this.saveHomeContent({
        highlights: [
          {
            id: 'h1',
            title: 'Como escalar sua operação de varejo com IA',
            tag: 'OPERAÇÃO',
            imageUrl: 'https://picsum.photos/seed/highlight1/800/400',
            readTimeLabel: '5 min leitura',
            linkType: 'external',
            linkUrl: 'https://google.com',
            status: 'active',
            order: 1
          },
          {
            id: 'h2',
            title: 'Novas tendências de conversão para 2024',
            tag: 'CONVERSÃO',
            imageUrl: 'https://picsum.photos/seed/highlight2/800/400',
            readTimeLabel: '8 min leitura',
            linkType: 'external',
            linkUrl: 'https://google.com',
            status: 'active',
            order: 2
          }
        ],
        suggested: [
          {
            id: 's1',
            productId: '1',
            customCta: 'Saber mais',
            status: 'active',
            order: 1
          },
          {
            id: 's2',
            productId: '2',
            customCta: 'Saber mais',
            status: 'active',
            order: 2
          }
        ],
        videocasts: [
          {
            id: 'v1',
            title: 'Cultura de Dados no Varejo',
            categoryLabel: 'GESTÃO • SESSÃO #42',
            description: 'Nesta sessão, discutimos como implementar uma cultura orientada a dados.',
            thumbnailUrl: 'https://picsum.photos/seed/video1/800/450',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            speakerLabel: 'Com Marcos Paulo e Julia Reis',
            status: 'active',
            order: 1
          }
        ]
      });
    }
  },

  resetAll() {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.PARTNERS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.SETTINGS);
    this.seedInitialData();
  }
};
