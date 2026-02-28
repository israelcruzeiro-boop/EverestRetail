import { AnalyticsEventType } from '@/types/analytics';
import { analyticsRepo } from '@/lib/repositories/analyticsRepo';

const SESSION_KEY = 'ENT_SESSION_ID';

export const analytics = {
  /**
   * Obtém ou gera um ID de sessão único persistido no sessionStorage
   */
  getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  },

  /**
   * Registra um novo evento no sistema
   */
  track(type: AnalyticsEventType, meta?: Record<string, any>) {
    analyticsRepo.insertEvent({
      type,
      sessionId: this.getSessionId(),
      meta
    });
  }
};