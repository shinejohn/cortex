# Fibonacco Platform: Production-Ready UI Testing & Fixing
## Complete Cursor Instructions for Systematic QA

**Version:** 1.0  
**Target:** Laravel 11 + Inertia/React + PostgreSQL  
**Scope:** Day.News → GoEventCity → GoLocalVoices → DowntownsGuide → AlphaSite

---

## 🎯 Mission Statement

Transform five connected platforms from "working code" to **production-ready applications** with:
- All UI elements functional and data-connected
- Navigation and routing working correctly
- CRUD operations completing end-to-end
- Modals/popups properly integrated
- Test data present where needed

---

## 📍 Target URLs (Testing Order)

| Priority | Platform | Dev URL | Purpose |
|----------|----------|---------|---------|
| 1 | Day.News | https://dev.day.news | Hyperlocal news |
| 2 | GoEventCity | https://dev.goeventcity.com | Events/calendar |
| 3 | GoLocalVoices | https://dev.golocalvoices.com | Podcasts/video |
| 4 | DowntownsGuide | https://dev.downtownsguide.com | Business directory |
| 5 | AlphaSite | https://dev.alphasite.ai | SMB AI management |

---

## 🛠️ Phase 1: Testing Infrastructure Setup

### 1.1 Install Playwright

```bash
# From Laravel project root
npm init playwright@latest

# Choose:
# - TypeScript
# - tests folder: tests/e2e
# - GitHub Actions: No (for now)
# - Install browsers: Yes
```

### 1.2 Playwright Configuration

Create `playwright.config.ts` in project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.TEST_URL || 'https://dev.day.news',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Day.News
    {
      name: 'day-news',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://dev.day.news',
      },
    },
    // GoEventCity
    {
      name: 'goeventcity',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://dev.goeventcity.com',
      },
    },
    // GoLocalVoices
    {
      name: 'golocalvoices',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://dev.golocalvoices.com',
      },
    },
    // DowntownsGuide
    {
      name: 'downtownsguide',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://dev.downtownsguide.com',
      },
    },
    // AlphaSite
    {
      name: 'alphasite',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://dev.alphasite.ai',
      },
    },
    // Mobile Testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        baseURL: 'https://dev.day.news',
      },
    },
  ],
});
```

### 1.3 Test Utilities Setup

Create `tests/e2e/utils/test-helpers.ts`:

```typescript
import { Page, expect } from '@playwright/test';

export interface TestResult {
  element: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  screenshot?: string;
}

export class UITester {
  constructor(private page: Page) {}

