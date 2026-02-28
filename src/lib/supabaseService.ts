import { supabase } from '@/lib/supabase';
import { analyticsRepo } from '@/lib/repositories/analyticsRepo';
import { AdminProduct, AdminPartner, AdminUser, AdminSettings, PublicationRequest } from '@/types/admin';
import { HomeContentConfig } from '@/types/content';
import { AnalyticsEvent, AnalyticsEventType } from '@/types/analytics';
import { storageService } from '@/lib/storageService';
import { AdminNotification } from '@/types/notifications';

export const supabaseService = {
  // Products
  async getProducts(): Promise<AdminProduct[]> {
    if (!supabase) return storageService.getProducts();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return storageService.getProducts();
    }

    return (data || []).map(p => ({
      ...p,
      priceCents: p.price_cents,
      originalPriceCents: p.original_price_cents,
      heroImageUrl: p.hero_image_url,
      logoImageUrl: p.logo_image_url,
      videoUrl: p.video_url,
      ctaPrimaryLabel: p.cta_primary_label,
      ctaSecondaryLabel: p.cta_secondary_label,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
  },

  async saveProduct(product: Partial<AdminProduct>) {
    if (!supabase) return;

    const isNew = !product.id;
    const dbProduct = {
      name: product.name,
      slug: product.slug,
      category: product.category,
      status: product.status,
      price_cents: product.priceCents,
      original_price_cents: product.originalPriceCents,
      billing_period: product.billingPeriod,
      price_label: product.priceLabel,
      short_description: product.shortDescription,
      long_description: product.longDescription,
      hero_image_url: product.heroImageUrl,
      logo_image_url: product.logoImageUrl,
      video_url: product.videoUrl,
      gallery: product.gallery,
      benefits: product.benefits,
      features: product.features,
      testimonial: product.testimonial,
      cta_primary_label: product.ctaPrimaryLabel,
      cta_secondary_label: product.ctaSecondaryLabel,
      updated_at: new Date().toISOString()
    };

    if (isNew) {
      const { data, error } = await supabase.from('products').insert([dbProduct]).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase.from('products').update(dbProduct).eq('id', product.id).select();
      if (error) throw error;
      return data[0];
    }
  },

  // Partners
  async getPartners(): Promise<AdminPartner[]> {
    if (!supabase) return storageService.getPartners();

    const { data, error } = await supabase.from('partners').select('*').order('name');
    if (error) return storageService.getPartners();
    return (data || []).map(p => ({
      ...p,
      logoUrl: p.logo_url,
      contactName: p.contact_name,
      createdAt: p.created_at
    }));
  },

  // Publication Requests
  async getPublicationRequests(): Promise<PublicationRequest[]> {
    if (!supabase) return storageService.getPublicationRequests();

    const { data, error } = await supabase.from('publication_requests').select('*').order('created_at', { ascending: false });
    if (error) return storageService.getPublicationRequests();
    return (data || []).map(r => ({
      ...r,
      requesterProfileId: r.requester_profile_id,
      partnerId: r.partner_id,
      shortDescription: r.short_description,
      priceCents: r.price_cents,
      billingPeriod: r.billing_period,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },

  // Analytics
  async logEvent(event: { type: AnalyticsEventType, sessionId: string, meta?: any }) {
    await analyticsRepo.insertEvent(event);
  },

  async getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
    return analyticsRepo.listEvents({});
  },

  // User Profile
  async updateProfile(id: string, updates: { name?: string, avatar_url?: string }): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    if (!supabase) return storageService.getNotifications();

    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return storageService.getNotifications();
    }

    return (data || []).map(n => ({
      ...n,
      createdAt: n.created_at
    }));
  },

  async addNotification(notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) {
    if (!supabase) {
      storageService.addNotification(notification);
      return;
    }

    const { error } = await supabase.from('admin_notifications').insert([{
      type: notification.type,
      title: notification.title,
      description: notification.description,
      link: notification.link,
      read: false
    }]);

    if (error) {
      console.error('Error adding notification:', error);
      storageService.addNotification(notification);
    }
  },

  async markAsRead(id: string) {
    if (!supabase) {
      storageService.markAsRead(id);
      return;
    }

    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      storageService.markAsRead(id);
    }
  },

  async markAllAsRead() {
    if (!supabase) {
      storageService.markAllAsRead();
      return;
    }

    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      storageService.markAllAsRead();
    }
  }
};
