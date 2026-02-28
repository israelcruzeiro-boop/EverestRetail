export type AnalyticsEventType =
  | 'page_view'
  | 'content_view'
  | 'product_view'
  | 'product_click'
  | 'search'
  | 'login'
  | 'logout'
  | 'checkout_started'
  | 'checkout_confirmed'
  | 'schedule_started'
  | 'schedule_confirmed'
  | 'publication_request_created'
  | 'cta_click';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string; // ISO String
  userId?: string;
  sessionId: string;
  route?: string;
  meta?: Record<string, any>;
}