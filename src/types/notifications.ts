export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AdminNotification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    read: boolean;
    link?: string;
    createdAt: string;
}
