export type ProductStatus = 'active' | 'inactive' | 'pending';
export type ProductCategory = 'SaaS' | 'Consultoria' | 'IA' | 'Operação' | 'Financeiro' | 'RH' | 'Marketing';

export interface AdminProduct {
  id: string;
  name: string;
  slug?: string;
  category: ProductCategory;
  status: ProductStatus;
  
  priceCents: number;
  billingPeriod?: 'monthly' | 'yearly';
  priceLabel?: string;

  shortDescription: string;
  longDescription?: string;

  heroImageUrl?: string;
  logoImageUrl?: string;
  gallery?: string[];

  benefits: Array<{ id: string; text: string }>;
  features?: Array<{ id: string; title: string; description?: string }>;

  testimonial?: {
    enabled: boolean;
    stars: 1 | 2 | 3 | 4 | 5;
    quote: string;
    authorName?: string;
    authorRole?: string;
    company?: string;
  };

  ctaPrimaryLabel?: string;
  ctaSecondaryLabel?: string;

  partnerId?: string;
  imageUrl?: string; // Legacy field, keeping for compat
  imageAlt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PartnerType = 'Fornecedor' | 'Consultoria' | 'Tecnologia';
export type PartnerStatus = 'active' | 'pending' | 'inactive';

export interface AdminPartner {
  id: string;
  name: string;
  type: PartnerType;
  contactName: string;
  email: string;
  phone?: string;
  status: PartnerStatus;
  createdAt: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicationRequest {
  id: string;
  requesterUserId: string;
  requesterName: string;
  requesterEmail: string;
  partnerName: string;
  partnerType: PartnerType;
  productName: string;
  category: ProductCategory;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettings {
  platformName: string;
  theme: string;
  allowPublicPrices: boolean;
  requirePartnerApproval: boolean;
}
