<?php

declare(strict_types=1);

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomePageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PerformerController;
use App\Http\Controllers\Social\ImageUploadController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\SocialFeedController;
use App\Http\Controllers\SocialGroupController;
use App\Http\Controllers\SocialGroupPostController;
use App\Http\Controllers\SocialMessageController;
use App\Http\Controllers\TicketOrderController;
use App\Http\Controllers\TicketPageController;
use App\Http\Controllers\TicketPlanController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', [HomePageController::class, 'index'])->name('home');

// Create routes must come before {id} routes to avoid conflicts
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
    Route::get('/performers/create', [PerformerController::class, 'create'])->name('performers.create');
    Route::get('/venues/create', [VenueController::class, 'create'])->name('venues.create');
    Route::get('/calendars/create', [CalendarController::class, 'create'])->name('calendars.create');
});

Route::get('/events', [EventController::class, 'publicIndex'])->name('events');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show')->can('view', 'event');
Route::get('/performers', [PerformerController::class, 'publicIndex'])->name('performers');
Route::get('/performers/{performer}', [PerformerController::class, 'show'])->name('performers.show')->can('view', 'performer');
Route::get('/venues', [VenueController::class, 'publicIndex'])->name('venues');
Route::get('/venues/{venue}', [VenueController::class, 'show'])->name('venues.show')->can('view', 'venue');

// Calendar routes
Route::get('/calendars', [CalendarController::class, 'index'])->name('calendars.index');
// Add any non-numeric calendar routes here (e.g., /calendars/marketplace, /calendars/trending, etc.)
// Route::get('/calendars/marketplace', [CalendarController::class, 'marketplace'])->name('calendars.marketplace');
Route::get('/calendars/{calendar}', [CalendarController::class, 'show'])->name('calendars.show')->can('view', 'calendar');

// Ticket routes
Route::get('/tickets', [TicketPageController::class, 'index'])->name('tickets.index');
Route::get('/events/{event}/tickets', [TicketPageController::class, 'selection'])->name('events.tickets.selection');

// Community routes (publicly accessible)
Route::get('/community', [CommunityController::class, 'index'])->name('community.index');
Route::get('/community/impact', function () {
    return Inertia::render('Community/Impact');
})->name('community.impact');
Route::get('/community/{id}', [CommunityController::class, 'show'])->name('community.show');
Route::get('/community/{id}/thread/{threadId}', [CommunityController::class, 'showThread'])->name('community.thread.show');

