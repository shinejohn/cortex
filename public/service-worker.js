// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    
    const options = {
        body: data.body || data.message,
        icon: data.icon || '/images/notification-icon.png',
        badge: data.badge || '/images/badge-icon.png',
        image: data.image,
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            notification_id: data.notification_id,
            platform: data.platform,
        },
        actions: data.actions || [
            { action: 'open', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        tag: data.tag || 'default', // Prevents duplicate notifications
        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'New Notification', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle subscription change (e.g., when browser refreshes push subscription)
self.addEventListener('pushsubscriptionchange', function(event) {
    event.waitUntil(
        self.registration.pushManager.getSubscription()
            .then(function(subscription) {
                if (subscription) {
                    // Send new subscription to server
                    return fetch('/api/notifications/web-push/register', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
                                auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
                            },
                        }),
                    });
                }
            })
    );
});

