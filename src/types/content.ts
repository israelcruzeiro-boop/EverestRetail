export type ContentBlockType = 'paragraph' | 'heading' | 'quote' | 'bullet';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  text: string;
}

export interface ContentArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags?: string[];
  readingTime?: string;
  authorName?: string;
  publishedAt?: string;
  status: 'draft' | 'published';
  body: ContentBlock[];
  createdAt: string;
  updatedAt?: string;
}

export interface WeeklyHighlight {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  readTimeLabel?: string;
  ctaLabel?: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  contentId?: string; // ID do artigo vinculado
  status: 'active' | 'inactive';
  order: number;
}

export interface SuggestedProductBlock {
  id: string;
  productId: string;
  customTitle?: string;
  customCta?: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface VideoCast {
  id: string;
  title: string;
  categoryLabel: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  speakerLabel?: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface HomeContentConfig {
  highlights: WeeklyHighlight[];
  suggested: SuggestedProductBlock[];
  videocasts: VideoCast[];
}