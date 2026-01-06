# Complete Database Schema Documentation

**Generated:** 2025-12-29 19:51:56

**Total Migrations:** 123

**Database:** PostgreSQL

---

## Table Index

This document contains schema information for all database tables.

**Total Tables:** 164+

### By Category

#### Authentication & Users

- [`users`](#table-users)
- [`password_reset_tokens`](#table-password_reset_tokens)
- [`sessions`](#table-sessions)
- [`social_accounts`](#table-social_accounts)
- [`magic_links`](#table-magic_links)
- [`cross_domain_auth_tokens`](#table-cross_domain_auth_tokens)

#### Workspaces & Multi-tenancy

- [`workspaces`](#table-workspaces)
- [`workspace_memberships`](#table-workspace_memberships)
- [`workspace_invitations`](#table-workspace_invitations)
- [`roles`](#table-roles)
- [`tenants`](#table-tenants)
- [`account_managers`](#table-account_managers)

#### Publishing - Articles

- [`day_news_posts`](#table-day_news_posts)
- [`day_news_post_payments`](#table-day_news_post_payments)
- [`day_news_post_tag`](#table-day_news_post_tag)
- [`day_news_post_region`](#table-day_news_post_region)
- [`article_comments`](#table-article_comments)
- [`article_comment_likes`](#table-article_comment_likes)
- [`tags`](#table-tags)

#### Publishing - News Workflow

- [`news_articles`](#table-news_articles)
- [`news_article_drafts`](#table-news_article_drafts)
- [`news_fact_checks`](#table-news_fact_checks)
- [`news_workflow_runs`](#table-news_workflow_runs)
- [`news_workflow_settings`](#table-news_workflow_settings)
- [`news_fetch_frequencies`](#table-news_fetch_frequencies)
- [`writer_agents`](#table-writer_agents)
- [`writer_agent_region`](#table-writer_agent_region)

#### Publishing - Content

- [`announcements`](#table-announcements)
- [`announcement_region`](#table-announcement_region)
- [`classifieds`](#table-classifieds)
- [`classified_images`](#table-classified_images)
- [`classified_region`](#table-classified_region)
- [`classified_payments`](#table-classified_payments)
- [`coupons`](#table-coupons)
- [`coupon_region`](#table-coupon_region)
- [`coupon_usages`](#table-coupon_usages)
- [`legal_notices`](#table-legal_notices)
- [`legal_notice_region`](#table-legal_notice_region)
- [`memorials`](#table-memorials)
- [`memorial_region`](#table-memorial_region)

#### Publishing - Media

- [`photos`](#table-photos)
- [`photo_albums`](#table-photo_albums)
- [`photo_album_photo`](#table-photo_album_photo)
- [`photo_region`](#table-photo_region)
- [`podcasts`](#table-podcasts)
- [`podcast_episodes`](#table-podcast_episodes)
- [`podcast_region`](#table-podcast_region)
- [`creator_profiles`](#table-creator_profiles)

#### Events & Venues

- [`events`](#table-events)
- [`event_region`](#table-event_region)
- [`event_extraction_drafts`](#table-event_extraction_drafts)
- [`venues`](#table-venues)
- [`performers`](#table-performers)
- [`bookings`](#table-bookings)
- [`upcoming_shows`](#table-upcoming_shows)
- [`planned_events`](#table-planned_events)

#### Tickets

- [`ticket_plans`](#table-ticket_plans)
- [`ticket_orders`](#table-ticket_orders)
- [`ticket_order_items`](#table-ticket_order_items)
- [`ticket_listings`](#table-ticket_listings)
- [`ticket_transfers`](#table-ticket_transfers)
- [`ticket_gifts`](#table-ticket_gifts)
- [`promo_codes`](#table-promo_codes)
- [`promo_code_usages`](#table-promo_code_usages)

#### Social Features

- [`social_posts`](#table-social_posts)
- [`social_post_likes`](#table-social_post_likes)
- [`social_post_comments`](#table-social_post_comments)
- [`social_comment_likes`](#table-social_comment_likes)
- [`social_post_shares`](#table-social_post_shares)
- [`social_friendships`](#table-social_friendships)
- [`social_groups`](#table-social_groups)
- [`social_group_members`](#table-social_group_members)
- [`social_group_posts`](#table-social_group_posts)
- [`social_user_profiles`](#table-social_user_profiles)
- [`social_user_follows`](#table-social_user_follows)
- [`social_group_invitations`](#table-social_group_invitations)
- [`social_activities`](#table-social_activities)

#### Community

- [`communities`](#table-communities)
- [`community_threads`](#table-community_threads)
- [`community_thread_views`](#table-community_thread_views)
- [`community_members`](#table-community_members)
- [`community_thread_replies`](#table-community_thread_replies)
- [`community_thread_reply_likes`](#table-community_thread_reply_likes)
- [`alphasite_communities`](#table-alphasite_communities)

#### Messaging

- [`conversations`](#table-conversations)
- [`conversation_participants`](#table-conversation_participants)
- [`messages`](#table-messages)

#### Notifications

- [`notifications`](#table-notifications)
- [`notification_subscriptions`](#table-notification_subscriptions)
- [`notification_log`](#table-notification_log)
- [`phone_verifications`](#table-phone_verifications)

#### Business Directory

- [`businesses`](#table-businesses)
- [`business_region`](#table-business_region)
- [`business_subscriptions`](#table-business_subscriptions)
- [`business_templates`](#table-business_templates)
- [`business_faqs`](#table-business_faqs)
- [`business_surveys`](#table-business_surveys)
- [`business_survey_responses`](#table-business_survey_responses)
- [`achievements`](#table-achievements)

#### CRM - Core

- [`smb_businesses`](#table-smb_businesses)
- [`customers`](#table-customers)
- [`deals`](#table-deals)
- [`campaigns`](#table-campaigns)
- [`campaign_recipients`](#table-campaign_recipients)
- [`interactions`](#table-interactions)
- [`tasks`](#table-tasks)

#### CRM - Business Details

- [`business_hours`](#table-business_hours)
- [`business_photos`](#table-business_photos)
- [`business_reviews`](#table-business_reviews)
- [`business_attributes`](#table-business_attributes)

#### E-commerce

- [`stores`](#table-stores)
- [`products`](#table-products)
- [`orders`](#table-orders)
- [`order_items`](#table-order_items)
- [`carts`](#table-carts)
- [`cart_items`](#table-cart_items)

#### Calendars

- [`calendars`](#table-calendars)
- [`calendar_followers`](#table-calendar_followers)
- [`calendar_roles`](#table-calendar_roles)
- [`calendar_events`](#table-calendar_events)

#### Hubs

- [`hubs`](#table-hubs)
- [`hub_sections`](#table-hub_sections)
- [`hub_members`](#table-hub_members)
- [`hub_roles`](#table-hub_roles)
- [`hub_analytics`](#table-hub_analytics)
- [`check_ins`](#table-check_ins)

#### Regions & Location

- [`regions`](#table-regions)
- [`region_zipcodes`](#table-region_zipcodes)

#### Search

- [`search_history`](#table-search_history)
- [`search_suggestions`](#table-search_suggestions)

#### Follows & Engagement

- [`follows`](#table-follows)
- [`comment_reports`](#table-comment_reports)

#### RSS Integration

- [`rss_feeds`](#table-rss_feeds)
- [`rss_feed_items`](#table-rss_feed_items)

#### Organizations

- [`organization_relationships`](#table-organization_relationships)
- [`organization_hierarchies`](#table-organization_hierarchies)

#### Reviews & Ratings

- [`reviews`](#table-reviews)
- [`ratings`](#table-ratings)

#### Advertising

- [`advertisements`](#table-advertisements)
- [`ad_campaigns`](#table-ad_campaigns)
- [`ad_creatives`](#table-ad_creatives)
- [`ad_placements`](#table-ad_placements)
- [`ad_inventory`](#table-ad_inventory)
- [`ad_impressions`](#table-ad_impressions)
- [`ad_clicks`](#table-ad_clicks)

#### Email Marketing

- [`email_subscribers`](#table-email_subscribers)
- [`email_campaigns`](#table-email_campaigns)
- [`email_sends`](#table-email_sends)
- [`email_templates`](#table-email_templates)
- [`newsletter_subscriptions`](#table-newsletter_subscriptions)

#### Emergency Alerts

- [`emergency_alerts`](#table-emergency_alerts)
- [`emergency_subscriptions`](#table-emergency_subscriptions)
- [`emergency_audit_log`](#table-emergency_audit_log)
- [`emergency_deliveries`](#table-emergency_deliveries)
- [`municipal_partners`](#table-municipal_partners)

#### System

- [`cache`](#table-cache)
- [`cache_locks`](#table-cache_locks)
- [`jobs`](#table-jobs)
- [`job_batches`](#table-job_batches)
- [`failed_jobs`](#table-failed_jobs)
- [`credits`](#table-credits)

---

## Table: `users`

**Category:** Authentication & Users

**Migration:** `0001_01_01_000000_create_users_table.php`

**Alterations:**
- `2025_01_15_000011_add_author_fields_to_users_table.php`
- `2025_01_15_000011_add_author_fields_to_users_table.php`
- `2025_05_03_154707_create_workspaces_table.php`
- `2025_05_03_154707_create_workspaces_table.php`
- `2025_09_23_191514_create_social_features_tables.php`
- `2025_09_23_191514_create_social_features_tables.php`
- `2025_11_04_210911_add_author_fields_to_users_table.php`
- `2025_11_04_210911_add_author_fields_to_users_table.php`
- `2025_12_27_185918_add_tenant_id_to_users_table.php`
- `2025_12_27_185918_add_tenant_id_to_users_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000000_create_users_table.php`

---

## Table: `password_reset_tokens`

**Category:** Authentication & Users

**Migration:** `0001_01_01_000000_create_users_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000000_create_users_table.php`

---

## Table: `sessions`

**Category:** Authentication & Users

**Migration:** `0001_01_01_000000_create_users_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000000_create_users_table.php`

---

## Table: `cache`

**Category:** System

**Migration:** `0001_01_01_000001_create_cache_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000001_create_cache_table.php`

---

## Table: `cache_locks`

**Category:** System

**Migration:** `0001_01_01_000001_create_cache_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000001_create_cache_table.php`

---

## Table: `jobs`

**Category:** System

**Migration:** `0001_01_01_000002_create_jobs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000002_create_jobs_table.php`

---

## Table: `job_batches`

**Category:** System

**Migration:** `0001_01_01_000002_create_jobs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000002_create_jobs_table.php`

---

## Table: `failed_jobs`

**Category:** System

**Migration:** `0001_01_01_000002_create_jobs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/0001_01_01_000002_create_jobs_table.php`

---

## Table: `magic_links`

**Category:** Authentication & Users

**Migration:** `2017_07_06_000000_create_table_magic_links.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2017_07_06_000000_create_table_magic_links.php`

---

## Table: `article_comments`

**Category:** Publishing - Articles

**Migration:** `2025_01_15_000003_create_article_comments_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000003_create_article_comments_table.php`

---

## Table: `article_comment_likes`

**Category:** Publishing - Articles

**Migration:** `2025_01_15_000003_create_article_comments_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000003_create_article_comments_table.php`

---

## Table: `tags`

**Category:** Publishing - Articles

**Migration:** `2025_01_15_000004_create_tags_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000004_create_tags_table.php`

---

## Table: `day_news_post_tag`

**Category:** Publishing - Articles

**Migration:** `2025_01_15_000004_create_tags_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000004_create_tags_table.php`

---

## Table: `search_history`

**Category:** Search

**Migration:** `2025_01_15_000005_create_search_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000005_create_search_tables.php`

---

## Table: `search_suggestions`

**Category:** Search

**Migration:** `2025_01_15_000005_create_search_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000005_create_search_tables.php`

---

## Table: `comment_reports`

**Category:** Follows & Engagement

**Migration:** `2025_01_15_000006_create_comment_reports_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000006_create_comment_reports_table.php`

---

## Table: `announcements`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000007_create_announcements_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000007_create_announcements_table.php`

---

## Table: `announcement_region`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000007_create_announcements_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000007_create_announcements_table.php`

---

## Table: `classifieds`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000008_create_classifieds_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000008_create_classifieds_tables.php`

---

## Table: `classified_images`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000008_create_classifieds_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000008_create_classifieds_tables.php`

---

## Table: `classified_region`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000008_create_classifieds_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000008_create_classifieds_tables.php`

---

## Table: `classified_payments`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000008_create_classifieds_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000008_create_classifieds_tables.php`

---

## Table: `coupons`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000009_create_coupons_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000009_create_coupons_table.php`

---

## Table: `coupon_region`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000009_create_coupons_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000009_create_coupons_table.php`

---

## Table: `coupon_usages`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000009_create_coupons_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000009_create_coupons_table.php`

---

## Table: `photo_albums`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000010_create_photos_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000010_create_photos_tables.php`

---

## Table: `photos`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000010_create_photos_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000010_create_photos_tables.php`

---

## Table: `photo_album_photo`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000010_create_photos_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000010_create_photos_tables.php`

---

## Table: `photo_region`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000010_create_photos_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000010_create_photos_tables.php`

---

## Table: `legal_notices`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000012_create_legal_notices_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000012_create_legal_notices_table.php`

---

## Table: `legal_notice_region`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000012_create_legal_notices_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000012_create_legal_notices_table.php`

---

## Table: `memorials`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000013_create_memorials_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000013_create_memorials_table.php`

---

## Table: `memorial_region`

**Category:** Publishing - Content

**Migration:** `2025_01_15_000013_create_memorials_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000013_create_memorials_table.php`

---

## Table: `creator_profiles`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000014_create_podcasts_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000014_create_podcasts_tables.php`

---

## Table: `podcasts`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000014_create_podcasts_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000014_create_podcasts_tables.php`

---

## Table: `podcast_episodes`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000014_create_podcasts_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000014_create_podcasts_tables.php`

---

## Table: `podcast_region`

**Category:** Publishing - Media

**Migration:** `2025_01_15_000014_create_podcasts_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_01_15_000014_create_podcasts_tables.php`

---

## Table: `social_accounts`

**Category:** Authentication & Users

**Migration:** `2025_05_03_144545_create_social_accounts_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_05_03_144545_create_social_accounts_table.php`

---

## Table: `workspaces`

**Category:** Workspaces & Multi-tenancy

**Migration:** `2025_05_03_154707_create_workspaces_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_05_03_154707_create_workspaces_table.php`

---

## Table: `roles`

**Category:** Workspaces & Multi-tenancy

**Migration:** `2025_05_03_154707_create_workspaces_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_05_03_154707_create_workspaces_table.php`

---

## Table: `workspace_memberships`

**Category:** Workspaces & Multi-tenancy

**Migration:** `2025_05_03_154707_create_workspaces_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_05_03_154707_create_workspaces_table.php`

---

## Table: `workspace_invitations`

**Category:** Workspaces & Multi-tenancy

**Migration:** `2025_07_16_171440_create_workspace_invitations_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_07_16_171440_create_workspace_invitations_table.php`

---

## Table: `credits`

**Category:** System

**Migration:** `2025_08_22_192832_create_credits_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_08_22_192832_create_credits_table.php`

---

## Table: `venues`

**Category:** Events & Venues

**Migration:** `2025_09_15_160356_create_venues_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_160356_create_venues_table.php`

---

## Table: `performers`

**Category:** Events & Venues

**Migration:** `2025_09_15_160414_create_performers_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_160414_create_performers_table.php`

---

## Table: `events`

**Category:** Events & Venues

**Migration:** `2025_09_15_160428_create_events_table.php`

**Alterations:**
- `2025_11_26_201944_add_event_extraction_support.php`
- `2025_11_26_201944_add_event_extraction_support.php`
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_12_20_142746_create_hubs_table.php`
- `2025_12_20_142746_create_hubs_table.php`
- `2025_12_28_011832_add_slug_to_events_table.php`
- `2025_12_28_011832_add_slug_to_events_table.php`
- `2025_12_28_011850_add_image_fields_to_events_table.php`
- `2025_12_28_011850_add_image_fields_to_events_table.php`
- `2025_12_28_011852_add_source_fields_to_events_table.php`
- `2025_12_28_011852_add_source_fields_to_events_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_160428_create_events_table.php`

---

## Table: `bookings`

**Category:** Events & Venues

**Migration:** `2025_09_15_160437_create_bookings_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_160437_create_bookings_table.php`

---

## Table: `upcoming_shows`

**Category:** Events & Venues

**Migration:** `2025_09_15_160601_create_upcoming_shows_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_160601_create_upcoming_shows_table.php`

---

## Table: `reviews`

**Category:** Reviews & Ratings

**Migration:** `2025_09_15_163335_create_reviews_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_163335_create_reviews_table.php`

---

## Table: `ratings`

**Category:** Reviews & Ratings

**Migration:** `2025_09_15_163344_create_ratings_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_15_163344_create_ratings_table.php`

---

## Table: `communities`

**Category:** Community

**Migration:** `2025_09_18_153847_create_community_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_18_153847_create_community_system_tables.php`

---

## Table: `community_threads`

**Category:** Community

**Migration:** `2025_09_18_153847_create_community_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_18_153847_create_community_system_tables.php`

---

## Table: `community_thread_views`

**Category:** Community

**Migration:** `2025_09_18_153847_create_community_system_tables.php`

**Alterations:**
- `2025_09_18_153847_create_community_system_tables.php`
- `2025_09_18_153847_create_community_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_18_153847_create_community_system_tables.php`

---

## Table: `community_members`

**Category:** Community

**Migration:** `2025_09_18_153847_create_community_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_18_153847_create_community_system_tables.php`

---

## Table: `community_thread_replies`

**Category:** Community

**Migration:** `2025_09_18_153847_create_community_system_tables.php`

**Alterations:**
- `2025_09_18_153847_create_community_system_tables.php`
- `2025_09_18_153847_create_community_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_18_153847_create_community_system_tables.php`

---

## Table: `community_thread_reply_likes`

**Category:** Community

**Migration:** `2025_09_18_153847_create_community_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_18_153847_create_community_system_tables.php`

---

## Table: `social_posts`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_post_likes`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_post_comments`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

**Alterations:**
- `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_comment_likes`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_post_shares`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_friendships`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_groups`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_group_members`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_group_posts`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_user_profiles`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_user_follows`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_group_invitations`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `social_activities`

**Category:** Social Features

**Migration:** `2025_09_23_191514_create_social_features_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_23_191514_create_social_features_tables.php`

---

## Table: `notifications`

**Category:** Notifications

**Migration:** `2025_09_25_124919_create_notifications_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_25_124919_create_notifications_table.php`

---

## Table: `conversations`

**Category:** Messaging

**Migration:** `2025_09_25_135743_create_messaging_system.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_25_135743_create_messaging_system.php`

---

## Table: `conversation_participants`

**Category:** Messaging

**Migration:** `2025_09_25_135743_create_messaging_system.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_25_135743_create_messaging_system.php`

---

## Table: `messages`

**Category:** Messaging

**Migration:** `2025_09_25_135743_create_messaging_system.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_25_135743_create_messaging_system.php`

---

## Table: `ticket_plans`

**Category:** Tickets

**Migration:** `2025_09_26_222707_create_ticket_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_26_222707_create_ticket_system_tables.php`

---

## Table: `ticket_orders`

**Category:** Tickets

**Migration:** `2025_09_26_222707_create_ticket_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_26_222707_create_ticket_system_tables.php`

---

## Table: `ticket_order_items`

**Category:** Tickets

**Migration:** `2025_09_26_222707_create_ticket_system_tables.php`

**Alterations:**
- `2025_12_20_182429_add_qr_code_to_ticket_order_items_table.php`
- `2025_12_20_182429_add_qr_code_to_ticket_order_items_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_26_222707_create_ticket_system_tables.php`

---

## Table: `follows`

**Category:** Follows & Engagement

**Migration:** `2025_09_30_144841_create_follows_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_09_30_144841_create_follows_table.php`

---

## Table: `stores`

**Category:** E-commerce

**Migration:** `2025_10_02_175440_create_stores_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_02_175440_create_stores_table.php`

---

## Table: `products`

**Category:** E-commerce

**Migration:** `2025_10_02_175440_create_stores_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_02_175440_create_stores_table.php`

---

## Table: `orders`

**Category:** E-commerce

**Migration:** `2025_10_02_175440_create_stores_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_02_175440_create_stores_table.php`

---

## Table: `order_items`

**Category:** E-commerce

**Migration:** `2025_10_02_175440_create_stores_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_02_175440_create_stores_table.php`

---

## Table: `carts`

**Category:** E-commerce

**Migration:** `2025_10_02_211800_create_carts_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_02_211800_create_carts_table.php`

---

## Table: `cart_items`

**Category:** E-commerce

**Migration:** `2025_10_02_211800_create_carts_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_02_211800_create_carts_table.php`

---

## Table: `calendars`

**Category:** Calendars

**Migration:** `2025_10_06_143426_create_calendars_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_06_143426_create_calendars_table.php`

---

## Table: `calendar_followers`

**Category:** Calendars

**Migration:** `2025_10_06_143426_create_calendars_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_06_143426_create_calendars_table.php`

---

## Table: `calendar_roles`

**Category:** Calendars

**Migration:** `2025_10_06_143426_create_calendars_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_06_143426_create_calendars_table.php`

---

## Table: `calendar_events`

**Category:** Calendars

**Migration:** `2025_10_06_143426_create_calendars_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_06_143426_create_calendars_table.php`

---

## Table: `regions`

**Category:** Regions & Location

**Migration:** `2025_10_28_134749_create_region_news_system_tables.php`

**Alterations:**
- `2025_10_28_134749_create_region_news_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_28_134749_create_region_news_system_tables.php`

---

## Table: `region_zipcodes`

**Category:** Regions & Location

**Migration:** `2025_10_28_134749_create_region_news_system_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_10_28_134749_create_region_news_system_tables.php`

---

## Table: `day_news_posts`

**Category:** Publishing - Articles

**Migration:** `2025_11_04_210900_create_day_news_tables.php`

**Alterations:**
- `2025_11_04_210901_add_reviews_and_ratings_to_day_news_posts_table.php`
- `2025_11_04_210901_add_reviews_and_ratings_to_day_news_posts_table.php`
- `2025_11_17_105200_create_n8n_rss_integration_tables.php`
- `2025_11_17_105200_create_n8n_rss_integration_tables.php`
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_12_16_112702_create_writer_agents_table.php`
- `2025_12_16_112702_create_writer_agents_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_04_210900_create_day_news_tables.php`

---

## Table: `day_news_post_payments`

**Category:** Publishing - Articles

**Migration:** `2025_11_04_210900_create_day_news_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_04_210900_create_day_news_tables.php`

---

## Table: `advertisements`

**Category:** Advertising

**Migration:** `2025_11_04_210900_create_day_news_tables.php`

**Alterations:**
- `2025_12_23_152656_add_alphasite_and_local_voices_to_advertisements_platform_enum.php`
- `2025_12_23_152656_add_alphasite_and_local_voices_to_advertisements_platform_enum.php`
- `2025_12_23_152656_add_alphasite_and_local_voices_to_advertisements_platform_enum.php`
- `2025_12_23_152656_add_alphasite_and_local_voices_to_advertisements_platform_enum.php`
- `2025_12_23_152656_add_alphasite_and_local_voices_to_advertisements_platform_enum.php`
- `2025_12_23_152656_add_alphasite_and_local_voices_to_advertisements_platform_enum.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_04_210900_create_day_news_tables.php`

---

## Table: `day_news_post_region`

**Category:** Publishing - Articles

**Migration:** `2025_11_04_210900_create_day_news_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_04_210900_create_day_news_tables.php`

---

## Table: `businesses`

**Category:** Business Directory

**Migration:** `2025_11_17_105200_create_n8n_rss_integration_tables.php`

**Alterations:**
- `2025_12_20_000001_add_organization_fields_to_businesses_table.php`
- `2025_12_20_000001_add_organization_fields_to_businesses_table.php`
- `2025_12_22_143034_add_alphasite_fields_to_businesses_table.php`
- `2025_12_22_143034_add_alphasite_fields_to_businesses_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_17_105200_create_n8n_rss_integration_tables.php`

---

## Table: `business_region`

**Category:** Business Directory

**Migration:** `2025_11_17_105200_create_n8n_rss_integration_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_17_105200_create_n8n_rss_integration_tables.php`

---

## Table: `rss_feeds`

**Category:** RSS Integration

**Migration:** `2025_11_17_105200_create_n8n_rss_integration_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_17_105200_create_n8n_rss_integration_tables.php`

---

## Table: `rss_feed_items`

**Category:** RSS Integration

**Migration:** `2025_11_17_105200_create_n8n_rss_integration_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_17_105200_create_n8n_rss_integration_tables.php`

---

## Table: `news_articles`

**Category:** Publishing - News Workflow

**Migration:** `2025_11_25_123429_create_news_workflow_tables.php`

**Alterations:**
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_11_27_124219_add_news_feature_enhancements.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_25_123429_create_news_workflow_tables.php`

---

## Table: `news_article_drafts`

**Category:** Publishing - News Workflow

**Migration:** `2025_11_25_123429_create_news_workflow_tables.php`

**Alterations:**
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_11_27_124219_add_news_feature_enhancements.php`
- `2025_12_12_174756_extend_featured_image_url_length.php`
- `2025_12_12_174756_extend_featured_image_url_length.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_25_123429_create_news_workflow_tables.php`

---

## Table: `news_fact_checks`

**Category:** Publishing - News Workflow

**Migration:** `2025_11_25_123429_create_news_workflow_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_25_123429_create_news_workflow_tables.php`

---

## Table: `news_workflow_runs`

**Category:** Publishing - News Workflow

**Migration:** `2025_11_25_123429_create_news_workflow_tables.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_25_123429_create_news_workflow_tables.php`

---

## Table: `event_region`

**Category:** Events & Venues

**Migration:** `2025_11_26_201944_add_event_extraction_support.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_26_201944_add_event_extraction_support.php`

---

## Table: `event_extraction_drafts`

**Category:** Events & Venues

**Migration:** `2025_11_26_201944_add_event_extraction_support.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_11_26_201944_add_event_extraction_support.php`

---

## Table: `news_fetch_frequencies`

**Category:** Publishing - News Workflow

**Migration:** `2025_12_10_215831_create_news_fetch_frequencies_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_10_215831_create_news_fetch_frequencies_table.php`

---

## Table: `news_workflow_settings`

**Category:** Publishing - News Workflow

**Migration:** `2025_12_11_163649_create_news_workflow_settings_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_11_163649_create_news_workflow_settings_table.php`

---

## Table: `writer_agents`

**Category:** Publishing - News Workflow

**Migration:** `2025_12_16_112702_create_writer_agents_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_16_112702_create_writer_agents_table.php`

---

## Table: `writer_agent_region`

**Category:** Publishing - News Workflow

**Migration:** `2025_12_16_112702_create_writer_agents_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_16_112702_create_writer_agents_table.php`

---

## Table: `organization_relationships`

**Category:** Organizations

**Migration:** `2025_12_20_000002_create_organization_relationships_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_000002_create_organization_relationships_table.php`

---

## Table: `organization_hierarchies`

**Category:** Organizations

**Migration:** `2025_12_20_000003_create_organization_hierarchies_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_000003_create_organization_hierarchies_table.php`

---

## Table: `hubs`

**Category:** Hubs

**Migration:** `2025_12_20_142746_create_hubs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142746_create_hubs_table.php`

---

## Table: `hub_sections`

**Category:** Hubs

**Migration:** `2025_12_20_142746_create_hubs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142746_create_hubs_table.php`

---

## Table: `hub_members`

**Category:** Hubs

**Migration:** `2025_12_20_142746_create_hubs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142746_create_hubs_table.php`

---

## Table: `hub_roles`

**Category:** Hubs

**Migration:** `2025_12_20_142746_create_hubs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142746_create_hubs_table.php`

---

## Table: `hub_analytics`

**Category:** Hubs

**Migration:** `2025_12_20_142746_create_hubs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142746_create_hubs_table.php`

---

## Table: `check_ins`

**Category:** Hubs

**Migration:** `2025_12_20_142758_create_check_ins_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142758_create_check_ins_table.php`

---

## Table: `planned_events`

**Category:** Events & Venues

**Migration:** `2025_12_20_142759_create_planned_events_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142759_create_planned_events_table.php`

---

## Table: `promo_codes`

**Category:** Tickets

**Migration:** `2025_12_20_142800_create_promo_codes_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142800_create_promo_codes_table.php`

---

## Table: `promo_code_usages`

**Category:** Tickets

**Migration:** `2025_12_20_142800_create_promo_codes_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142800_create_promo_codes_table.php`

---

## Table: `ticket_listings`

**Category:** Tickets

**Migration:** `2025_12_20_142801_create_ticket_listings_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142801_create_ticket_listings_table.php`

---

## Table: `ticket_transfers`

**Category:** Tickets

**Migration:** `2025_12_20_142801_create_ticket_transfers_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142801_create_ticket_transfers_table.php`

---

## Table: `ticket_gifts`

**Category:** Tickets

**Migration:** `2025_12_20_142802_create_ticket_gifts_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_20_142802_create_ticket_gifts_table.php`

---

## Table: `industries`

**Category:** Other

**Migration:** `2025_12_22_143009_create_industries_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143009_create_industries_table.php`

---

## Table: `business_templates`

**Category:** Business Directory

**Migration:** `2025_12_22_143016_create_business_templates_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143016_create_business_templates_table.php`

---

## Table: `business_subscriptions`

**Category:** Business Directory

**Migration:** `2025_12_22_143020_create_business_subscriptions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143020_create_business_subscriptions_table.php`

---

## Table: `alphasite_communities`

**Category:** Community

**Migration:** `2025_12_22_143022_create_alphasite_communities_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143022_create_alphasite_communities_table.php`

---

## Table: `smb_crm_customers`

**Category:** Other

**Migration:** `2025_12_22_143025_create_smb_crm_customers_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143025_create_smb_crm_customers_table.php`

---

## Table: `smb_crm_interactions`

**Category:** Other

**Migration:** `2025_12_22_143028_create_smb_crm_interactions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143028_create_smb_crm_interactions_table.php`

---

## Table: `business_faqs`

**Category:** Business Directory

**Migration:** `2025_12_22_143030_create_business_faqs_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143030_create_business_faqs_table.php`

---

## Table: `business_surveys`

**Category:** Business Directory

**Migration:** `2025_12_22_143032_create_business_surveys_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143032_create_business_surveys_table.php`

---

## Table: `business_survey_responses`

**Category:** Business Directory

**Migration:** `2025_12_22_143032_create_business_surveys_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143032_create_business_surveys_table.php`

---

## Table: `achievements`

**Category:** Business Directory

**Migration:** `2025_12_22_143036_create_achievements_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_143036_create_achievements_table.php`

---

## Table: `cross_domain_auth_tokens`

**Category:** Authentication & Users

**Migration:** `2025_12_22_174842_create_cross_domain_auth_tokens_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_22_174842_create_cross_domain_auth_tokens_table.php`

---

## Table: `ad_campaigns`

**Category:** Advertising

**Migration:** `2025_12_23_200943_create_ad_campaigns_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_200943_create_ad_campaigns_table.php`

---

## Table: `ad_creatives`

**Category:** Advertising

**Migration:** `2025_12_23_200945_create_ad_creatives_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_200945_create_ad_creatives_table.php`

---

## Table: `ad_placements`

**Category:** Advertising

**Migration:** `2025_12_23_200947_create_ad_placements_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_200947_create_ad_placements_table.php`

---

## Table: `ad_inventory`

**Category:** Advertising

**Migration:** `2025_12_23_200950_create_ad_inventory_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_200950_create_ad_inventory_table.php`

---

## Table: `ad_impressions`

**Category:** Advertising

**Migration:** `2025_12_23_200952_create_ad_impressions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_200952_create_ad_impressions_table.php`

---

## Table: `ad_clicks`

**Category:** Advertising

**Migration:** `2025_12_23_200954_create_ad_clicks_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_200954_create_ad_clicks_table.php`

---

## Table: `email_subscribers`

**Category:** Email Marketing

**Migration:** `2025_12_23_201529_create_email_subscribers_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201529_create_email_subscribers_table.php`

---

## Table: `email_campaigns`

**Category:** Email Marketing

**Migration:** `2025_12_23_201530_create_email_campaigns_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201530_create_email_campaigns_table.php`

---

## Table: `email_sends`

**Category:** Email Marketing

**Migration:** `2025_12_23_201530_create_email_sends_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201530_create_email_sends_table.php`

---

## Table: `email_templates`

**Category:** Email Marketing

**Migration:** `2025_12_23_201530_create_email_templates_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201530_create_email_templates_table.php`

---

## Table: `newsletter_subscriptions`

**Category:** Email Marketing

**Migration:** `2025_12_23_201530_create_newsletter_subscriptions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201530_create_newsletter_subscriptions_table.php`

---

## Table: `emergency_alerts`

**Category:** Emergency Alerts

**Migration:** `2025_12_23_201533_create_emergency_alerts_table.php`

**Alterations:**
- `2025_12_23_201534_create_municipal_partners_table.php`
- `2025_12_23_201534_create_municipal_partners_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201533_create_emergency_alerts_table.php`

---

## Table: `emergency_subscriptions`

**Category:** Emergency Alerts

**Migration:** `2025_12_23_201533_create_emergency_subscriptions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201533_create_emergency_subscriptions_table.php`

---

## Table: `emergency_audit_log`

**Category:** Emergency Alerts

**Migration:** `2025_12_23_201534_create_emergency_audit_log_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201534_create_emergency_audit_log_table.php`

---

## Table: `emergency_deliveries`

**Category:** Emergency Alerts

**Migration:** `2025_12_23_201534_create_emergency_deliveries_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201534_create_emergency_deliveries_table.php`

---

## Table: `municipal_partners`

**Category:** Emergency Alerts

**Migration:** `2025_12_23_201534_create_municipal_partners_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_23_201534_create_municipal_partners_table.php`

---

## Table: `notification_subscriptions`

**Category:** Notifications

**Migration:** `2025_12_24_022805_create_notification_subscriptions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_24_022805_create_notification_subscriptions_table.php`

---

## Table: `phone_verifications`

**Category:** Notifications

**Migration:** `2025_12_24_022809_create_phone_verifications_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_24_022809_create_phone_verifications_table.php`

---

## Table: `notification_log`

**Category:** Notifications

**Migration:** `2025_12_24_022813_create_notification_log_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_24_022813_create_notification_log_table.php`

---

## Table: `tenants`

**Category:** Workspaces & Multi-tenancy

**Migration:** `2025_12_27_183628_create_tenants_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183628_create_tenants_table.php`

---

## Table: `account_managers`

**Category:** Workspaces & Multi-tenancy

**Migration:** `2025_12_27_183629_create_account_managers_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183629_create_account_managers_table.php`

---

## Table: `business_hours`

**Category:** CRM - Business Details

**Migration:** `2025_12_27_183629_create_business_hours_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183629_create_business_hours_table.php`

---

## Table: `customers`

**Category:** CRM - Core

**Migration:** `2025_12_27_183629_create_customers_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183629_create_customers_table.php`

---

## Table: `smb_businesses`

**Category:** CRM - Core

**Migration:** `2025_12_27_183629_create_smb_businesses_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183629_create_smb_businesses_table.php`

---

## Table: `business_attributes`

**Category:** CRM - Business Details

**Migration:** `2025_12_27_183630_create_business_attributes_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183630_create_business_attributes_table.php`

---

## Table: `business_photos`

**Category:** CRM - Business Details

**Migration:** `2025_12_27_183630_create_business_photos_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183630_create_business_photos_table.php`

---

## Table: `business_reviews`

**Category:** CRM - Business Details

**Migration:** `2025_12_27_183630_create_business_reviews_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183630_create_business_reviews_table.php`

---

## Table: `deals`

**Category:** CRM - Core

**Migration:** `2025_12_27_183630_create_deals_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183630_create_deals_table.php`

---

## Table: `interactions`

**Category:** CRM - Core

**Migration:** `2025_12_27_183630_create_interactions_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183630_create_interactions_table.php`

---

## Table: `tasks`

**Category:** CRM - Core

**Migration:** `2025_12_27_183630_create_tasks_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183630_create_tasks_table.php`

---

## Table: `campaign_recipients`

**Category:** CRM - Core

**Migration:** `2025_12_27_183631_create_campaign_recipients_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183631_create_campaign_recipients_table.php`

---

## Table: `campaigns`

**Category:** CRM - Core

**Migration:** `2025_12_27_183631_create_campaigns_table.php`

> **Note:** For complete column definitions, see the migration file: `database/migrations/2025_12_27_183631_create_campaigns_table.php`

---


## How to Get Detailed Schema

To get detailed column information for any table:

1. Find the migration file listed above for the table
2. Open `database/migrations/{migration_file}`
3. Review the `Schema::create()` or `Schema::table()` definition

Alternatively, if the database is running:

```bash
php artisan tinker
>>> Schema::getColumnListing('table_name');
```

