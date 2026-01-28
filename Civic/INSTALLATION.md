# Civic Sources Integration - Installation Guide

## Quick Start (5 minutes)

### 1. Copy Files to Your Laravel Project

```bash
# Copy all files from this package to your Laravel project:

# Models
cp app/Models/CivicSourcePlatform.php    your-project/app/Models/
cp app/Models/CivicSource.php            your-project/app/Models/
cp app/Models/CivicContentItem.php       your-project/app/Models/
cp app/Models/CivicCollectionRun.php     your-project/app/Models/

# Services
mkdir -p your-project/app/Services/Civic
cp app/Services/Civic/*.php              your-project/app/Services/Civic/

# Jobs
cp app/Jobs/News/ProcessCivicSourcesJob.php        your-project/app/Jobs/News/
cp app/Jobs/News/ProcessSingleCivicSourceJob.php   your-project/app/Jobs/News/

# REPLACE your existing Phase 2 job (backup first!)
cp app/Jobs/News/ProcessPhase2NewsCollectionJob.php your-project/app/Jobs/News/

# Commands
cp app/Console/Commands/ManageCivicSources.php     your-project/app/Console/Commands/

# Config
cp config/civic-sources.php              your-project/config/

# Service Provider
cp app/Providers/CivicSourcesServiceProvider.php   your-project/app/Providers/

# Migration
cp database/migrations/*.php             your-project/database/migrations/
```

### 2. Register Service Provider

In `config/app.php`:

```php
'providers' => [
    // ... existing providers ...
    App\Providers\CivicSourcesServiceProvider::class,
],
```

### 3. Run Migration

```bash
php artisan migrate
```

### 4. Add Region Relationship

In your `app/Models/Region.php`, add:

```php
/**
 * Get civic sources for this region
 */
public function civicSources(): HasMany
{
    return $this->hasMany(CivicSource::class);
}
```

### 5. Environment Variables (optional)

```env
CIVIC_SOURCES_ENABLED=true
CIVIC_LEGISTAR_ENABLED=true
CIVIC_CIVICPLUS_ENABLED=true
CIVIC_NIXLE_ENABLED=true
CIVIC_INTEGRATE_WORKFLOW=true
```

---

## Usage

### Discover & Add Sources for a Region

```bash
# Auto-discover all civic sources for Tampa
php artisan civic:sources discover --region="Tampa"

# Or add manually:

# Add Legistar (city council meetings, legislation)
php artisan civic:sources add --platform=legistar --region="Tampa" --client=tampa

# Add CivicPlus (agendas, alerts, calendar)
php artisan civic:sources add --platform=civicplus --region="Tampa" --url="https://www.tampa.gov"

# Add Nixle (police/fire alerts)
php artisan civic:sources add --platform=nixle --region="Tampa" --zip="33602,33603,33604,33605,33606"
```

### Collect News

```bash
# Collect from all sources (queued)
php artisan civic:sources collect --region="Tampa"

# Collect synchronously (for testing)
php artisan civic:sources collect --region="Tampa" --sync

# View statistics
php artisan civic:sources stats --region="Tampa"
```

### The News Workflow

With the updated `ProcessPhase2NewsCollectionJob`, civic sources are automatically collected alongside your existing business and category news during the daily workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase 2: News Collection                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EXISTING SOURCES                    NEW CIVIC SOURCES          │
│  ───────────────                     ────────────────           │
│  • Business news (SERP API)          • Legistar (meetings)      │
│  • Category news (SERP API)          • CivicPlus (agendas)      │
│                                      • Nixle (alerts)           │
│                                                                 │
│                         ▼                                       │
│              All stored in news_articles                        │
│                         ▼                                       │
│                    Phase 3+ ...                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Gets Collected

### From Legistar (FREE API - 70% of major US cities)

| Content Type | Example | News Value |
|--------------|---------|------------|
| **Meetings** | "City Council Meeting - January 25, 2025" | High - community interest |
| **Legislation** | "[ORD-2025-01] Zoning Amendment for Downtown" | High - policy news |
| **Votes** | Roll call votes on ordinances | Medium - accountability |
| **Committees** | Planning Board, Budget Committee schedules | Medium - advance notice |

### From CivicPlus (RSS Feeds)

| Feed Type | Example | News Value |
|-----------|---------|------------|
| **Agenda Center** | Meeting agendas with full item lists | High - transparency |
| **Alert Center** | Road closures, emergencies | High - time-sensitive |
| **Calendar** | Community events, public meetings | Medium - engagement |
| **News Flash** | Press releases, announcements | High - official news |

