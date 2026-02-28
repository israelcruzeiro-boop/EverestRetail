import { AdminProduct, AdminPartner, AdminUser, AdminSettings, PublicationRequest } from '../types/admin';
import { AdminNotification } from '../types/notifications';
import { HomeContentConfig } from '../types/content';
import { AnalyticsEvent } from '../types/analytics';
import { APP_CONFIG } from '../config/appConfig';

const KEYS = {
  PRODUCTS: 'ENT_ADMIN_PRODUCTS',
  PARTNERS: 'ENT_ADMIN_PARTNERS',
  USERS: 'ENT_ADMIN_USERS',
  SETTINGS: 'ENT_ADMIN_SETTINGS',
  PUBLICATION_REQUESTS: 'ENT_ADMIN_PUBLICATION_REQUESTS',
  HOME_CONTENT: 'ENT_HOME_CONTENT',
  ANALYTICS: 'ENT_ANALYTICS_EVENTS',
  NOTIFICATIONS: 'ENT_ADMIN_NOTIFICATIONS',
};

export const storageService = {
  getProducts(): AdminProduct[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  saveProducts(products: AdminProduct[]) {
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
    } catch (e) {
      console.error('Storage limit exceeded', e);
      alert('Erro: Limite de armazenamento excedido. Tente remover alguns itens antes de salvar novos.');
    }
  },
  getPartners(): AdminPartner[] {
    try {
      const data = localStorage.getItem(KEYS.PARTNERS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  savePartners(partners: AdminPartner[]) {
    try {
      localStorage.setItem(KEYS.PARTNERS, JSON.stringify(partners));
      window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
    } catch (e) {
      console.error('Storage limit exceeded', e);
      alert('Erro: Limite de armazenamento excedido ao salvar parceiros.');
    }
  },
  getUsers(): AdminUser[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  saveUsers(users: AdminUser[]) {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
    } catch (e) {
      console.error('Storage limit exceeded', e);
      alert('Erro: Limite de armazenamento excedido ao salvar usuários.');
    }
  },
  getPublicationRequests(): PublicationRequest[] {
    try {
      const data = localStorage.getItem(KEYS.PUBLICATION_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  savePublicationRequests(requests: PublicationRequest[]) {
    try {
      localStorage.setItem(KEYS.PUBLICATION_REQUESTS, JSON.stringify(requests));
      window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
    } catch (e) {
      console.error('Storage limit exceeded', e);
      alert('Erro: Limite de armazenamento excedido ao salvar solicitações.');
    }
  },
  getSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : { platformName: APP_CONFIG.name, theme: 'Executivo Light', allowPublicPrices: false, requirePartnerApproval: true };
    } catch (e) { return { platformName: APP_CONFIG.name, theme: 'Executivo Light', allowPublicPrices: false, requirePartnerApproval: true }; }
  },
  saveSettings(settings: AdminSettings) {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
    } catch (e) {
      console.error('Storage limit exceeded', e);
      alert('Erro: Limite de armazenamento excedido ao salvar configurações.');
    }
  },
  getHomeContent(): HomeContentConfig {
    try {
      const data = localStorage.getItem(KEYS.HOME_CONTENT);
      return data ? JSON.parse(data) : { hero: [], highlights: [], suggested: [], videocasts: [] };
    } catch (e) { return { hero: [], highlights: [], suggested: [], videocasts: [] }; }
  },
  saveHomeContent(config: HomeContentConfig) {
    localStorage.setItem(KEYS.HOME_CONTENT, JSON.stringify(config));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },

  // Analytics
  getAnalyticsEvents(): AnalyticsEvent[] {
    try {
      const data = localStorage.getItem(KEYS.ANALYTICS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  saveAnalyticsEvents(events: AnalyticsEvent[]) {
    localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(events));
    window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
  },
  appendAnalyticsEvent(event: AnalyticsEvent) {
    const events = this.getAnalyticsEvents();
    events.push(event);
    this.saveAnalyticsEvents(events);
  },
  clearAnalytics() {
    this.saveAnalyticsEvents([]);
  },

  // Notifications
  getNotifications(): AdminNotification[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  saveNotifications(notifications: AdminNotification[]) {
    try {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      window.dispatchEvent(new Event('ENT_STORAGE_UPDATED'));
    } catch (e) {
      console.error('Storage limit exceeded', e);
    }
  },
  addNotification(notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) {
    const notifications = this.getNotifications();
    const newNotification: AdminNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 11),
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotification);
    this.saveNotifications(notifications);
  },
  markAsRead(id: string) {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
    }
  },
  markAllAsRead() {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(notifications);
  },

  seedInitialData() {
    const currentUsers = this.getUsers();
    const hasAdmin = currentUsers.some(u => u.email === 'admin@email.com');
    const hasUser = currentUsers.some(u => u.email === 'user@email.com');

    const newUsers = [...currentUsers];
    if (!hasAdmin) {
      newUsers.push({
        id: 'u-admin',
        name: 'Admin Master',
        email: 'admin@email.com',
        password: '123456',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
    if (!hasUser) {
      newUsers.push({
        id: 'u-viewer',
        name: 'Usuário Padrão',
        email: 'user@email.com',
        password: '123456',
        role: 'viewer',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    if (!hasAdmin || !hasUser) {
      this.saveUsers(newUsers);
    }

    if (this.getProducts().length === 0) {
      this.saveProducts([{
        id: '1', name: 'Checkii+', category: 'SaaS', priceCents: 29900, status: 'active',
        shortDescription: 'O checklist inteligente que garante a execução perfeita da sua loja.',
        heroImageUrl: 'https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?auto=format&fit=crop&q=80&w=800',
        benefits: [{ id: 'b1', text: 'Digitalização de processos' }],
        createdAt: new Date().toISOString(),
      }]);
    }
  },

  resetAll() {
    const authUser = localStorage.getItem('ENT_AUTH_USER');
    localStorage.clear();
    if (authUser) {
      localStorage.setItem('ENT_AUTH_USER', authUser);
    }
    this.seedInitialData();
  }
};