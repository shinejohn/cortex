<?php

/**
 * Script to add basic DocBlocks to all API controllers
 * This adds @group tags and basic method documentation
 */

$controllers = [
    'UserController' => ['group' => 'Users', 'description' => 'User management endpoints'],
    'WorkspaceController' => ['group' => 'Workspaces', 'description' => 'Workspace management endpoints'],
    'WorkspaceMemberController' => ['group' => 'Workspaces', 'description' => 'Workspace member management'],
    'WorkspaceInvitationController' => ['group' => 'Workspaces', 'description' => 'Workspace invitation management'],
    'TenantController' => ['group' => 'Tenants', 'description' => 'Tenant management endpoints'],
    'RegionController' => ['group' => 'Regions', 'description' => 'Region management endpoints'],
    'TagController' => ['group' => 'Tags', 'description' => 'Tag management endpoints'],
    'CommentController' => ['group' => 'Comments', 'description' => 'Comment management endpoints'],
    'EventController' => ['group' => 'Events', 'description' => 'Event management endpoints'],
    'VenueController' => ['group' => 'Venues', 'description' => 'Venue management endpoints'],
    'PerformerController' => ['group' => 'Performers', 'description' => 'Performer management endpoints'],
    'NewsArticleController' => ['group' => 'News Articles', 'description' => 'News article management endpoints'],
    'AnnouncementController' => ['group' => 'Announcements', 'description' => 'Announcement management endpoints'],
    'ClassifiedController' => ['group' => 'Classifieds', 'description' => 'Classified ad management endpoints'],
    'CouponController' => ['group' => 'Coupons', 'description' => 'Coupon management endpoints'],
    'LegalNoticeController' => ['group' => 'Legal Notices', 'description' => 'Legal notice management endpoints'],
    'MemorialController' => ['group' => 'Memorials', 'description' => 'Memorial management endpoints'],
    'PhotoController' => ['group' => 'Photos', 'description' => 'Photo management endpoints'],
    'PhotoAlbumController' => ['group' => 'Photo Albums', 'description' => 'Photo album management endpoints'],
    'PodcastController' => ['group' => 'Podcasts', 'description' => 'Podcast management endpoints'],
    'PodcastEpisodeController' => ['group' => 'Podcasts', 'description' => 'Podcast episode management endpoints'],
    'BusinessController' => ['group' => 'Businesses', 'description' => 'Business management endpoints'],
    'SocialPostController' => ['group' => 'Social', 'description' => 'Social post management endpoints'],
    'SocialGroupController' => ['group' => 'Social', 'description' => 'Social group management endpoints'],
    'CommunityController' => ['group' => 'Communities', 'description' => 'Community management endpoints'],
    'CommunityThreadController' => ['group' => 'Communities', 'description' => 'Community thread management endpoints'],
    'ConversationController' => ['group' => 'Messaging', 'description' => 'Conversation management endpoints'],
    'MessageController' => ['group' => 'Messaging', 'description' => 'Message management endpoints'],
    'StoreController' => ['group' => 'E-commerce', 'description' => 'Store management endpoints'],
    'ProductController' => ['group' => 'E-commerce', 'description' => 'Product management endpoints'],
    'CartController' => ['group' => 'E-commerce', 'description' => 'Shopping cart management endpoints'],
    'OrderController' => ['group' => 'E-commerce', 'description' => 'Order management endpoints'],
    'TicketPlanController' => ['group' => 'Ticketing', 'description' => 'Ticket plan management endpoints'],
    'TicketOrderController' => ['group' => 'Ticketing', 'description' => 'Ticket order management endpoints'],
    'PromoCodeController' => ['group' => 'Promo Codes', 'description' => 'Promo code management endpoints'],
    'CalendarController' => ['group' => 'Calendars', 'description' => 'Calendar management endpoints'],
    'HubController' => ['group' => 'Hubs', 'description' => 'Hub management endpoints'],
    'AdvertisementController' => ['group' => 'Advertising', 'description' => 'Advertisement management endpoints'],
    'EmailCampaignController' => ['group' => 'Email Marketing', 'description' => 'Email campaign management endpoints'],
    'EmergencyAlertController' => ['group' => 'Emergency Alerts', 'description' => 'Emergency alert management endpoints'],
    'SearchController' => ['group' => 'Search', 'description' => 'Search endpoints'],
];

echo "DocBlocks helper script created. Use this as a reference when adding DocBlocks manually.\n";
echo "Total controllers to document: " . count($controllers) . "\n";


