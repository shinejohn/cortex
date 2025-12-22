<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use App\Models\PhotoAlbum;
use App\Services\DayNews\PhotoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PhotoController extends Controller
{
    public function __construct(
        private readonly PhotoService $photoService
    ) {}

    /**
     * Display photos gallery
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $category = $request->get('category', 'all');
        $search = $request->get('search', '');

        $query = Photo::approved()
            ->public()
            ->with(['user', 'regions', 'album'])
            ->orderBy('created_at', 'desc');

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Filter by category
        if ($category !== 'all') {
            $query->byCategory($category);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $photos = $query->paginate(24)->withQueryString();

        return Inertia::render('day-news/photos/index', [
            'photos' => $photos,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show photo upload form
     */
    public function create(): Response
    {
        $albums = PhotoAlbum::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('day-news/photos/create', [
            'albums' => $albums,
        ]);
    }

    /**
     * Store new photo
     */
    public function store(\App\Http\Requests\DayNews\StorePhotoRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $photo = $this->photoService->uploadPhoto(
            $request->file('image'),
            $validated,
            $request->user()->id,
            $validated['album_id'] ?? null
        );

        return redirect()
            ->route('day-news.photos.show', $photo->id)
            ->with('success', 'Photo uploaded successfully!');
    }

    /**
     * Display single photo
     */
    public function show(Request $request, Photo $photo): Response
    {
        $photo->load(['user', 'regions', 'album', 'albums']);
        $photo->incrementViewsCount();

        // Get related photos
        $related = Photo::approved()
            ->public()
            ->where('id', '!=', $photo->id)
            ->where(function ($q) use ($photo) {
                $q->where('category', $photo->category)
                    ->orWhereHas('regions', function ($regionQuery) use ($photo) {
                        $regionQuery->whereIn('region_id', $photo->regions->pluck('id'));
                    });
            })
            ->with(['user', 'album'])
            ->limit(12)
            ->get();

        return Inertia::render('day-news/photos/show', [
            'photo' => $photo,
            'related' => $related,
        ]);
    }

    /**
     * Delete photo
     */
    public function destroy(Photo $photo): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('delete', $photo);

        $this->photoService->deletePhoto($photo);

        return redirect()
            ->route('day-news.photos.index')
            ->with('success', 'Photo deleted successfully!');
    }

    /**
     * Display photo albums
     */
    public function albums(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');

        $query = PhotoAlbum::where('visibility', 'public')
            ->with(['user', 'photos' => function ($q) {
                $q->approved()->limit(4);
            }])
            ->orderBy('created_at', 'desc');

        if ($currentRegion) {
            $query->whereHas('photos.regions', function ($q) use ($currentRegion) {
                $q->where('region_id', $currentRegion->id);
            });
        }

        $albums = $query->paginate(20)->withQueryString();

        return Inertia::render('day-news/photos/albums', [
            'albums' => $albums,
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show album
     */
    public function showAlbum(Request $request, PhotoAlbum $album): Response
    {
        $album->load(['user', 'photos' => function ($q) {
            $q->approved()->orderBy('created_at', 'desc');
        }]);
        $album->incrementViewsCount();

        return Inertia::render('day-news/photos/album-show', [
            'album' => $album,
        ]);
    }

    /**
     * Create album
     */
    public function createAlbum(): Response
    {
        return Inertia::render('day-news/photos/create-album');
    }

    /**
     * Store album
     */
    public function storeAlbum(\App\Http\Requests\DayNews\StorePhotoAlbumRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $album = $this->photoService->createAlbum(
            $validated,
            $request->user()->id,
            $request->user()->currentWorkspace?->id
        );

        return redirect()
            ->route('day-news.photos.album.show', $album->id)
            ->with('success', 'Album created successfully!');
    }
}