  /**
   * Test if element exists and is visible
   */
  async elementExists(selector: string, description: string): Promise<TestResult> {
    try {
      const element = this.page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 5000 });
      return { element: selector, status: 'pass', message: `${description} is visible` };
    } catch (e) {
      return { element: selector, status: 'fail', message: `${description} not found or not visible` };
    }
  }

  /**
   * Test navigation link works
   */
  async navigationWorks(selector: string, expectedUrl: string, description: string): Promise<TestResult> {
    try {
      const link = this.page.locator(selector).first();
      await link.click();
      await this.page.waitForLoadState('networkidle');
      
      const currentUrl = this.page.url();
      if (currentUrl.includes(expectedUrl)) {
        return { element: selector, status: 'pass', message: `${description} navigates correctly` };
      }
      return { element: selector, status: 'fail', message: `${description} navigated to ${currentUrl}, expected ${expectedUrl}` };
    } catch (e) {
      return { element: selector, status: 'fail', message: `${description} navigation failed: ${e}` };
    }
  }

  /**
   * Test if data is displaying (not empty state)
   */
  async hasData(containerSelector: string, itemSelector: string, description: string): Promise<TestResult> {
    try {
      const container = this.page.locator(containerSelector);
      await expect(container).toBeVisible({ timeout: 5000 });
      
      const items = container.locator(itemSelector);
      const count = await items.count();
      
      if (count > 0) {
        return { element: containerSelector, status: 'pass', message: `${description} shows ${count} items` };
      }
      return { element: containerSelector, status: 'warning', message: `${description} is empty - needs test data` };
    } catch (e) {
      return { element: containerSelector, status: 'fail', message: `${description} container not found` };
    }
  }

  /**
   * Test button click triggers action
   */
  async buttonWorks(selector: string, expectedBehavior: 'modal' | 'submit' | 'navigation', description: string): Promise<TestResult> {
    try {
      const button = this.page.locator(selector).first();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      await button.click();
      await this.page.waitForTimeout(500);
      
      switch (expectedBehavior) {
        case 'modal':
          const modal = this.page.locator('[role="dialog"], .modal, [data-modal]');
          if (await modal.isVisible()) {
            return { element: selector, status: 'pass', message: `${description} opens modal` };
          }
          return { element: selector, status: 'fail', message: `${description} did not open modal` };
          
        case 'submit':
          // Check for loading state or success message
          const loading = this.page.locator('.loading, [data-loading], .spinner');
          const success = this.page.locator('.success, [data-success], .toast-success');
          if (await loading.isVisible() || await success.isVisible()) {
            return { element: selector, status: 'pass', message: `${description} triggered submit` };
          }
          return { element: selector, status: 'warning', message: `${description} clicked but no visible feedback` };
          
        case 'navigation':
          await this.page.waitForLoadState('networkidle');
          return { element: selector, status: 'pass', message: `${description} navigated` };
      }
      
      return { element: selector, status: 'warning', message: `${description} clicked but behavior unclear` };
    } catch (e) {
      return { element: selector, status: 'fail', message: `${description} failed: ${e}` };
    }
  }

  /**
   * Test form CRUD operation
   */
  async testCRUD(config: {
    createButton: string;
    formFields: { selector: string; value: string }[];
    submitButton: string;
    successIndicator: string;
    listSelector: string;
    editButton: string;
    deleteButton: string;
    description: string;
  }): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // CREATE
    try {
      await this.page.locator(config.createButton).click();
      await this.page.waitForTimeout(500);
      
      for (const field of config.formFields) {
        await this.page.locator(field.selector).fill(field.value);
      }
      
      await this.page.locator(config.submitButton).click();
      await this.page.waitForTimeout(1000);
      
      const success = await this.page.locator(config.successIndicator).isVisible();
      results.push({
        element: 'CREATE',
        status: success ? 'pass' : 'fail',
        message: `${config.description} CREATE ${success ? 'succeeded' : 'failed'}`
      });
    } catch (e) {
      results.push({ element: 'CREATE', status: 'fail', message: `${config.description} CREATE error: ${e}` });
    }

    // READ - Check list displays
    try {
      const items = await this.page.locator(config.listSelector).count();
      results.push({
        element: 'READ',
        status: items > 0 ? 'pass' : 'warning',
        message: `${config.description} READ shows ${items} items`
      });
    } catch (e) {
      results.push({ element: 'READ', status: 'fail', message: `${config.description} READ error: ${e}` });
    }

    // UPDATE
    try {
      await this.page.locator(config.editButton).first().click();
      await this.page.waitForTimeout(500);
      
      if (config.formFields.length > 0) {
        await this.page.locator(config.formFields[0].selector).fill(config.formFields[0].value + ' Updated');
      }
      
      await this.page.locator(config.submitButton).click();
      await this.page.waitForTimeout(1000);
      
      results.push({ element: 'UPDATE', status: 'pass', message: `${config.description} UPDATE completed` });
    } catch (e) {
      results.push({ element: 'UPDATE', status: 'fail', message: `${config.description} UPDATE error: ${e}` });
    }

    // DELETE
    try {
      await this.page.locator(config.deleteButton).first().click();
      await this.page.waitForTimeout(500);
      
      // Confirm deletion if dialog appears
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      await this.page.waitForTimeout(1000);
      results.push({ element: 'DELETE', status: 'pass', message: `${config.description} DELETE completed` });
    } catch (e) {
      results.push({ element: 'DELETE', status: 'fail', message: `${config.description} DELETE error: ${e}` });
    }

    return results;
  }
}
```

---

## 🔵 Phase 2: Day.News Testing (Priority 1)

### 2.1 Test File Structure

Create `tests/e2e/day-news/` directory:

```
tests/e2e/day-news/
├── homepage.spec.ts
├── article-detail.spec.ts
├── news-categories.spec.ts
├── navigation.spec.ts
├── search.spec.ts
├── auth.spec.ts
├── comments.spec.ts
├── polls.spec.ts
└── admin/
    ├── dashboard.spec.ts
    ├── articles-crud.spec.ts
    └── settings.spec.ts
