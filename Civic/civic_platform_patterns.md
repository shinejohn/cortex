# Civic Platform Detection & Scraping Patterns
## CivicPlus, Granicus (Legistar), and Nixle

---

## Executive Summary

Yes, there **are** exploitable patterns across all three platforms. Here's what's available:

| Platform | Free API? | RSS Feeds? | Predictable URLs? | Detection Method |
|----------|-----------|------------|-------------------|------------------|
| **CivicPlus** | No | Yes (if enabled) | Yes | URL patterns + `/rss.aspx` |
| **Granicus Legistar** | **YES** | No | Yes | `{client}.legistar.com` + API |
| **Nixle** | No | Yes (agency-specific) | **YES** | `local.nixle.com/zipcode/` |

---

## 1. CivicPlus Detection & Patterns

### Platform Fingerprints
```
# URL Patterns (append to municipal domain)
/rss.aspx                    # RSS feed hub (if enabled)
/AgendaCenter                # Meeting agendas
/AlertCenter.aspx            # Public alerts
/DocumentCenter              # Documents library
/Calendar.aspx               # Events calendar
/Archive.aspx                # News archive
/list.aspx                   # Lists module
/QuickLinks.aspx             # Quick links
/Facilities                  # Facilities directory
/BusinessDirectoryII.aspx    # Business directory
/XML                         # XML sitemap
```

### RSS Feed Discovery
```bash
# Check if RSS is enabled
curl -s "https://{municipal-site}/rss.aspx"

# If enabled, returns XML listing all available feeds:
# - Agenda Center feeds
# - Alert Center feeds
# - Calendar feeds
# - News Flash feeds
# - Jobs feeds
```

### Detection via HTML
```html
<!-- Look for in page source -->
<meta name="generator" content="CivicPlus" />
<!-- OR -->
Powered by CivicPlus
<!-- OR check for these script/CSS patterns -->
/CivicPlus/
civicengage
```

### Sample RSS Feed URLs (when enabled)
```
https://{site}/rss.aspx?CID={category-id}
https://{site}/rss.aspx?AMID={agenda-module-id}
https://{site}/Calendar.aspx?feed=1
```

### Important Limitation
- RSS must be enabled by the municipality (contact CivicPlus Support)
- RSS feeds only keep **2 weeks** of data
- No public API access for third parties

---

## 2. Granicus Legistar - **FREE PUBLIC API**

### This is the jackpot: 70% of largest US cities use Legistar

### API Base URL
```
https://webapi.legistar.com/v1/{client}/
```

### Finding the Client Name
The client name is typically the city/county name in lowercase:
- `seattle`
- `nyc`
- `chicago`
- `losangeles`
- `sanfrancisco`

Also check the municipality's public portal URL:
```
https://{client}.legistar.com/
```

### Key API Endpoints (No Auth Required for Most Cities)
```bash
# Get all matters (legislation)
GET https://webapi.legistar.com/v1/{client}/matters

# Get upcoming events (meetings)
GET https://webapi.legistar.com/v1/{client}/events

# Get event items (agenda items)
GET https://webapi.legistar.com/v1/{client}/eventitems

# Get bodies (committees, boards)
GET https://webapi.legistar.com/v1/{client}/bodies

# Get persons (officials, staff)
GET https://webapi.legistar.com/v1/{client}/persons

# Get votes on a matter
GET https://webapi.legistar.com/v1/{client}/matters/{id}/histories
```

### OData Query Support
```bash
# Pagination
?$top=10&$skip=0

# Filtering
?$filter=EventDate gt datetime'2025-01-01'

# Ordering
?$orderby=EventDate desc

# Selecting specific fields
?$select=EventId,EventDate,EventBodyName
```

### Example: Get Recent Meetings
```bash
curl "https://webapi.legistar.com/v1/seattle/events?\$top=10&\$orderby=EventDate%20desc"
```

### Token Requirements
Some clients require API tokens. If you get a 401 Unauthorized:
1. Contact the municipality's clerk's office
2. Request read-only API access
3. NYC, Seattle, and many others are fully open

### Public Portal URLs (for scraping fallback)
```
https://{client}.legistar.com/Calendar.aspx
https://{client}.legistar.com/Legislation.aspx
https://{client}.legistar.com/MeetingDetail.aspx?ID={meeting-id}
```

---

## 3. Nixle - Predictable URL Patterns

### URL Structure
```
# By ZIP Code (most useful for Day.News)
https://local.nixle.com/zipcode/{zipcode}/

# By City
https://local.nixle.com/city/{state}/{city}/

# By County
https://local.nixle.com/county/{state}/{county}/

# Agency Search
https://local.nixle.com/agency_search/?cleanAddress={zipcode}

# Individual Alert (once you have the ID)
https://local.nixle.com/alert/{alert-id}/
```

