<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreClassifiedRequest;
use App\Http\Requests\DayNews\UpdateClassifiedRequest;
use App\Models\Classified;
use App\Models\ClassifiedCategory;
use App\Models\SavedClassified;
use App\Services\ClassifiedService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class ClassifiedController extends Controller
{
    public function __construct(
        private readonly ClassifiedService $classifiedService
    ) {}

    /**
     * Display the classifieds discovery page.
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $regionId = $currentRegion?->id;

        $categoryId = $request->query('category');
        $condition = $request->query('condition');
        $minPrice = $request->query('min_price') ? (float) $request->query('min_price') : null;
        $maxPrice = $request->query('max_price') ? (float) $request->query('max_price') : null;
        $search = $request->query('search');
        $showGlobal = $request->boolean('global', false);

        // Get featured classifieds
        $featuredClassifieds = $this->classifiedService->getFeaturedClassifieds($regionId, 6);

        // Get all classifieds with pagination
        $classifieds = $this->classifiedService->getClassifieds(
            regionId: $regionId,
            categoryId: $categoryId,
            condition: $condition,
            minPrice: $minPrice,
            maxPrice: $maxPrice,
            search: $search,
            showGlobal: $showGlobal,
            perPage: 12
        );

        // Transform for frontend
        $user = $request->user();
        $transformClassified = $this->getCardTransformer($user);

        return Inertia::render('day-news/classifieds/index', [
            'featuredClassifieds' => $featuredClassifieds->map($transformClassified),
            'classifieds' => $classifieds->through($transformClassified),
            'categories' => $this->getCategoryTree(),
            'conditions' => $this->getConditions(),
            'filters' => [
                'category' => $categoryId,
                'condition' => $condition,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'search' => $search,
                'global' => $showGlobal,
            ],
            'hasRegion' => $currentRegion !== null,
        ]);
    }

    /**
     * Display a single classified listing.
     */
    public function show(string $slug, Request $request): Response
    {
        $classified = Classified::with([
            'category.parent',
            'images',
            'regions',
            'user',
            'specificationValues.specification',
            'customAttributes',
            'activeRootComments.user',
            'activeRootComments.activeReplies.user',
        ])
            ->where('slug', $slug)
            ->firstOrFail();

        $this->authorize('view', $classified);

        $classified->incrementViewCount();

        $user = $request->user();

        // Get similar classifieds
        $similarClassifieds = $this->classifiedService->getSimilarClassifieds($classified, 4);

        // Contact info is only shown to authenticated users
        $contactInfo = $user ? [
            'email' => $classified->contact_email,
            'phone' => $classified->contact_phone,
        ] : null;

        return Inertia::render('day-news/classifieds/show', [
            'classified' => [
                'id' => $classified->id,
                'title' => $classified->title,
                'slug' => $classified->slug,
                'description' => $classified->description,
                'price' => $classified->price,
                'price_type' => $classified->price_type,
                'price_display' => $classified->price_display,
                'condition' => $classified->condition,
                'condition_display' => $classified->condition_display,
                'status' => $classified->status,
                'view_count' => $classified->view_count,
                'saves_count' => $classified->saves_count,
                'created_at' => $classified->created_at->toISOString(),
                'user' => [
                    'id' => $classified->user->id,
                    'name' => $classified->user->name,
                    'created_at' => $classified->user->created_at?->toISOString(),
                    'is_verified' => $classified->user->email_verified_at !== null,
                ],
                'category' => [
                    'id' => $classified->category->id,
                    'name' => $classified->category->name,
                    'slug' => $classified->category->slug,
                    'parent' => $classified->category->parent ? [
                        'id' => $classified->category->parent->id,
                        'name' => $classified->category->parent->name,
                        'slug' => $classified->category->parent->slug,
                    ] : null,
                ],
                'images' => $classified->images->map(fn ($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'is_primary' => $img->is_primary,
                ]),
                'regions' => $classified->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                ]),
                'specifications' => $classified->specificationValues->map(fn ($sv) => [
                    'name' => $sv->specification->name,
                    'value' => $sv->value,
                ]),
                'custom_attributes' => $classified->customAttributes->map(fn ($attr) => [
                    'key' => $attr->key,
                    'value' => $attr->value,
                ]),
                'is_saved' => $user ? $classified->isSavedBy($user) : false,
                'is_owner' => $user ? $classified->isOwnedBy($user) : false,
                'comments' => $classified->activeRootComments->map(function ($comment) use ($user) {
                    return $this->transformComment($comment, $user);
                }),
            ],
            'contact' => $contactInfo,
            'canViewContact' => (bool) $user,
            'similarClassifieds' => $similarClassifieds->map($this->getCardTransformer($user)),
        ]);
    }

    /**
     * Show the create classified form.
     */
    public function create(): Response
    {
        $this->authorize('create', Classified::class);

        return Inertia::render('day-news/classifieds/create', [
            'categories' => $this->getCategoryTree(),
            'conditions' => $this->getConditions(),
            'priceTypes' => $this->getPriceTypes(),
        ]);
    }

    /**
     * Store a new classified listing.
     */
    public function store(StoreClassifiedRequest $request): RedirectResponse|JsonResponse
    {
        $classified = $this->classifiedService->createClassified(
            user: $request->user(),
            data: $request->validated()
        );

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Your listing has been created successfully!',
                'classified' => [
                    'id' => $classified->id,
                    'slug' => $classified->slug,
                ],
            ], 201);
        }

        return redirect()
            ->route('daynews.classifieds.show', $classified->slug)
            ->with('success', 'Your listing has been created successfully!');
    }

    /**
     * Show the edit classified form.
     */
    public function edit(Classified $classified): Response
    {
        $this->authorize('update', $classified);

        $classified->load(['category', 'images', 'regions', 'specificationValues.specification', 'customAttributes']);

        // Get specifications for the category
        $categorySpecs = $classified->category->getAllSpecifications();

        return Inertia::render('day-news/classifieds/edit', [
            'classified' => [
                'id' => $classified->id,
                'title' => $classified->title,
                'description' => $classified->description,
                'price' => $classified->price,
                'price_type' => $classified->price_type,
                'condition' => $classified->condition,
                'contact_email' => $classified->contact_email,
                'contact_phone' => $classified->contact_phone,
                'classified_category_id' => $classified->classified_category_id,
                'category' => [
                    'id' => $classified->category->id,
                    'name' => $classified->category->name,
                ],
                'images' => $classified->images->map(fn ($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'is_primary' => $img->is_primary,
                ]),
                'region_ids' => $classified->regions->pluck('id'),
                'regions' => $classified->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'type' => $r->type,
                ]),
                'specifications' => $classified->specificationValues->pluck('value', 'classified_specification_id'),
                'custom_attributes' => $classified->customAttributes->map(fn ($attr) => [
                    'key' => $attr->key,
                    'value' => $attr->value,
                ]),
            ],
            'categorySpecifications' => $categorySpecs->map(fn ($spec) => [
                'id' => $spec->id,
                'name' => $spec->name,
                'key' => $spec->key,
                'type' => $spec->type,
                'options' => $spec->options,
                'is_required' => $spec->is_required,
            ]),
            'categories' => $this->getCategoryTree(),
            'conditions' => $this->getConditions(),
            'priceTypes' => $this->getPriceTypes(),
        ]);
    }

    /**
     * Update a classified listing.
     */
    public function update(UpdateClassifiedRequest $request, Classified $classified): RedirectResponse|JsonResponse
    {
        $updatedClassified = $this->classifiedService->updateClassified($classified, $request->validated());

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Your listing has been updated successfully!',
                'classified' => [
                    'id' => $updatedClassified->id,
                    'slug' => $updatedClassified->slug,
                ],
            ]);
        }

        return redirect()
            ->route('daynews.classifieds.show', $classified->slug)
            ->with('success', 'Your listing has been updated successfully!');
    }

    /**
     * Delete a classified listing.
     */
    public function destroy(Classified $classified): RedirectResponse
    {
        $this->authorize('delete', $classified);

        $this->classifiedService->deleteClassified($classified);

        return redirect()
            ->route('daynews.classifieds.index')
            ->with('success', 'Your listing has been deleted.');
    }

    /**
     * Mark a classified as sold.
     */
    public function markSold(Classified $classified): RedirectResponse
    {
        $this->authorize('update', $classified);

        $this->classifiedService->markAsSold($classified);

        return redirect()
            ->back()
            ->with('success', 'Your listing has been marked as sold.');
    }

    /**
     * Reactivate a classified listing.
     */
    public function reactivate(Classified $classified): RedirectResponse
    {
        $this->authorize('update', $classified);

        $this->classifiedService->reactivate($classified);

        return redirect()
            ->back()
            ->with('success', 'Your listing has been reactivated.');
    }

    /**
     * Return the specifications for a classified category as JSON.
     */
    public function categorySpecifications(ClassifiedCategory $category): JsonResponse
    {
        $specifications = $category->getAllSpecifications();

        return response()->json([
            'specifications' => $specifications->map(fn ($spec) => [
                'id' => $spec->id,
                'name' => $spec->name,
                'key' => $spec->key,
                'type' => $spec->type,
                'options' => $spec->options,
                'is_required' => $spec->is_required,
            ])->values(),
        ]);
    }

    /**
     * Toggle save/unsave a classified for the authenticated user.
     */
    public function toggleSave(Request $request, Classified $classified): JsonResponse
    {
        $user = $request->user();

        $existing = SavedClassified::where('classified_id', $classified->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isSaved = false;
        } else {
            SavedClassified::create([
                'classified_id' => $classified->id,
                'user_id' => $user->id,
            ]);
            $isSaved = true;
        }

        $classified->recalculateSavesCount();

        return response()->json([
            'is_saved' => $isSaved,
            'saves_count' => $classified->fresh()->saves_count,
        ]);
    }

    /**
     * Send a contact request about a classified listing.
     */
    public function contact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'classified_id' => ['required', 'exists:classifieds,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        DB::table('classified_contacts')->insert([
            'classified_id' => $validated['classified_id'],
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Your message has been sent to the seller.',
        ]);
    }

    /**
     * Display user's own classified listings.
     */
    public function myClassifieds(Request $request): Response
    {
        $classifieds = $this->classifiedService->getMyClassifieds($request->user());

        return Inertia::render('day-news/classifieds/my-classifieds', [
            'classifieds' => $classifieds->through(fn ($classified) => [
                'id' => $classified->id,
                'title' => $classified->title,
                'slug' => $classified->slug,
                'price_display' => $classified->price_display,
                'condition_display' => $classified->condition_display,
                'status' => $classified->status,
                'saves_count' => $classified->saves_count,
                'view_count' => $classified->view_count,
                'created_at' => $classified->created_at->toISOString(),
                'primary_image' => $classified->primary_image,
                'category' => [
                    'id' => $classified->category->id,
                    'name' => $classified->category->name,
                ],
                'can_edit' => $request->user()->can('update', $classified),
                'can_delete' => $request->user()->can('delete', $classified),
            ]),
        ]);
    }

    /**
     * Display user's saved classified listings.
     */
    public function savedClassifieds(Request $request): Response
    {
        $classifieds = $this->classifiedService->getSavedClassifieds($request->user());
        $user = $request->user();

        return Inertia::render('day-news/classifieds/saved', [
            'classifieds' => $classifieds->through($this->getCardTransformer($user)),
        ]);
    }

    /**
     * Report a classified listing.
     */
    public function report(Request $request, Classified $classified): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::table('reports')->insert([
            'reportable_type' => 'classified',
            'reportable_id' => $classified->id,
            'user_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Report submitted successfully.']);
        }

        return redirect()->back()->with('success', 'Report submitted. We will review it shortly.');
    }

    /**
     * Get category tree with children.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getCategoryTree(): array
    {
        $categories = ClassifiedCategory::query()
            ->active()
            ->topLevel()
            ->with(['children' => fn ($q) => $q->active()->orderBy('display_order')])
            ->orderBy('display_order')
            ->get();

        return $categories->map(fn ($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'slug' => $cat->slug,
            'icon' => $cat->icon,
            'children' => $cat->children->map(fn ($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'slug' => $child->slug,
                'icon' => $child->icon,
            ])->toArray(),
        ])->toArray();
    }

    /**
     * Get available conditions.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function getConditions(): array
    {
        return [
            ['value' => 'new', 'label' => 'New'],
            ['value' => 'like_new', 'label' => 'Like New'],
            ['value' => 'good', 'label' => 'Good'],
            ['value' => 'fair', 'label' => 'Fair'],
            ['value' => 'for_parts', 'label' => 'For Parts'],
        ];
    }

    /**
     * Get available price types.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function getPriceTypes(): array
    {
        return [
            ['value' => 'fixed', 'label' => 'Fixed Price'],
            ['value' => 'negotiable', 'label' => 'Negotiable'],
            ['value' => 'free', 'label' => 'Free'],
            ['value' => 'contact', 'label' => 'Contact for Price'],
        ];
    }

    /**
     * Get a transformer function for classified cards.
     */
    private function getCardTransformer($user): Closure
    {
        return function ($classified) use ($user) {
            return [
                'id' => $classified->id,
                'title' => $classified->title,
                'slug' => $classified->slug,
                'price' => $classified->price,
                'price_display' => $classified->price_display,
                'condition' => $classified->condition,
                'condition_display' => $classified->condition_display,
                'primary_image' => $classified->primary_image,
                'created_at' => $classified->created_at->toISOString(),
                'category' => [
                    'id' => $classified->category->id,
                    'name' => $classified->category->name,
                ],
                'regions' => $classified->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                ]),
                'is_saved' => $user ? $classified->isSavedBy($user) : false,
            ];
        };
    }

    /**
     * Transform a comment for the frontend.
     *
     * @return array<string, mixed>
     */
    private function transformComment($comment, $user): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at->toISOString(),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ],
            'likes_count' => $comment->likesCount(),
            'is_liked' => $user ? $comment->isLikedBy($user) : false,
            'replies' => $comment->activeReplies->map(function ($reply) use ($user) {
                return $this->transformComment($reply, $user);
            }),
        ];
    }
}