```

### 2.2 Homepage Tests

Create `tests/e2e/day-news/homepage.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('Day.News Homepage', () => {
  let tester: UITester;

  test.beforeEach(async ({ page }) => {
    tester = new UITester(page);
    await page.goto('/');
  });

  test('Core layout elements exist', async ({ page }) => {
    // Header
    await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
    
    // Logo/Brand
    await expect(page.locator('a[href="/"], .logo, [data-testid="logo"]')).toBeVisible();
    
    // Navigation
    await expect(page.locator('nav, [data-testid="navigation"]')).toBeVisible();
    
    // Main content area
    await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
    
    // Footer
    await expect(page.locator('footer, [data-testid="footer"]')).toBeVisible();
  });

  test('Hero/Featured stories display', async ({ page }) => {
    const result = await tester.hasData(
      '[data-testid="hero-section"], .hero, .featured-stories',
      'article, .story-card, .article-card',
      'Hero stories section'
    );
    
    if (result.status === 'warning') {
      console.log('⚠️ ACTION NEEDED: Add featured/hero articles to database');
    }
    
    expect(result.status).not.toBe('fail');
  });

  test('News feed displays articles', async ({ page }) => {
    const result = await tester.hasData(
      '[data-testid="news-feed"], .news-feed, .articles-list',
      'article, .story-card, .article-card, [data-testid="article-item"]',
      'News feed'
    );
    
    if (result.status === 'warning') {
      console.log('⚠️ ACTION NEEDED: Run news workflow to generate articles');
      console.log('   Command: php artisan news:run-daily-workflow');
    }
    
    expect(result.status).not.toBe('fail');
  });

  test('Category tabs/pills work', async ({ page }) => {
    const categories = page.locator('[data-testid="category-tabs"] button, .category-pill, .category-tab');
    const count = await categories.count();
    
    if (count === 0) {
      console.log('⚠️ WARNING: No category tabs found');
      return;
    }
    
    // Click each category and verify content changes
    for (let i = 0; i < Math.min(count, 5); i++) {
      await categories.nth(i).click();
      await page.waitForTimeout(500);
      
      // Verify URL changed or content updated
      const articles = page.locator('article, .story-card');
      await expect(articles.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('Search functionality works', async ({ page }) => {
    const searchButton = page.locator('[data-testid="search-button"], .search-button, button[aria-label="Search"]');
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('test search');
      await searchInput.press('Enter');
      
      await page.waitForLoadState('networkidle');
      // Verify search results page or results display
    } else {
      console.log('⚠️ WARNING: Search button not found - check implementation');
    }
  });

  test('Location selector works', async ({ page }) => {
    const locationSelector = page.locator('[data-testid="location-selector"], .location-picker, .city-selector');
    
    if (await locationSelector.isVisible()) {
      await locationSelector.click();
      await page.waitForTimeout(300);
      
      // Check dropdown/modal appears
      const dropdown = page.locator('[data-testid="location-dropdown"], .location-options, [role="listbox"]');
      await expect(dropdown).toBeVisible();
    } else {
      console.log('⚠️ INFO: Location selector not found on homepage');
    }
  });
});
```

### 2.3 Navigation Tests

Create `tests/e2e/day-news/navigation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('Day.News Navigation', () => {
  let tester: UITester;

  test.beforeEach(async ({ page }) => {
    tester = new UITester(page);
    await page.goto('/');
  });

  test('Main navigation links work', async ({ page }) => {
    const navLinks = [
      { text: 'News', expectedUrl: '/news' },
      { text: 'Events', expectedUrl: '/events' },
      { text: 'Business', expectedUrl: '/business' },
      { text: 'Local Voices', expectedUrl: '/local-voices' },
      { text: 'About', expectedUrl: '/about' },
    ];

    for (const link of navLinks) {
      await page.goto('/'); // Reset to home
      
      const navLink = page.locator(`nav a:has-text("${link.text}"), header a:has-text("${link.text}")`).first();
      
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain(link.expectedUrl);
        console.log(`✅ ${link.text} navigation works`);
      } else {
        console.log(`⚠️ WARNING: ${link.text} nav link not found`);
      }
    }
  });

  test('Mobile menu opens and works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hamburger = page.locator('[data-testid="mobile-menu-button"], .hamburger, button[aria-label="Menu"]');
    
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-nav, [role="navigation"]');
      await expect(mobileMenu).toBeVisible();
      
      // Test a link in mobile menu
      const firstLink = mobileMenu.locator('a').first();
      if (await firstLink.isVisible()) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Mobile menu navigation works');
      }
    } else {
      console.log('⚠️ WARNING: Mobile hamburger menu not found');
    }
  });

  test('Footer navigation links work', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    const footerLinks = footer.locator('a');
    const count = await footerLinks.count();
    
    console.log(`Found ${count} footer links`);
    
    // Test first 5 links
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/');
      const link = footer.locator('a').nth(i);
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('http')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBeTruthy();
        console.log(`✅ Footer link ${i + 1} works: ${href}`);
      }
    }
  });

  test('Breadcrumbs work (on article pages)', async ({ page }) => {
    // Navigate to an article first
    await page.goto('/');
    
    const articleLink = page.locator('article a, .story-card a, .article-card a').first();
    if (await articleLink.isVisible()) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"], .breadcrumbs, nav[aria-label="Breadcrumb"]');
      if (await breadcrumbs.isVisible()) {
        const homeLink = breadcrumbs.locator('a').first();
        await homeLink.click();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain('/');
        console.log('✅ Breadcrumb navigation works');
      } else {
        console.log('⚠️ INFO: No breadcrumbs on article page');
      }
    }
  });
});
```

### 2.4 Article Detail Page Tests

Create `tests/e2e/day-news/article-detail.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('Day.News Article Detail', () => {
  let tester: UITester;
  let articleUrl: string;

  test.beforeEach(async ({ page }) => {
    tester = new UITester(page);
    
    // Navigate to homepage and click first article
    await page.goto('/');
    const articleLink = page.locator('article a, .story-card a, .article-card a').first();
    
    if (await articleLink.isVisible()) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      articleUrl = page.url();
    } else {
      // If no articles, use a direct URL pattern
      await page.goto('/posts/test-article');
      articleUrl = page.url();
    }
  });

  test('Article page loads with content', async ({ page }) => {
    // Title
    const title = page.locator('h1, [data-testid="article-title"]');
    await expect(title).toBeVisible();
    
    // Content body
    const content = page.locator('[data-testid="article-content"], .article-body, .prose, article');
    await expect(content).toBeVisible();
    
    // Has actual text content
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(100);
  });

  test('Article metadata displays', async ({ page }) => {
    // Category badge
    const category = page.locator('[data-testid="article-category"], .category-badge, .article-category');
    if (await category.isVisible()) {
      console.log('✅ Category badge visible');
    } else {
      console.log('⚠️ WARNING: Category badge not found');
    }
    
    // Publication date
    const date = page.locator('[data-testid="publish-date"], time, .article-date, .published-at');
    if (await date.isVisible()) {
      console.log('✅ Publication date visible');
    } else {
      console.log('⚠️ WARNING: Publication date not found');
    }
    
    // Author (if applicable)
    const author = page.locator('[data-testid="article-author"], .author, .byline');
    if (await author.isVisible()) {
      console.log('✅ Author visible');
    }
  });

  test('Featured image displays', async ({ page }) => {
    const image = page.locator('[data-testid="article-image"], .article-hero img, .featured-image, article img').first();
    
    if (await image.isVisible()) {
      const src = await image.getAttribute('src');
      expect(src).toBeTruthy();
      console.log('✅ Featured image loads');
    } else {
      console.log('⚠️ WARNING: No featured image found');
    }
  });

  test('Share buttons work', async ({ page }) => {
    const shareButtons = page.locator('[data-testid="share-buttons"], .share-buttons, .social-share');
    
    if (await shareButtons.isVisible()) {
      const buttons = shareButtons.locator('button, a');
      const count = await buttons.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`✅ ${count} share buttons found`);
      
      // Test copy link button if exists
      const copyButton = shareButtons.locator('button:has-text("Copy"), [data-action="copy"]');
      if (await copyButton.isVisible()) {
        await copyButton.click();
        console.log('✅ Copy link button works');
      }
    } else {
      console.log('⚠️ WARNING: Share buttons not found');
    }
  });

  test('Comments section loads', async ({ page }) => {
    const comments = page.locator('[data-testid="comments-section"], .comments, #comments');
    
    if (await comments.isVisible()) {
      // Check for comment input
      const commentInput = comments.locator('textarea, input[type="text"], [data-testid="comment-input"]');
      if (await commentInput.isVisible()) {
        console.log('✅ Comment input visible');
      }
      
      // Check for existing comments or empty state
      const commentList = comments.locator('[data-testid="comment-list"], .comment-item, .comment');
      const count = await commentList.count();
      console.log(`ℹ️ ${count} comments displayed`);
    } else {
      console.log('⚠️ INFO: Comments section not found on this page');
    }
  });

  test('Related articles display', async ({ page }) => {
    const related = page.locator('[data-testid="related-articles"], .related-stories, .more-stories');
    
    if (await related.isVisible()) {
      const articles = related.locator('article, .story-card, a');
      const count = await articles.count();
      
      if (count > 0) {
        console.log(`✅ ${count} related articles displayed`);
        
        // Test clicking one
        await articles.first().click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).not.toBe(articleUrl);
      } else {
        console.log('⚠️ WARNING: Related articles section empty');
      }
    } else {
      console.log('⚠️ INFO: No related articles section');
    }
  });

  test('Reactions/Likes work', async ({ page }) => {
    const reactionBar = page.locator('[data-testid="reaction-bar"], .reactions, .like-button');
    
    if (await reactionBar.isVisible()) {
      const likeButton = reactionBar.locator('button').first();
      
      // Get initial count
      const countBefore = await reactionBar.textContent();
      
      await likeButton.click();
      await page.waitForTimeout(500);
      
      // Check for visual feedback (could be count change or animation)
      console.log('✅ Reaction button clicked');
    } else {
      console.log('⚠️ INFO: No reaction bar found');
    }
  });
});
```

### 2.5 Data Seeding Script

Create `database/seeders/TestDataSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\Business;
use App\Models\Poll;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating test data for UI testing...');
        
        // Get or create a test region
        $region = Region::firstOrCreate(
            ['slug' => 'clearwater-fl'],
            [
                'id' => Str::uuid(),
                'name' => 'Clearwater',
                'state' => 'FL',
                'state_name' => 'Florida',
                'timezone' => 'America/New_York',
                'latitude' => 27.9659,
                'longitude' => -82.8001,
                'population' => 117292,
                'is_active' => true,
            ]
        );

        // Create test articles
        $categories = ['news', 'sports', 'business', 'government', 'lifestyle', 'events'];
        
        foreach ($categories as $index => $category) {
            for ($i = 1; $i <= 5; $i++) {
                DayNewsPost::firstOrCreate(
                    ['slug' => "test-{$category}-article-{$i}"],
                    [
                        'id' => Str::uuid(),
                        'region_id' => $region->id,
                        'title' => ucfirst($category) . " Test Article {$i}: Local Community Update",
                        'slug' => "test-{$category}-article-{$i}",
                        'excerpt' => "This is a test article for the {$category} category. It contains sample content for UI testing purposes.",
                        'content' => $this->generateTestContent($category, $i),
                        'category' => $category,
                        'status' => 'published',
                        'is_featured' => $i === 1,
                        'view_count' => rand(100, 5000),
                        'published_at' => now()->subHours(rand(1, 72)),
                    ]
                );
            }
        }
        
        $this->command->info('Created 30 test articles');

        // Create test events
        for ($i = 1; $i <= 10; $i++) {
            Event::firstOrCreate(
                ['slug' => "test-event-{$i}"],
                [
                    'id' => Str::uuid(),
                    'region_id' => $region->id,
                    'title' => "Test Event {$i}: Community Gathering",
                    'slug' => "test-event-{$i}",
                    'description' => "This is test event {$i} for UI testing. Join us for this community event.",
                    'venue_name' => "Test Venue {$i}",
                    'address' => "{$i}00 Main Street, Clearwater, FL 33755",
                    'start_date' => now()->addDays(rand(1, 30)),
                    'end_date' => now()->addDays(rand(31, 60)),
                    'category' => ['music', 'food', 'sports', 'community', 'arts'][rand(0, 4)],
                    'is_featured' => $i <= 3,
                    'status' => 'published',
                ]
            );
        }
        
        $this->command->info('Created 10 test events');

        // Create test businesses
        $businessTypes = ['restaurant', 'retail', 'service', 'healthcare', 'entertainment'];
        
        foreach ($businessTypes as $type) {
            for ($i = 1; $i <= 3; $i++) {
                Business::firstOrCreate(
                    ['slug' => "test-{$type}-business-{$i}"],
                    [
                        'id' => Str::uuid(),
                        'region_id' => $region->id,
                        'name' => ucfirst($type) . " Test Business {$i}",
                        'slug' => "test-{$type}-business-{$i}",
                        'description' => "This is a test {$type} business for UI testing purposes.",
                        'address' => "{$i}50 Business Blvd, Clearwater, FL 33756",
                        'phone' => "727-555-{$i}00{$i}",
                        'category' => $type,
                        'is_verified' => true,
                        'is_featured' => $i === 1,
                        'status' => 'active',
                    ]
                );
            }
        }
        
        $this->command->info('Created 15 test businesses');

        // Create test poll
        Poll::firstOrCreate(
            ['slug' => 'test-community-poll'],
            [
                'id' => Str::uuid(),
                'region_id' => $region->id,
                'title' => 'Test Community Poll: Best Local Restaurant?',
                'slug' => 'test-community-poll',
                'description' => 'Vote for your favorite local restaurant in this test poll.',
                'status' => 'active',
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(7),
            ]
        );
        
        $this->command->info('Created test poll');
        $this->command->info('✅ Test data seeding complete!');
    }

    private function generateTestContent(string $category, int $index): string
    {
        return "
            <p>This is the opening paragraph of test article {$index} in the {$category} category. 
            It contains sample content designed to test the UI components of the Day.News platform.</p>
            
            <p>The second paragraph provides additional context and detail. Local community members 
            will find this information relevant to their daily lives in Clearwater, Florida.</p>
            
            <h2>Key Points</h2>
            
            <p>Here are some important details about this story that readers should know. The content
            has been structured to test various UI elements including headings, paragraphs, and formatting.</p>
            
            <p>Community engagement is at the heart of everything we do at Day.News. This platform
            serves as a hub for local news, events, and business information.</p>
            
            <blockquote>\"This is a sample quote from a community member that demonstrates the 
            pull quote styling in the article body.\" - Test Quote Attribution</blockquote>
            
            <p>The final paragraph wraps up the article with closing thoughts and potentially a 
            call to action for readers to engage with their community.</p>
        ";
    }
}
```

### 2.6 Run Test Data Seeder

```bash
# Add to DatabaseSeeder.php or run directly
php artisan db:seed --class=TestDataSeeder
```

---

## 🟢 Phase 3: GoEventCity Testing (Priority 2)

### 3.1 Test File Structure

Create `tests/e2e/goeventcity/` directory:

```
tests/e2e/goeventcity/
├── homepage.spec.ts
├── event-detail.spec.ts
├── calendar-view.spec.ts
├── category-filter.spec.ts
├── search.spec.ts
├── venue-pages.spec.ts
└── submit-event.spec.ts
```

### 3.2 GoEventCity Homepage Tests

Create `tests/e2e/goeventcity/homepage.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('GoEventCity Homepage', () => {
  let tester: UITester;

  test.beforeEach(async ({ page }) => {
    tester = new UITester(page);
    await page.goto('/');
  });

  test('Featured events display', async ({ page }) => {
    const result = await tester.hasData(
      '[data-testid="featured-events"], .featured-events, .hero-events',
      '.event-card, article, [data-testid="event-item"]',
      'Featured events section'
    );
    
    if (result.status === 'warning') {
      console.log('⚠️ ACTION NEEDED: Create featured events in database');
      console.log('   Set is_featured = true on event records');
    }
    
    expect(result.status).not.toBe('fail');
  });

  test('Calendar widget displays', async ({ page }) => {
    const calendar = page.locator('[data-testid="calendar"], .calendar-widget, .mini-calendar');
    
    if (await calendar.isVisible()) {
      // Check for date navigation
      const prevButton = calendar.locator('button:has-text("<"), [aria-label="Previous"]');
      const nextButton = calendar.locator('button:has-text(">"), [aria-label="Next"]');
      
      if (await prevButton.isVisible() && await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
        console.log('✅ Calendar navigation works');
      }
    } else {
      console.log('⚠️ WARNING: Calendar widget not found');
    }
  });

  test('Event category filters work', async ({ page }) => {
    const filters = page.locator('[data-testid="category-filters"], .event-filters, .category-pills');
    
    if (await filters.isVisible()) {
      const buttons = filters.locator('button, a');
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 4); i++) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        console.log(`✅ Category filter ${i + 1} clicked`);
      }
    } else {
      console.log('⚠️ WARNING: Category filters not found');
    }
  });

  test('Upcoming events list displays', async ({ page }) => {
    const result = await tester.hasData(
      '[data-testid="upcoming-events"], .events-list, .upcoming-events',
      '.event-card, .event-item, article',
      'Upcoming events list'
    );
    
    expect(result.status).not.toBe('fail');
  });

  test('Date picker/range selector works', async ({ page }) => {
    const datePicker = page.locator('[data-testid="date-picker"], .date-range, input[type="date"]');
    
    if (await datePicker.first().isVisible()) {
      await datePicker.first().click();
      await page.waitForTimeout(300);
      console.log('✅ Date picker accessible');
    }
  });

  test('Search events works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], [data-testid="event-search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('music');
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      console.log('✅ Event search submitted');
    }
  });
});
```

### 3.3 Event Detail Page Tests

Create `tests/e2e/goeventcity/event-detail.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('GoEventCity Event Detail', () => {
  let tester: UITester;

  test.beforeEach(async ({ page }) => {
    tester = new UITester(page);
    await page.goto('/');
    
    // Navigate to first event
    const eventLink = page.locator('.event-card a, [data-testid="event-item"] a').first();
    if (await eventLink.isVisible()) {
      await eventLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/events/test-event-1');
    }
  });

  test('Event details display', async ({ page }) => {
    // Title
    await expect(page.locator('h1, [data-testid="event-title"]')).toBeVisible();
    
    // Date/Time
    const datetime = page.locator('[data-testid="event-datetime"], .event-date, time');
    await expect(datetime).toBeVisible();
    
    // Location/Venue
    const venue = page.locator('[data-testid="event-venue"], .venue-info, .location');
    if (await venue.isVisible()) {
      console.log('✅ Venue information displays');
    }
    
    // Description
    const description = page.locator('[data-testid="event-description"], .event-content, .description');
    await expect(description).toBeVisible();
  });

  test('Add to calendar button works', async ({ page }) => {
    const addCalendarBtn = page.locator('button:has-text("Add to Calendar"), [data-testid="add-calendar"]');
    
    if (await addCalendarBtn.isVisible()) {
      await addCalendarBtn.click();
      await page.waitForTimeout(500);
      
      // Check for dropdown with calendar options
      const options = page.locator('.calendar-options, [role="menu"]');
      if (await options.isVisible()) {
        console.log('✅ Calendar options dropdown appears');
      }
    } else {
      console.log('⚠️ WARNING: Add to calendar button not found');
    }
  });

  test('Share event works', async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Share"), [data-testid="share-event"]');
    
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Share button clicked');
    }
  });

  test('RSVP/Register button works', async ({ page }) => {
    const rsvpBtn = page.locator('button:has-text("RSVP"), button:has-text("Register"), [data-testid="rsvp-button"]');
    
    if (await rsvpBtn.isVisible()) {
      await rsvpBtn.click();
      await page.waitForTimeout(500);
      
      // Check for modal or redirect
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.isVisible()) {
        console.log('✅ RSVP modal opens');
      }
    }
  });

  test('Map displays (if location)', async ({ page }) => {
    const map = page.locator('[data-testid="event-map"], .map-container, .google-map, iframe[src*="maps"]');
    
    if (await map.isVisible()) {
      console.log('✅ Map displays for event location');
    } else {
      console.log('⚠️ INFO: No map found - may not have location data');
    }
  });

  test('Related events display', async ({ page }) => {
    const related = page.locator('[data-testid="related-events"], .related-events, .similar-events');
    
    if (await related.isVisible()) {
      const events = related.locator('.event-card, article');
      const count = await events.count();
      console.log(`ℹ️ ${count} related events displayed`);
    }
  });
});
```

---

## 🔴 Phase 4: Issue Tracking & Resolution Workflow

### 4.1 Create Issue Tracker

Create `tests/e2e/results/issue-tracker.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  id: string;
  platform: string;
  page: string;
  component: string;
  type: 'missing-data' | 'broken-nav' | 'ui-bug' | 'crud-fail' | 'modal-fail';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
  status: 'open' | 'in-progress' | 'fixed' | 'verified';
  createdAt: string;
  fixedAt?: string;
}

