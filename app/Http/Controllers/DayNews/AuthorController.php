<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DayNews\AuthorService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AuthorController extends Controller
{
    public function __construct(
        private readonly AuthorService $authorService
    ) {}

    /**
     * Display authors listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $search = $request->get('search', '');

        $query = User::whereHas('authoredDayNewsPosts', function ($q) {
            $q->published();
        })
            ->withCount(['authoredDayNewsPosts' => function ($q) {
                $q->published();
            }])
            ->orderBy('authored_day_news_posts_count', 'desc');

        // Filter by region
        if ($currentRegion) {
            $query->whereHas('authoredDayNewsPosts.regions', function ($q) use ($currentRegion) {
                $q->where('region_id', $currentRegion->id);
            });
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        $authors = $query->paginate(20)->withQueryString();

        return Inertia::render('day-news/authors/index', [
            'authors' => $authors,
            'filters' => [
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Display author profile
     */
    public function show(Request $request, string $author): Response
    {
        $authorModel = $this->authorService->getAuthorByIdentifier($author);
        
        if (!$authorModel) {
            abort(404, 'Author not found');
        }

        $authorModel->loadCount(['authoredDayNewsPosts' => function ($q) {
            $q->published();
        }]);

        // Get author's articles
        $articles = $authorModel->authoredDayNewsPosts()
            ->published()
            ->with(['regions'])
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        // Get analytics
        $analytics = $this->authorService->getAuthorAnalytics($authorModel, 30);

        // Update trust score
        $this->authorService->updateAuthorMetrics($authorModel);
        $authorModel->refresh();

        return Inertia::render('day-news/authors/show', [
            'author' => [
                'id' => $authorModel->id,
                'name' => $authorModel->name,
                'bio' => $authorModel->bio,
                'avatar' => $authorModel->profile_photo_url ?? $authorModel->avatar,
                'author_slug' => $authorModel->author_slug,
                'trust_score' => $authorModel->trust_score,
                'trust_tier' => $authorModel->trust_tier,
                'is_verified_author' => $authorModel->is_verified_author,
                'posts_count' => $authorModel->authored_day_news_posts_count,
            ],
            'articles' => $articles,
            'analytics' => $analytics,
        ]);
    }

    /**
     * Show author profile creation/edit form
     */
    public function create(): Response
    {
        return Inertia::render('day-news/authors/create');
    }

    /**
     * Store author profile
     */
    public function store(\App\Http\Requests\DayNews\StoreAuthorProfileRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $user = $request->user();

        if (empty($validated['author_slug'])) {
            $validated['author_slug'] = $this->authorService->generateAuthorSlug($user);
        }

        $user->update($validated);

        // Update trust metrics
        $this->authorService->updateAuthorMetrics($user);

        $identifier = $user->author_slug ?: $user->id;
        
        return redirect()
            ->route('day-news.authors.show', $identifier)
            ->with('success', 'Author profile updated successfully!');
    }
}

