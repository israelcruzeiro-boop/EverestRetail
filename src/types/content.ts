export interface WeeklyHighlight {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  readTimeLabel?: string;
  ctaLabel?: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
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