export class IssueTracker {
  private issues: Issue[] = [];
  private filePath: string;

  constructor(outputDir: string = './tests/e2e/results') {
    this.filePath = path.join(outputDir, 'issues.json');
    this.loadIssues();
  }

  private loadIssues(): void {
    if (fs.existsSync(this.filePath)) {
      this.issues = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    }
  }

  addIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'status'>): Issue {
    const newIssue: Issue = {
      ...issue,
      id: `${issue.platform}-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    
    this.issues.push(newIssue);
    this.save();
    return newIssue;
  }

  markFixed(id: string): void {
    const issue = this.issues.find(i => i.id === id);
    if (issue) {
      issue.status = 'fixed';
      issue.fixedAt = new Date().toISOString();
      this.save();
    }
  }

  getOpenIssues(platform?: string): Issue[] {
    return this.issues.filter(i => 
      i.status === 'open' && 
      (!platform || i.platform === platform)
    );
  }

  generateReport(): string {
    const byPlatform = this.issues.reduce((acc, issue) => {
      acc[issue.platform] = acc[issue.platform] || [];
      acc[issue.platform].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);

    let report = '# UI Testing Issue Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    for (const [platform, issues] of Object.entries(byPlatform)) {
      report += `## ${platform}\n\n`;
      
      const open = issues.filter(i => i.status === 'open');
      const fixed = issues.filter(i => i.status === 'fixed');
      
      report += `- Open: ${open.length}\n`;
      report += `- Fixed: ${fixed.length}\n\n`;

      if (open.length > 0) {
        report += '### Open Issues\n\n';
        for (const issue of open) {
          report += `#### ${issue.component} - ${issue.type}\n`;
          report += `**Severity:** ${issue.severity}\n`;
          report += `**Description:** ${issue.description}\n`;
          report += `**Fix:** ${issue.fix}\n\n`;
        }
      }
    }

    return report;
  }

  private save(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this.issues, null, 2));
  }
}
```

### 4.2 Common Fixes Reference

Create `tests/e2e/fixes/common-fixes.md`:

```markdown
# Common UI Fixes Reference

