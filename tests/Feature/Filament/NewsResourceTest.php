<?php

declare(strict_types=1);

use App\Filament\Resources\News\NewsResource;
use App\Filament\Resources\News\Pages\CreateNews;
use App\Filament\Resources\News\Pages\EditNews;
use App\Filament\Resources\News\Pages\ListNews;
use App\Models\News;
use App\Models\Region;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Livewire\Livewire;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['app.admin_emails' => 'admin@example.com']);
    $this->admin = User::factory()->create(['email' => 'admin@example.com']);
    $this->actingAs($this->admin);
});

describe('NewsResource Navigation', function () {
    it('has correct navigation group', function () {
        expect(NewsResource::getNavigationGroup())->toBe('Day News');
    });

    it('has correct navigation icon', function () {
        expect(NewsResource::getNavigationIcon())->not->toBeNull();
    });

    it('has correct navigation label', function () {
        expect(NewsResource::getNavigationLabel())->toBe('News Articles');
    });

    it('displays navigation badge with published news count', function () {
        News::factory()->count(5)->create(['status' => 'published']);
        News::factory()->count(3)->create(['status' => 'draft']);

        expect(NewsResource::getNavigationBadge())->toBe('5');
        expect(NewsResource::getNavigationBadgeColor())->toBe('success');
    });
});

describe('NewsResource List Page', function () {
    it('can render list page', function () {
        Livewire::test(ListNews::class)
            ->assertSuccessful();
    });

    it('can list news articles', function () {
        $news = News::factory()->count(3)->create();

        Livewire::test(ListNews::class)
            ->assertCanSeeTableRecords($news);
    });

    it('can filter news by status', function () {
        $publishedNews = News::factory()->create(['status' => 'published']);
        $draftNews = News::factory()->create(['status' => 'draft']);

        Livewire::test(ListNews::class)
            ->filterTable('status', 'published')
            ->assertCanSeeTableRecords([$publishedNews])
            ->assertCanNotSeeTableRecords([$draftNews]);
    });

    it('can filter news by author', function () {
        $author1 = User::factory()->create();
        $author2 = User::factory()->create();

        $newsAuthor1 = News::factory()->create(['author_id' => $author1->id]);
        $newsAuthor2 = News::factory()->create(['author_id' => $author2->id]);

        Livewire::test(ListNews::class)
            ->filterTable('author_id', $author1->id)
            ->assertCanSeeTableRecords([$newsAuthor1])
            ->assertCanNotSeeTableRecords([$newsAuthor2]);
    });

    it('can sort news by published date', function () {
        News::factory()->create(['published_at' => now()->subDays(2)]);
        News::factory()->create(['published_at' => now()->subDay()]);

        Livewire::test(ListNews::class)
            ->sortTable('published_at', 'desc')
            ->assertSuccessful();
    });
});

describe('NewsResource Create Page', function () {
    it('can render create page', function () {
        Livewire::test(CreateNews::class)
            ->assertSuccessful();
    });

    it('can create news article', function () {
        $author = User::factory()->create();
        $region = Region::factory()->create();

        $newsData = [
            'title' => 'Breaking News: Test Article',
            'slug' => 'breaking-news-test-article',
            'excerpt' => 'This is a test excerpt',
            'content' => 'This is the full content of the test article.',
            'author_id' => $author->id,
            'status' => 'draft',
            'regions' => [$region->id],
        ];

        Livewire::test(CreateNews::class)
            ->fillForm($newsData)
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('news', [
            'title' => 'Breaking News: Test Article',
            'slug' => 'breaking-news-test-article',
            'status' => 'draft',
        ]);
    });

    it('auto-generates slug from title', function () {
        $author = User::factory()->create();

        Livewire::test(CreateNews::class)
            ->fillForm([
                'title' => 'Test News Article',
                'content' => 'Test content',
                'author_id' => $author->id,
                'status' => 'draft',
            ])
            ->assertFormSet([
                'slug' => 'test-news-article',
            ]);
    });

    it('requires title', function () {
        Livewire::test(CreateNews::class)
            ->fillForm([
                'title' => '',
            ])
            ->call('create')
            ->assertHasFormErrors(['title' => 'required']);
    });

    it('requires content', function () {
        Livewire::test(CreateNews::class)
            ->fillForm([
                'title' => 'Test',
                'content' => '',
            ])
            ->call('create')
            ->assertHasFormErrors(['content' => 'required']);
    });

    it('requires unique slug', function () {
        News::factory()->create(['slug' => 'existing-slug']);

        Livewire::test(CreateNews::class)
            ->fillForm([
                'title' => 'Test',
                'slug' => 'existing-slug',
            ])
            ->call('create')
            ->assertHasFormErrors(['slug' => 'unique']);
    });
});

describe('NewsResource Edit Page', function () {
    it('can render edit page', function () {
        $news = News::factory()->create();

        Livewire::test(EditNews::class, ['record' => $news->id])
            ->assertSuccessful();
    });

    it('can retrieve data', function () {
        $news = News::factory()->create();

        Livewire::test(EditNews::class, ['record' => $news->id])
            ->assertFormSet([
                'title' => $news->title,
                'slug' => $news->slug,
                'status' => $news->status,
            ]);
    });

    it('can update news article', function () {
        $news = News::factory()->create();

        Livewire::test(EditNews::class, ['record' => $news->id])
            ->fillForm([
                'title' => 'Updated Title',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        expect($news->fresh()->title)->toBe('Updated Title');
    });

    it('can delete news article', function () {
        $news = News::factory()->create();

        Livewire::test(EditNews::class, ['record' => $news->id])
            ->callAction(DeleteAction::class);

        $this->assertModelMissing($news);
    });

    it('can attach regions to news', function () {
        $news = News::factory()->create();
        $region1 = Region::factory()->create();
        $region2 = Region::factory()->create();

        Livewire::test(EditNews::class, ['record' => $news->id])
            ->fillForm([
                'regions' => [$region1->id, $region2->id],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        expect($news->fresh()->regions)->toHaveCount(2);
    });
});
