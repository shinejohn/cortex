import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import { Bell, Check } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { NotificationData, NotificationType } from "@/types/notifications";

interface NotificationDropdownProps {
    initialNotifications?: NotificationData[];
    initialUnreadCount?: number;
    filterType?: NotificationType | 'all';
    icon?: React.ReactNode;
    title?: string;
    emptyMessage?: string;
    className?: string;
}

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

export function NotificationDropdown({
    initialNotifications = [],
    initialUnreadCount = 0,
    filterType = 'all',
    icon = <Bell className="size-5" />,
    title = 'Notifications',
    emptyMessage = 'No new notifications',
    className
}: NotificationDropdownProps) {
    // Filter initial notifications based on filterType
    const filteredInitialNotifications = filterType === 'all'
        ? initialNotifications
        : initialNotifications.filter(n => n.type === filterType);

    const filteredInitialCount = filterType === 'all'
        ? initialUnreadCount
        : filteredInitialNotifications.filter(n => !n.read).length;

    const [notifications, setNotifications] = useState<NotificationData[]>(filteredInitialNotifications);
    const [unreadCount, setUnreadCount] = useState(filteredInitialCount);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await axios.get("/api/notifications/unread");
            const allNotifications = response.data.notifications || [];

            // Filter notifications based on filterType
            const filteredNotifications = filterType === 'all'
                ? allNotifications
                : allNotifications.filter((n: NotificationData) => n.type === filterType);

            setNotifications(filteredNotifications);
            setUnreadCount(filteredNotifications.length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, filterType]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleNotificationClick = async (notification: NotificationData) => {
        if (!notification.read) {
            try {
                await axios.patch(`/api/notifications/${notification.id}/read`);

                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
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

        setIsOpen(false);
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

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
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

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`relative ${className}`}>
                    {icon}
                    {unreadCount > 0 && (
                        <Badge className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    {title}
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Check className="mr-1 size-3" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex gap-3">
                                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <p className={`text-sm leading-4 ${!notification.read ? "font-medium" : ""}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {dayjs(notification.created_at).fromNow()}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    router.visit("/notifications");
                    setIsOpen(false);
                }}>
                    View all notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}