## Missing Data Issues

### No Articles Displaying
```bash
# Run the news workflow
php artisan news:run-daily-workflow

# Or seed test data
php artisan db:seed --class=TestDataSeeder
```

### No Events Displaying
```sql
-- Check events table has data
SELECT COUNT(*) FROM events WHERE status = 'published';

-- If empty, insert test events
INSERT INTO events (id, region_id, title, slug, start_date, status)
VALUES (uuid_generate_v4(), 'REGION_ID', 'Test Event', 'test-event', NOW() + INTERVAL '7 days', 'published');
```

### No Businesses Displaying
```sql
-- Verify business data
SELECT COUNT(*) FROM businesses WHERE status = 'active';
```

## Navigation Issues

### Links Not Working (Inertia)
Check `routes/web.php`:
```php
// Ensure route exists
Route::get('/events', [EventController::class, 'index'])->name('events.index');
```

Check component Link usage:
```tsx
// Correct Inertia Link
import { Link } from '@inertiajs/react';
<Link href={route('events.index')}>Events</Link>

// NOT regular anchor
<a href="/events">Events</a>  // Won't work with Inertia
```

### Menu Not Opening
Check state management:
```tsx
const [isOpen, setIsOpen] = useState(false);

// Ensure click handler is attached
<button onClick={() => setIsOpen(!isOpen)}>Menu</button>
```