### From Nixle (Public Safety Alerts)

| Alert Type | Example | News Value |
|------------|---------|------------|
| **Alerts** | "ALERT: Armed robbery suspect at large" | Critical - safety |
| **Advisories** | "Traffic advisory: I-275 closure" | High - time-sensitive |
| **Community** | "Community meeting on crime prevention" | Medium - engagement |

---

## Database Tables Created

```sql
-- Platform definitions (seeded with 3 platforms)
civic_source_platforms
  - id, name, display_name, api_base_url, detection_patterns, default_config

-- Individual sources you configure
civic_sources
  - id, region_id, platform_id, name, source_type, api_client_name
  - rss_feed_url, zip_codes, poll_interval_minutes
  - last_collected_at, health_score, is_enabled

-- Raw collected content
civic_content_items
  - id, civic_source_id, region_id, content_type
  - title, description, url, published_at, event_date
  - body_name (for meetings), alert_type, urgency, severity
  - processing_status, news_article_id (links to generated article)

-- Collection run tracking
civic_collection_runs
  - id, civic_source_id, started_at, completed_at
  - items_found, items_new, status, error_message
```

---

## Known Legistar Clients (Test These!)

```bash
# Major cities with working Legistar APIs:
php artisan civic:sources test --client=nyc          # New York City
php artisan civic:sources test --client=seattle      # Seattle
php artisan civic:sources test --client=chicago      # Chicago
php artisan civic:sources test --client=losangeles   # Los Angeles
php artisan civic:sources test --client=sanfrancisco # San Francisco
php artisan civic:sources test --client=tampa        # Tampa
php artisan civic:sources test --client=orlando      # Orlando
php artisan civic:sources test --client=miami        # Miami
php artisan civic:sources test --client=austin       # Austin
php artisan civic:sources test --client=portland     # Portland
php artisan civic:sources test --client=boston       # Boston
php artisan civic:sources test --client=atlanta      # Atlanta
php artisan civic:sources test --client=denver       # Denver
```

To find more: Check if a city has `{cityname}.legistar.com` - if so, the client name is usually just the city name in lowercase.

---

## Troubleshooting

### "Legistar client not found"
```bash
# Try variations
php artisan civic:sources test --client=tampa
php artisan civic:sources test --client=tampafl  
php artisan civic:sources test --client=cityoftampa

# Check the public portal URL
# https://tampa.legistar.com → client is "tampa"
```

### "CivicPlus RSS not available"
Not all CivicPlus sites have RSS enabled. Test manually:
```
https://www.citysite.gov/rss.aspx
```

### "No alerts from Nixle"
- Verify ZIP codes are correct for your region
- Some areas have no Nixle-participating agencies
- Try nearby ZIP codes

### Source disabled due to failures
```php
// Re-enable a source manually
$source = CivicSource::find($id);
$source->update([
    'is_enabled' => true,
    'consecutive_failures' => 0,
    'health_score' => 100,
]);
```

---

## File Structure

```
app/
├── Console/Commands/
│   └── ManageCivicSources.php           # CLI management
├── Jobs/News/
│   ├── ProcessCivicSourcesJob.php       # Collect all sources for region
│   ├── ProcessSingleCivicSourceJob.php  # Collect single source
│   └── ProcessPhase2NewsCollectionJob.php # UPDATED with civic integration
├── Models/
│   ├── CivicSourcePlatform.php          # Platform definitions
│   ├── CivicSource.php                  # Source configurations
│   ├── CivicContentItem.php             # Collected content
│   └── CivicCollectionRun.php           # Run tracking
├── Providers/
│   └── CivicSourcesServiceProvider.php
└── Services/Civic/
    ├── CivicSourceCollectionService.php # Main orchestrator
    ├── LegistarService.php              # Legistar API integration
    ├── CivicPlusService.php             # CivicPlus RSS integration
    └── NixleService.php                 # Nixle scraping integration

config/
└── civic-sources.php                    # Configuration

database/migrations/
└── 2025_01_21_000001_create_civic_sources_tables.php
```

---

## Cost: $0

This entire integration uses:
- **Legistar**: Free public REST API
- **CivicPlus**: Free RSS feeds
- **Nixle**: Free public web pages + RSS

No API keys required. No subscription costs.

---

## Support

For issues or questions about this integration, check:
- `civic_platform_patterns.md` - Detection patterns and URL structures
- `README.md` - Full API reference and examples