### RSS Feeds (Agency-Specific)
```
# Format (requires agency ID)
https://rss.nixle.com/pubs/feeds/latest/{agency-id}/
# OR
https://agency.nixle.com/pubs/feeds/latest/{agency-id}/
```

### Discovering Agencies for a ZIP Code
```bash
# Scrape this page to find agency IDs
curl "https://local.nixle.com/agency_search/?cleanAddress={zipcode}"
```

### Scraping Strategy
```python
# Example scraping pattern
base_urls = [
    f"https://local.nixle.com/zipcode/{zip}/"
    for zip in target_zipcodes
]

# Parse the page for:
# - Agency names and links
# - Recent alerts (if any)
# - Related ZIP codes
# - City/County hierarchy
```

---

## 4. Detection Script Template

```python
"""
Detect which civic platform a municipal website uses
"""

import requests
from bs4 import BeautifulSoup

def detect_civic_platform(url):
    """Returns the detected platform or None"""
    
    try:
        response = requests.get(url, timeout=10)
        html = response.text.lower()
        
        # CivicPlus detection
        civicplus_signals = [
            'civicplus',
            'civicengage',
            '/agendacenter',
            '/alertcenter',
            '/documentcenter',
            '/rss.aspx'
        ]
        if any(signal in html for signal in civicplus_signals):
            return 'civicplus'
        
        # Granicus/Legistar detection
        granicus_signals = [
            'granicus',
            'legistar',
            'govdelivery',
            'insite'
        ]
        if any(signal in html for signal in granicus_signals):
            return 'granicus'
        
        # Check for Legistar subdomain
        if 'legistar.com' in url:
            return 'legistar'
        
        # Nixle detection (usually embedded widget)
        if 'nixle' in html or '888777' in html:
            return 'nixle'
            
        return None
        
    except Exception as e:
        return None

def check_civicplus_rss(base_url):
    """Check if CivicPlus RSS is enabled"""
    try:
        rss_url = f"{base_url.rstrip('/')}/rss.aspx"
        response = requests.get(rss_url, timeout=10)
        if response.status_code == 200 and 'xml' in response.headers.get('content-type', ''):
            return rss_url
    except:
        pass
    return None

def get_legistar_client(city_name):
    """Try to find Legistar client name"""
    # Common patterns
    test_clients = [
        city_name.lower().replace(' ', ''),
        city_name.lower().replace(' ', '-'),
        city_name.lower()
    ]
    
    for client in test_clients:
        try:
            url = f"https://webapi.legistar.com/v1/{client}/bodies"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return client
        except:
            continue
    return None
```

---

## 5. Implementation Strategy for Day.News

### Phase 1: Build a Municipal Source Database
1. For each target ZIP code/city, detect which platforms are in use
2. Store: city, platform, rss_url, api_endpoint, last_checked

### Phase 2: Platform-Specific Collectors

**CivicPlus Collector:**
- Check `/rss.aspx` for each CivicPlus site
- Parse available feeds (Agenda, Alerts, Calendar, News)
- Poll feeds on schedule (they only keep 2 weeks of data)

**Legistar Collector:**
- Query `webapi.legistar.com` with detected client names
- Focus on `/events` and `/matters` endpoints
- Use OData filters for recent items

**Nixle Collector:**
- Build list of target ZIP codes
- Scrape `local.nixle.com/zipcode/{zip}/` pages
- Extract agency IDs for RSS feed construction
- Monitor RSS feeds: `rss.nixle.com/pubs/feeds/latest/{agency-id}/`

### Phase 3: Email Subscription Backup
- Sign up for GovDelivery and Nixle alerts in target markets
- Use your IMAP polling + GPT-4 extraction pipeline as a backup source

---

## 6. Known Legistar Clients (Partial List)

| City | Client Name | API Access |
|------|-------------|------------|
| New York City | `nyc` | Open |
| Seattle | `seattle` | Open |
| Chicago | `chicago` | Open |
| Los Angeles | `losangeles` | Open |
| San Francisco | `sanfrancisco` | Open |
| Boston | `boston` | Open |
| Philadelphia | `philadelphiapa` | Open |
| Denver | `denvergov` | Verify |
| Austin | `austin` | Open |
| Portland | `portland` | Open |

To discover more: Try `https://webapi.legistar.com/v1/{city-guess}/bodies`

---

## 7. Rate Limiting Considerations

- **Legistar API**: Limited to 1000 results per query; use pagination
- **CivicPlus RSS**: No documented limits, but be respectful
- **Nixle pages**: No API rate limits; scrape responsibly

---

## Resources

- Legistar API Help: https://webapi.legistar.com/Help
- Legistar API Examples: https://webapi.legistar.com/Home/Examples
- CivicPlus RSS Help: https://www.civicplus.help/municipal-websites-central/docs/use-rss-feeds-from-modules
- Nixle Support: https://supportcenter.nixle.com/

---

*Document created for Day.News platform development*