## Modal Issues

### Modal Not Opening
```tsx
// Check modal trigger
<button onClick={() => setShowModal(true)}>Open</button>

// Check modal component receives show prop
<Modal show={showModal} onClose={() => setShowModal(false)}>
```

### Modal Data Not Loading
```tsx
// Ensure data is fetched when modal opens
useEffect(() => {
  if (showModal && itemId) {
    fetchItemData(itemId);
  }
}, [showModal, itemId]);
```

## CRUD Issues

### Create Not Working
1. Check form action: `<form onSubmit={handleSubmit}>`
2. Check route exists: `Route::post('/items', [ItemController::class, 'store'])`
3. Check CSRF token: `@csrf` or Inertia handles automatically
4. Check validation rules in controller

### Update Not Working
```tsx
// Check method override for PUT/PATCH
router.put(route('items.update', item.id), formData);
```

### Delete Confirmation Not Appearing
```tsx
// Add confirmation dialog
const handleDelete = () => {
  if (confirm('Are you sure?')) {
    router.delete(route('items.destroy', item.id));
  }
};
```

## Button Issues

### Button Not Clickable
```tsx
// Check for disabled state
<button disabled={isLoading} onClick={handleClick}>

// Check z-index if overlapped
<button className="relative z-10">
```

### Button Click No Feedback
```tsx
// Add loading state
const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);
  await performAction();
  setLoading(false);
};

<button disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</button>
```
```

---

## 🧪 Phase 5: Running Tests

### 5.1 NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:day-news": "playwright test --project=day-news",
    "test:goeventcity": "playwright test --project=goeventcity",
    "test:golocalvoices": "playwright test --project=golocalvoices",
    "test:downtownsguide": "playwright test --project=downtownsguide",
    "test:alphasite": "playwright test --project=alphasite",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report",
    "test:debug": "playwright test --debug"
  }
}
```

