import { AdminProduct, AdminPartner, AdminUser, AdminSettings, PublicationRequest } from '../types/admin';
import { HomeContentConfig, ContentArticle } from '../types/content';

const KEYS = {
  PRODUCTS: 'ENT_ADMIN_PRODUCTS',
  PARTNERS: 'ENT_ADMIN_PARTNERS',
  USERS: 'ENT_ADMIN_USERS',
  SETTINGS: 'ENT_ADMIN_SETTINGS',
  PUBLICATION_REQUESTS: 'ENT_ADMIN_PUBLICATION_REQUESTS',
  HOME_CONTENT: 'ENT_HOME_CONTENT',
  ARTICLES: 'ENT_CONTENT_ARTICLES',
};

export const storageService = {
  // Products
  getProducts(): AdminProduct[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      if (!data) return [];
      const products: AdminProduct[] = JSON.parse(data);
      return products.map(p => ({
        ...p,
        shortDescription: p.shortDescription || 'Solução estratégica para otimização de processos no varejo.',
        benefits: p.benefits || [],
        testimonial: p.testimonial || { enabled: false, stars: 5, quote: '' },
        billingPeriod: p.billingPeriod || 'monthly',
        priceLabel: p.priceLabel || 'INVESTIMENTO MENSAL',
        ctaPrimaryLabel: p.ctaPrimaryLabel || 'Contratar agora',
        ctaSecondaryLabel: p.ctaSecondaryLabel || 'Agendar conversa',
      }));
    } catch (e) {
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
      return [];
    }
  },
  saveUsers(users: AdminUser[]) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Publication Requests
  getPublicationRequests(): PublicationRequest[] {
    try {
      const data = localStorage.getItem(KEYS.PUBLICATION_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  savePublicationRequests(requests: PublicationRequest[]) {
    localStorage.setItem(KEYS.PUBLICATION_REQUESTS, JSON.stringify(requests));
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
        platformName: 'ENT One Stop Shop', theme: 'Executivo Light', allowPublicPrices: false, requirePartnerApproval: true
      };
    }
  },
  saveSettings(settings: AdminSettings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Home Content (CMS)
  getHomeContent(): HomeContentConfig {
    try {
      const data = localStorage.getItem(KEYS.HOME_CONTENT);
      if (!data) return { highlights: [], suggested: [], videocasts: [] };
      return JSON.parse(data);
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
    if (products.length === 0) {
      this.saveProducts([
        {
          id: '1',
          name: 'Checkii+',
          category: 'SaaS',
          priceCents: 29900,
          status: 'active',
          shortDescription: 'O checklist inteligente que garante a execução perfeita da sua loja.',
          heroImageUrl: 'https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?auto=format&fit=crop&q=80&w=800',
          benefits: [{ id: 'b1', text: 'Digitalização de processos' }],
          createdAt: new Date().toISOString(),
        }
      ]);
    }

    const users = this.getUsers();
    if (users.length === 0) {
      this.saveUsers([{ id: 'u1', name: 'Admin', email: 'admin@ent.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() }]);
    }

    const homeContent = this.getHomeContent();
    if (homeContent.highlights.length === 0) {
      this.saveHomeContent({
        highlights: [
          {
            id: 'h1',
            title: 'Como escalar sua operação de varejo com IA',
            subtitle: 'Descubra como a inteligência artificial está transformando a eficiência operacional e a experiência do cliente no varejo moderno.',
            slug: 'escalar-operacao-varejo-ia',
            tag: 'ESTRATÉGIA',
            imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
            contentCoverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
            readTimeLabel: '5 min leitura',
            linkType: 'internal',
            linkUrl: '',
            status: 'active',
            order: 1,
            authorName: 'Ricardo Mendes',
            body: [
              { id: 'b1', type: 'heading', text: 'A Revolução Silenciosa da IA no Chão de Loja' },
              { id: 'b2', type: 'paragraph', text: 'Muitos varejistas ainda veem a inteligência artificial como algo futurista, mas a realidade é que ela já está otimizando estoques e prevendo demandas em tempo real.' },
              { id: 'b3', type: 'quote', text: 'A tecnologia não substitui o talento humano, ela o escala.' },
              { id: 'b4', type: 'paragraph', text: 'Implementar essas soluções requer uma mentalidade orientada a dados, mas os resultados justificam o investimento em poucos meses.' }
            ]
          }
        ],
        suggested: [],
        videocasts: []
      });
    }
  },

  resetAll() {
    localStorage.clear();
    this.seedInitialData();
  }
};