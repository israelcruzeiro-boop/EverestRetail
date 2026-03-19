export type ProductStatus = 'active' | 'inactive' | 'pending';
export type ProductCategory = 'SaaS' | 'Consultoria' | 'IA' | 'Operação' | 'Financeiro' | 'RH' | 'Marketing';
export type ProductType = 'physical' | 'digital';

export interface AdminProduct {
  id: string;
  name: string;
  slug?: string;
  category: ProductCategory;
  type: ProductType;
  status: ProductStatus;

  priceCents: number;
  originalPriceCents?: number;
  billingPeriod?: 'monthly' | 'yearly';
  priceLabel?: string;

  shortDescription: string;
  longDescription?: string;

  heroImageUrl?: string;
  logoImageUrl?: string;
  videoUrl?: string;
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
  imageUrl?: string;
  imageAlt?: string;
  createdAt: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
}

export type PartnerType = 'Fornecedor' | 'Consultoria' | 'Tecnologia';
export type PartnerStatus = 'active' | 'pending' | 'inactive';

export interface AdminPartner {
  id: string;
  name: string;
  type: PartnerType;
  logoUrl?: string;
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
  avatarUrl: string | null;
  password?: string;
  role: UserRole;
  userType: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  coinsBalance?: number;
  coinsEarnedTotal?: number;
  currentLevel?: number;
  xpTotal?: number;
  updatedAt?: string;
}

export interface PublicationRequest {
  id: string;
  requesterProfileId: string;
  partnerId?: string;
  name: string;
  type: 'product' | 'service';
  category: ProductCategory;
  shortDescription?: string;
  description: string;
  priceCents: number;
  billingPeriod: 'monthly' | 'yearly';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettings {
  platformName: string;
  theme: string;
  allowPublicPrices: boolean;
  requirePartnerApproval: boolean;
}

export interface ProductReview {
  id: string;
  profileId: string;
  productId: string;
  rating: number; // 0-10
  comment?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export interface ProductHire {
  id: string;
  profileId: string;
  productId: string;
  hiredAt: string;
}