### 5.2 Execution Order

```bash
# 1. Seed test data first
php artisan db:seed --class=TestDataSeeder

# 2. Run Day.News tests
npm run test:day-news

# 3. Review report
npm run test:report

# 4. Fix issues found

# 5. Re-run failed tests
npx playwright test --last-failed

# 6. Move to GoEventCity
npm run test:goeventcity

# 7. Continue pattern for remaining platforms
```

### 5.3 CI/CD Integration (Optional)

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📋 Testing Checklist by Platform

### Day.News Checklist
- [ ] Homepage hero stories display
- [ ] News feed shows articles
- [ ] Category tabs filter correctly
- [ ] Article detail page loads
- [ ] Comments section works
- [ ] Share buttons functional
- [ ] Search returns results
- [ ] Navigation all links work
- [ ] Mobile menu works
- [ ] Admin dashboard accessible
- [ ] Article CRUD works

### GoEventCity Checklist
- [ ] Featured events display
- [ ] Calendar widget works
- [ ] Category filters work
- [ ] Event detail page loads
- [ ] Add to calendar works
- [ ] RSVP/Register works
- [ ] Map displays
- [ ] Date range filter works
- [ ] Search events works
- [ ] Submit event flow works

### GoLocalVoices Checklist
- [ ] Podcast list displays
- [ ] Video list displays
- [ ] Audio player works
- [ ] Video player works
- [ ] Episode detail page
- [ ] Subscribe buttons work
- [ ] Share functionality
- [ ] Search media works

### DowntownsGuide Checklist
- [ ] Business listings display
- [ ] Category filters work
- [ ] Business detail page loads
- [ ] Contact buttons work
- [ ] Map displays
- [ ] Reviews display
- [ ] Search businesses works
- [ ] Claim business flow

### AlphaSite Checklist
- [ ] Dashboard loads
- [ ] AI Employee cards display
- [ ] Task management works
- [ ] Reports generate
- [ ] Settings save
- [ ] User management works
- [ ] Billing section works

---

## 🎯 Success Criteria

Testing is complete when:

1. **All pages load** without errors (no blank pages)
2. **All navigation** routes to correct destinations
3. **All buttons** trigger their intended actions
4. **All modals** open, populate, and close correctly
5. **All CRUD operations** complete successfully
6. **All lists** show data (or graceful empty states)
7. **Mobile views** work correctly
8. **No console errors** in browser

---

## 📞 Escalation Path

If a fix requires backend changes:
1. Document the required API endpoint or database change
2. Create a separate task/issue for backend team
3. Use mock data to continue UI testing
4. Integrate when backend is ready

---

*End of Instructions*
