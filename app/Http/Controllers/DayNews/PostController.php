<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreDayNewsPostRequest;
use App\Http\Requests\DayNews\UpdateDayNewsPostRequest;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Services\DayNewsPostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class PostController extends Controller
{
    public function __construct(
        private readonly DayNewsPostService $postService
    ) {
        //
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DayNewsPost::class);

        $workspace = $request->user()->currentWorkspace;

        if (! $workspace) {
            abort(403, 'No workspace selected');
        }

        $query = DayNewsPost::where('workspace_id', $workspace->id)
            ->with(['regions', 'payment', 'author']);

        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $posts = $query->latest()
            ->paginate(15)
            ->through(fn ($post) => [
                'id' => $post->id,
                'type' => $post->type,
                'category' => $post->category,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'status' => $post->status,
                'view_count' => $post->view_count,
                'published_at' => $post->published_at?->toISOString(),
                'expires_at' => $post->expires_at?->toISOString(),
                'regions' => $post->regions->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]),
                'payment' => $post->payment ? [
                    'amount' => $post->payment->getAmountInDollars(),
                    'status' => $post->payment->status,
                ] : null,
                'can_edit' => $post->status === 'draft',
                'can_delete' => $request->user()->can('delete', $post),
            ]);

        return Inertia::render('day-news/posts/index', [
            'posts' => $posts,
            'filters' => $request->only(['type', 'status']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', DayNewsPost::class);

        $regions = Region::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'type' => $r->type,
            ]);

        $type = $request->query('type', 'article');

        return Inertia::render('day-news/posts/create', [
            'regions' => $regions,
            'initialType' => $type,
        ]);
    }

    public function store(StoreDayNewsPostRequest $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;

        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image')->store('day-news-posts', 'public');
        }

        $post = $this->postService->createPost(
            user: $request->user(),
            workspace: $workspace,
            data: $data
        );

        if ($post->status === 'published') {
            return redirect()
                ->route('day-news.posts.index')
                ->with('success', 'Post published successfully!');
        }

        return redirect()
            ->route('day-news.posts.publish', $post)
            ->with('info', 'Draft created. Please complete payment to publish.');
    }

    public function edit(DayNewsPost $post): Response
    {
        $this->authorize('update', $post);

        $post->load(['regions', 'payment']);

        $regions = Region::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'type' => $r->type,
            ]);

        return Inertia::render('day-news/posts/edit', [
            'post' => [
                'id' => $post->id,
                'type' => $post->type,
                'category' => $post->category,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'excerpt' => $post->excerpt,
                'featured_image' => $post->featured_image,
                'metadata' => $post->metadata,
                'status' => $post->status,
                'regions' => $post->regions->map(fn ($r) => $r->id),
            ],
            'regions' => $regions,
        ]);
    }

    public function update(UpdateDayNewsPostRequest $request, DayNewsPost $post): RedirectResponse
    {
        $this->authorize('update', $post);

        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $data['featured_image'] = $request->file('featured_image')->store('day-news-posts', 'public');
        }

        $this->postService->updatePost($post, $data);

        return back()->with('success', 'Post updated successfully.');
    }

    public function destroy(DayNewsPost $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }

        $this->postService->deletePost($post);

        return redirect()
            ->route('day-news.posts.index')
            ->with('success', 'Post deleted successfully.');
    }
}
