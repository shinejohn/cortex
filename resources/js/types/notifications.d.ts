export interface NotificationData {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    created_at: string;
    action_url?: string;
    data?: Record<string, unknown>;
}

export type NotificationType =
    | 'message'
    | 'friend_request'
    | 'like'
    | 'comment'
    | 'share'
    | 'group_invite';

export interface NotificationSummary {
    notifications: NotificationData[];
    unread_count: number;
}

export interface NotificationPagination {
    data: NotificationData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}