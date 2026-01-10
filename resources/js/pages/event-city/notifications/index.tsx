import { Head, router } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/layouts/app-layout";
import type { NotificationData, NotificationPagination } from "@/types/notifications";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface NotificationsIndexProps {
    notifications: NotificationPagination;
}

export default function NotificationsIndex({ notifications }: NotificationsIndexProps) {
    const [notificationList, setNotificationList] = useState(notifications.data);

    const handleNotificationClick = async (notification: NotificationData) => {
        if (!notification.read) {
            try {
                await axios.patch(`/api/notifications/${notification.id}/read`);

                setNotificationList((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }

        if (notification.action_url) {
            const actionUrl = getActionUrlForNotification(notification);
            if (actionUrl) {
                router.visit(actionUrl);
            }
        }
    };

    const getActionUrlForNotification = (notification: NotificationData): string | null => {
        if (notification.action_url) {
            return notification.action_url;
        }

        switch (notification.type) {
            case "message":
                return "/social/messages";
            case "friend_request":
                return "/social/friends";
            case "like":
            case "comment":
            case "share":
                return "/social";
            case "group_invite":
                return "/social/groups";
            default:
                return null;
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch("/api/notifications/mark-all-read");

            setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "message":
                return "💬";
            case "friend_request":
                return "👥";
            case "like":
                return "❤️";
            case "comment":
                return "💬";
            case "share":
                return "🔄";
            case "group_invite":
                return "👥";
            default:
                return "🔔";
        }
    };

    const getNotificationTypeLabel = (type: string) => {
        switch (type) {
            case "message":
                return "Message";
            case "friend_request":
                return "Friend Request";
            case "like":
                return "Like";
            case "comment":
                return "Comment";
            case "share":
                return "Share";
            case "group_invite":
                return "Group Invite";
            default:
                return "Notification";
        }
    };

    const unreadCount = notificationList.filter((n) => !n.read).length;

    return (
        <Layout>
            <Head title="Notifications" />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Bell className="size-8" />
                                Notifications
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {notifications.total > 0
                                    ? `${unreadCount} unread of ${notifications.total} total notifications`
                                    : "No notifications yet"}
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
                                <CheckCheck className="size-4" />
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {notificationList.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Bell className="size-16 text-muted-foreground/50 mb-4" />
                                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No notifications</h3>
                                <p className="text-muted-foreground text-center">
                                    You're all caught up! New notifications will appear here when you receive them.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {notificationList.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={`transition-all cursor-pointer hover:shadow-md ${
                                        !notification.read ? "border-primary/20 bg-accent/50" : ""
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3
                                                            className={`font-semibold text-lg leading-tight mb-1 ${
                                                                !notification.read ? "text-foreground" : "text-muted-foreground"
                                                            }`}
                                                        >
                                                            {notification.title}
                                                        </h3>
                                                        <p className="text-muted-foreground mb-3">{notification.message}</p>

                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline">{getNotificationTypeLabel(notification.type)}</Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {dayjs(notification.created_at).fromNow()}
                                                            </span>
                                                            {notification.action_url && (
                                                                <div className="flex items-center gap-1 text-xs text-primary dark:text-blue-400">
                                                                    <ExternalLink className="size-3" />
                                                                    Click to view
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Unread indicator */}
                                                    {!notification.read && (
                                                        <div className="flex-shrink-0">
                                                            <div className="w-3 h-3 bg-accent/500 rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination would go here if needed */}
                    {notifications.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <p className="text-sm text-muted-foreground">
                                Showing {notifications.from}-{notifications.to} of {notifications.total} notifications
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
