# Back Office & Admin Panel Technical Manual

## 1. Overview
The Admin Panel is the centralized control hub for the entire Day News Multisite platform. It is built using **FilamentPHP (v4)**, a robust administration framework for Laravel.

**Scope:**
It covers **ALL** apps within the platform, including:
*   📰 **Day News**: Article generation, Posts, News Fetching.
*   🏙️ **Event City**: Events, Venues, Performers, Ticketing.
*   🏢 **Business & CRM**: Businesses, Ads, Campaigns, Orders.
*   👥 **Social**: Communities, Groups, User Management.

Unlike the user-facing frontend (built with React/Inertia), this Admin Panel is server-side rendered using Livewire and Blade, optimized for internal operations and data management.

## 2. Access & Configuration
*   **URL**: `/admin`
*   **Authentication**: Uses standard Laravel authentication (`web` guard).
*   **Configuration**: `app/Providers/Filament/AdminPanelProvider.php`

## 3. Resource Management (CRUD)
The panel is organized into "Resources," each corresponding to a major data entity.

### 🌐 Platform Core
| Resource | Purpose |
| :--- | :--- |
| **Regions** | Manage cities, counties, and geographic zones. |
| **Users** | Manage platform users, roles, and permissions. |
| **Workspaces** | Manage user teams and workspace settings. |

### 📰 Day News
| Resource | Purpose |
| :--- | :--- |
| **DayNewsPosts** | Manage user-submitted content and news articles. |
| **WriterAgents** | Configuration for AI writers and automated content generation. |
| **NewsFetchFrequencies** | Control how often external news sources are scraped. |

### 🏙️ Event City
| Resource | Purpose |
| :--- | :--- |
| **Events** | Manage event listings and schedules. |
| **Venues** | Manage event locations and capacities. |
| **Performers** | Manage artist/performer profiles. |
| **TicketOrders** | View and manage ticket sales. |
| **TicketPlans** | Configure pricing tiers for events. |

### 🏢 Business & CRM
| Resource | Purpose |
| :--- | :--- |
| **Businesses** | Manage business profiles and listings. |
| **Advertisements** | Manage ad campaigns and placements. |
| **Orders** | General e-commerce order management. |
| **Products** | Manage merchandise or other sellable items. |

### 👥 Social & Community
| Resource | Purpose |
| :--- | :--- |
| **Communities** | Manage broader social communities. |
| **SocialGroups** | Manage specific user groups. |
| **SocialPosts** | Moderation for social feed content. |

## 4. Technical Architecture
*   **Framework**: FilamentPHP v4 (TALL Stack: Tailwind, Alpine.js, Laravel, Livewire).
*   **Location**: All Admin code resides in `app/Filament`.
    *   `Resources/`: Defines the CRUD interfaces (forms, tables).
    *   `Pages/`: Custom admin pages (dashboards, settings).
    *   `Widgets/`: Dashboard charts and stats.
*   **Permissions**: Access is controlled via Policies (`app/Policies`). Ensure `viewAny` return `true` for admins in policies to make resources visible.

## 5. Adding New Features
To add a new section to the admin panel:
1.  **Generate Resource**: Run `php artisan make:filament-resource ModelName`.
    *   Example: `php artisan make:filament-resource Event`.
2.  **Define Form**: Edit `form()` method in the generated Resource class to define input fields.
3.  **Define Table**: Edit `table()` method to define list columns and filters.
4.  **Permissions**: Ensure the Model Policy allows administrative actions.
