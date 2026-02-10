<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

final class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        $this->command->newLine();

        // =====================================================================
        // PHASE 1: Foundation (Level 0)
        // =====================================================================
        $this->command->info('📋 Phase 1: Foundation Seeders');
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            TenantSeeder::class,
        ]);

        // =====================================================================
        // PHASE 2: Core Infrastructure (Level 1-2)
        // =====================================================================
        $this->command->info('📋 Phase 2: Core Infrastructure Seeders');
        $this->call([
            WorkspaceSeeder::class,
            RegionSeeder::class,
            RegionZipcodeSeeder::class,
            IndustrySeeder::class,
            WorkspaceMembershipSeeder::class,
            WorkspaceInvitationSeeder::class,
            AccountManagerSeeder::class,
            BusinessTemplateSeeder::class,
        ]);

        // =====================================================================
        // PHASE 3: Content Models (Level 3)
        // =====================================================================
        $this->command->info('📋 Phase 3: Content Model Seeders');
        $this->call([
            BusinessSeeder::class,
            SmbBusinessSeeder::class,
            VenueSeeder::class,
            PerformerSeeder::class,
            StoreSeeder::class,
            CommunitySeeder::class,
            HubSeeder::class,
            TagSeeder::class,
            CreatorProfileSeeder::class,
        ]);

        // =====================================================================
        // PHASE 4: Primary Content (Level 4)
        // =====================================================================
        $this->command->info('📋 Phase 4: Primary Content Seeders');
        $this->call([
            EventSeeder::class,
            DayNewsPostSeeder::class,
            NewsSeeder::class,
            NewsArticleSeeder::class,
            WriterAgentSeeder::class,
            NewsWorkflowSettingSeeder::class,
            NewsWorkflowRunSeeder::class,
            ProductSeeder::class,
            CustomerSeeder::class,
            BusinessHoursSeeder::class,
            BusinessPhotoSeeder::class,
            BusinessReviewSeeder::class,
            BusinessAttributeSeeder::class,
        ]);

        // =====================================================================
        // PHASE 5: User-Generated Content (Level 5)
        // =====================================================================
        $this->command->info('📋 Phase 5: User-Generated Content Seeders');
        $this->call([
            ArticleCommentSeeder::class,
            ArticleCommentLikeSeeder::class,
            CommentReportSeeder::class,
            ReviewSeeder::class,
            RatingSeeder::class,
            FollowSeeder::class,
            BookingSeeder::class,
            TicketPlanSeeder::class,
            TicketOrderSeeder::class,
            TicketOrderItemSeeder::class,
            TicketListingSeeder::class,
            TicketTransferSeeder::class,
            TicketGiftSeeder::class,
            PromoCodeSeeder::class,
            PromoCodeUsageSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,
            CartSeeder::class,
            CartItemSeeder::class,
            CommunityThreadSeeder::class,
            CommunityMemberSeeder::class,
            CommunityThreadReplySeeder::class,
            CommunityThreadViewSeeder::class,
            CommunityThreadReplyLikeSeeder::class,
            SocialSeeder::class,
            ConversationSeeder::class,
            MessageSeeder::class,
            DealSeeder::class,
            CampaignSeeder::class,
            CampaignRecipientSeeder::class,
            InteractionSeeder::class,
            TaskSeeder::class,
        ]);

        // =====================================================================
        // PHASE 6: Supporting Content (Level 6)
        // =====================================================================
        $this->command->info('📋 Phase 6: Supporting Content Seeders');
        $this->call([
            AnnouncementSeeder::class,
            ClassifiedSeeder::class,
            ClassifiedImageSeeder::class,
            ClassifiedPaymentSeeder::class,
            CouponSeeder::class,
            CouponUsageSeeder::class,
            PhotoAlbumSeeder::class,
            PhotoSeeder::class,
            LegalNoticeSeeder::class,
            MemorialSeeder::class,
            PodcastSeeder::class,
            PodcastEpisodeSeeder::class,
            CalendarSeeder::class,
            UpcomingShowSeeder::class,
            PlannedEventSeeder::class,
            HubSectionSeeder::class,
            HubMemberSeeder::class,
            HubRoleSeeder::class,
            HubAnalyticsSeeder::class,
            CheckInSeeder::class,
            AlphaSiteCommunitySeeder::class,
            BusinessSubscriptionSeeder::class,
            BusinessFaqSeeder::class,
            BusinessSurveySeeder::class,

            AchievementSeeder::class,
        ]);

        // =====================================================================
        // PHASE 7: System & Configuration (Level 7)
        // =====================================================================
        $this->command->info('📋 Phase 7: System & Configuration Seeders');
        $this->call([
            NotificationSeeder::class,
            NotificationSubscriptionSeeder::class,
            SocialAccountSeeder::class,
            EmailSubscriberSeeder::class,
            EmailCampaignSeeder::class,
            EmailTemplateSeeder::class,
            EmailSendSeeder::class,
            NewsletterSubscriptionSeeder::class,
            EmergencyAlertSeeder::class,
            EmergencySubscriptionSeeder::class,
            AdvertisementSeeder::class,
            AdCampaignSeeder::class,
            AdCreativeSeeder::class,
            AdPlacementSeeder::class,
            AdInventorySeeder::class,
            AdImpressionSeeder::class,
            AdClickSeeder::class,
            RssFeedSeeder::class,
            RssFeedItemSeeder::class,
            NewsFetchFrequencySeeder::class,
            NewsArticleDraftSeeder::class,
            NewsFactCheckSeeder::class,
            EventExtractionDraftSeeder::class,
            DayNewsPostPaymentSeeder::class,
            SearchHistorySeeder::class,
            SearchSuggestionSeeder::class,
            OrganizationRelationshipSeeder::class,
            OrganizationHierarchySeeder::class,
            CrossDomainAuthTokenSeeder::class,
            SMBCrmCustomerSeeder::class,
            SMBCrmInteractionSeeder::class,
            BusinessSurveyResponseSeeder::class,
        ]);

        // =====================================================================
        // E-commerce (already handled by EcommerceSeeder)
        // =====================================================================
        $this->command->info('📋 E-commerce Seeders');
        $this->call([
            EcommerceSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
    }
}
