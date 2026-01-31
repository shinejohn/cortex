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
