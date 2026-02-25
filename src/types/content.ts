export type ContentBlockType = 'paragraph' | 'heading' | 'quote' | 'bullet';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  text: string;
}

export interface WeeklyHighlight {
  id: string;
  title: string;
  subtitle?: string; // Novo campo
  slug?: string;
  tag: string;
  imageUrl: string; // Miniatura do card
  contentCoverUrl?: string; // Capa interna da publicação
  readTimeLabel?: string;
  ctaLabel?: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  status: 'active' | 'inactive';
  order: number;
  body?: ContentBlock[];
  authorName?: string;
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