// API routes for frontend data
Route::middleware(['auth'])->group(function () {
    Route::get('/api/events/featured', [EventController::class, 'featured'])->name('api.events.featured');
    Route::get('/api/events/upcoming', [EventController::class, 'upcoming'])->name('api.events.upcoming');
    Route::get('/api/venues/featured', [VenueController::class, 'featured'])->name('api.venues.featured');
    Route::get('/api/performers/featured', [PerformerController::class, 'featured'])->name('api.performers.featured');
    Route::get('/api/performers/trending', [PerformerController::class, 'trending'])->name('api.performers.trending');

    // Engagement tracking API routes
    Route::post('/api/engagement/track', [App\Http\Controllers\EngagementController::class, 'track'])->name('api.engagement.track');
    Route::post('/api/engagement/session/start', [App\Http\Controllers\EngagementController::class, 'sessionStart'])->name('api.engagement.session.start');
    Route::post('/api/engagement/session/end', [App\Http\Controllers\EngagementController::class, 'sessionEnd'])->name('api.engagement.session.end');

    // Notification API routes
    Route::get('/api/notifications/unread', [NotificationController::class, 'getUnread'])->name('api.notifications.unread');
    Route::patch('/api/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.read');
    Route::patch('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');

    // Ticket API routes
    Route::get('/api/ticket-plans', [TicketPlanController::class, 'index'])->name('api.ticket-plans.index');
    Route::get('/api/events/{event}/ticket-plans', [TicketPlanController::class, 'forEvent'])->name('api.events.ticket-plans');
    Route::resource('/api/ticket-orders', TicketOrderController::class, ['as' => 'api']);

    // Follow API routes
    Route::post('/api/follow/toggle', [FollowController::class, 'toggle'])->name('api.follow.toggle');
    Route::get('/api/follow/status', [FollowController::class, 'checkStatus'])->name('api.follow.status');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Resource routes for CRUD operations (excluding index, show, and create since they're defined elsewhere)
    Route::resource('venues', VenueController::class)->except(['index', 'show', 'create']);
    Route::resource('performers', PerformerController::class)->except(['index', 'show', 'create']);
    Route::resource('events', EventController::class)->except(['index', 'show', 'create']);
    Route::resource('calendars', CalendarController::class)->except(['index', 'show', 'create']);
    Route::resource('bookings', BookingController::class);

    // Calendar management routes
    Route::post('/calendars/{calendar}/follow', [CalendarController::class, 'follow'])->name('calendars.follow');
    Route::post('/calendars/{calendar}/events', [CalendarController::class, 'addEvent'])->name('calendars.events.add');
    Route::delete('/calendars/{calendar}/events/{event}', [CalendarController::class, 'removeEvent'])->name('calendars.events.remove');
    Route::post('/calendars/{calendar}/editors', [CalendarController::class, 'addEditor'])->name('calendars.editors.add');
    Route::delete('/calendars/{calendar}/editors/{user}', [CalendarController::class, 'removeEditor'])->name('calendars.editors.remove');

    // Ticket management routes
    Route::resource('ticket-plans', TicketPlanController::class);
    Route::resource('ticket-orders', TicketOrderController::class);

    // Authenticated ticket routes
    Route::get('/tickets/my-tickets', [TicketPageController::class, 'myTickets'])->name('tickets.my-tickets');

    // Community thread management routes (require authentication)
    Route::get('/community/{id}/new-thread', [CommunityController::class, 'createThread'])->name('community.thread.create');
    Route::post('/community/{id}/threads', [CommunityController::class, 'storeThread'])->name('community.thread.store');

    // Community thread reply routes (require authentication)
    Route::post('/community/thread/{threadId}/replies', [CommunityController::class, 'storeReply'])->name('community.thread.reply.store');
    Route::patch('/community/reply/{replyId}', [CommunityController::class, 'updateReply'])->name('community.reply.update');
    Route::delete('/community/reply/{replyId}', [CommunityController::class, 'destroyReply'])->name('community.reply.destroy');
    Route::post('/community/reply/{replyId}/like', [CommunityController::class, 'likeReply'])->name('community.reply.like');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // Additional booking actions
    Route::patch('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // Social media routes
    Route::prefix('social')->name('social.')->group(function () {
        // Social feed and posts
        Route::get('/', [SocialController::class, 'index'])->name('index');

        // Feed algorithms
        Route::get('/feed', [SocialFeedController::class, 'index'])->name('feed.index');
        Route::get('/feed/for-you', [SocialFeedController::class, 'forYou'])->name('feed.for-you');
        Route::get('/feed/followed', [SocialFeedController::class, 'followed'])->name('feed.followed');

        Route::post('/posts', [SocialController::class, 'createPost'])->name('posts.create');
        Route::post('/images/upload', [ImageUploadController::class, 'upload'])->name('images.upload');
        Route::post('/posts/{post}/like', [SocialController::class, 'likePost'])->name('posts.like');
        Route::delete('/posts/{post}/like', [SocialController::class, 'unlikePost'])->name('posts.unlike');
        Route::post('/posts/{post}/comments', [SocialController::class, 'createComment'])->name('posts.comments.create');
        Route::delete('/comments/{comment}', [SocialController::class, 'deleteComment'])->name('comments.delete');

        // Friend management
        Route::post('/users/{user}/friend-request', [SocialController::class, 'sendFriendRequest'])->name('friend.request');
        Route::patch('/friendships/{friendship}/accept', [SocialController::class, 'acceptFriendRequest'])->name('friend.accept');

        // User profiles
        Route::get('/profile/{user}', [SocialController::class, 'profile'])->name('profile');
        Route::patch('/profile', [SocialController::class, 'updateProfile'])->name('profile.update');

        // Activity feed/notifications
        Route::get('/activities', [SocialController::class, 'activities'])->name('activities');
        Route::patch('/activities/read', [SocialController::class, 'markActivitiesAsRead'])->name('activities.read');

        // Friends management
        Route::prefix('friends')->name('friends.')->group(function () {
            Route::get('/', [SocialController::class, 'friendsIndex'])->name('index');
            Route::patch('/{user}/accept', [SocialController::class, 'acceptFriendRequest'])->name('accept');
            Route::delete('/{user}/decline', [SocialController::class, 'declineFriendRequest'])->name('decline');
            Route::delete('/{user}/cancel', [SocialController::class, 'cancelFriendRequest'])->name('cancel');
            Route::delete('/{user}/remove', [SocialController::class, 'removeFriend'])->name('remove');
        });

        // Messages
        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [SocialMessageController::class, 'index'])->name('index');
            Route::get('/new', [SocialMessageController::class, 'newMessage'])->name('new');
            Route::post('/start', [SocialMessageController::class, 'startConversation'])->name('start');
            Route::get('/{conversation}', [SocialMessageController::class, 'show'])->name('show');
            Route::post('/{conversation}', [SocialMessageController::class, 'sendMessage'])->name('send');
        });

        // Groups
        Route::prefix('groups')->name('groups.')->group(function () {
            Route::get('/', [SocialGroupController::class, 'index'])->name('index');
            Route::get('/create', [SocialGroupController::class, 'create'])->name('create');
            Route::post('/', [SocialGroupController::class, 'store'])->name('store');
            Route::get('/{group}', [SocialGroupController::class, 'show'])->name('show');
            Route::post('/{group}/join', [SocialGroupController::class, 'join'])->name('join');
            Route::delete('/{group}/leave', [SocialGroupController::class, 'leave'])->name('leave');

            // Group invitations
            Route::post('/{group}/invite', [SocialGroupController::class, 'invite'])->name('invite');
            Route::patch('/invitations/{invitation}/respond', [SocialGroupController::class, 'respondToInvitation'])->name('invitations.respond');
            Route::get('/search-users', [SocialGroupController::class, 'searchUsers'])->name('search.users');

            // Group posts
            Route::get('/{group}/posts', [SocialGroupPostController::class, 'index'])->name('posts.index');
            Route::post('/{group}/posts', [SocialGroupPostController::class, 'store'])->name('posts.store');
            Route::get('/{group}/posts/{post}', [SocialGroupPostController::class, 'show'])->name('posts.show');
            Route::patch('/{group}/posts/{post}', [SocialGroupPostController::class, 'update'])->name('posts.update');
            Route::delete('/{group}/posts/{post}', [SocialGroupPostController::class, 'destroy'])->name('posts.destroy');
            Route::patch('/{group}/posts/{post}/pin', [SocialGroupPostController::class, 'pin'])->name('posts.pin');
        });
    });

    // Ecommerce routes
    Route::get('/shop', [App\Http\Controllers\ProductController::class, 'discover'])->name('shop.discover')->withoutMiddleware(['auth', 'verified']);

    Route::prefix('stores')->name('stores.')->group(function () {
        // Public store list
        Route::get('/', [App\Http\Controllers\StoreController::class, 'index'])->name('index')->withoutMiddleware(['auth', 'verified']);

        // Authenticated store management (must come before /{slug} route)
        Route::get('/my-stores', [App\Http\Controllers\StoreController::class, 'myStores'])->name('my-stores');
        Route::get('/create', [App\Http\Controllers\StoreController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\StoreController::class, 'store'])->name('store');

        // Public store show (must come after specific routes) - uses slug for SEO-friendly URLs
        Route::get('/{slug}', [App\Http\Controllers\StoreController::class, 'show'])->name('show')->withoutMiddleware(['auth', 'verified']);

        // Store management routes with store ID parameter
        Route::get('/{store:id}/edit', [App\Http\Controllers\StoreController::class, 'edit'])->name('edit');
        Route::patch('/{store:id}', [App\Http\Controllers\StoreController::class, 'update'])->name('update');

        // Stripe Connect routes - use ID for authenticated operations
        Route::match(['get', 'post'], '/{store:id}/connect-stripe', [App\Http\Controllers\StoreController::class, 'connectStripe'])->name('connect-stripe');
        Route::get('/{store:id}/connect-return', [App\Http\Controllers\StoreController::class, 'connectReturn'])->name('connect-return')->withoutMiddleware(['auth', 'verified']);
        Route::get('/{store:id}/connect-refresh', [App\Http\Controllers\StoreController::class, 'connectRefresh'])->name('connect-refresh')->withoutMiddleware(['auth', 'verified']);
        Route::get('/{store:id}/stripe-dashboard', [App\Http\Controllers\StoreController::class, 'stripeDashboard'])->name('stripe-dashboard');
    });

    // Product routes - using store ID for authenticated routes
    Route::prefix('stores/{store:id}')->name('products.')->group(function () {
        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/products/create', [App\Http\Controllers\ProductController::class, 'create'])->name('create');
            Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('store');
        });

        Route::get('/products/{product:id}', [App\Http\Controllers\ProductController::class, 'show'])->name('show')->withoutMiddleware(['auth', 'verified']);

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/products/{product:id}/edit', [App\Http\Controllers\ProductController::class, 'edit'])->name('edit');
            Route::patch('/products/{product:id}', [App\Http\Controllers\ProductController::class, 'update'])->name('update');
            Route::delete('/products/{product:id}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('destroy');
        });
    });

    // Order routes
    Route::prefix('orders')->name('orders.')->middleware(['auth', 'verified'])->group(function () {
        Route::get('/', [App\Http\Controllers\OrderController::class, 'index'])->name('index');
        Route::get('/{order}', [App\Http\Controllers\OrderController::class, 'show'])->name('show');
        Route::patch('/{order}/status', [App\Http\Controllers\OrderController::class, 'updateStatus'])->name('update-status');
    });

    // Checkout routes
    Route::post('/checkout', [App\Http\Controllers\OrderController::class, 'checkout'])->name('checkout');
    Route::get('/checkout/success/{order}', [App\Http\Controllers\OrderController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/cancel/{order}', [App\Http\Controllers\OrderController::class, 'cancel'])->name('checkout.cancel');

    // Cart routes
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [App\Http\Controllers\CartController::class, 'index'])->name('index')->withoutMiddleware(['auth', 'verified']);
        Route::post('/add', [App\Http\Controllers\CartController::class, 'add'])->name('add')->withoutMiddleware(['auth', 'verified']);
        Route::patch('/{cartItem}', [App\Http\Controllers\CartController::class, 'update'])->name('update')->withoutMiddleware(['auth', 'verified']);
        Route::delete('/{cartItem}', [App\Http\Controllers\CartController::class, 'remove'])->name('remove')->withoutMiddleware(['auth', 'verified']);
        Route::delete('/', [App\Http\Controllers\CartController::class, 'clear'])->name('clear')->withoutMiddleware(['auth', 'verified']);
        Route::get('/count', [App\Http\Controllers\CartController::class, 'count'])->name('count')->withoutMiddleware(['auth', 'verified']);
    });

    // Cart API routes
    Route::get('/api/cart/items', [App\Http\Controllers\CartController::class, 'items'])->withoutMiddleware(['auth', 'verified']);
});

// Stripe webhook (public route, no auth/CSRF)
Route::post('/stripe/webhook', App\Http\Controllers\StripeWebhookController::class)->name('stripe.webhook');

require __DIR__.'/workspace.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
