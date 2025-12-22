<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewService $reviewService
    ) {}

    /**
     * Display reviews for a business
     */
    public function index(Request $request, Business $business): Response
    {
        $filters = [
            'status' => 'approved',
            'rating' => $request->input('rating'),
            'sort_by' => $request->get('sort', 'created_at'),
            'sort_order' => $request->get('direction', 'desc'),
        ];

        $reviews = $this->reviewService->getForModel($business, $filters, 20);
        $averageRating = $this->reviewService->getAverageRating($business);
        $ratingDistribution = $this->reviewService->getRatingDistribution($business);
        $reviewCount = $this->reviewService->getReviewCount($business);

        return Inertia::render('downtown-guide/reviews/index', [
            'business' => $business,
            'reviews' => $reviews,
            'averageRating' => $averageRating,
            'ratingDistribution' => $ratingDistribution,
            'reviewCount' => $reviewCount,
            'filters' => $request->only(['rating', 'sort']),
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Show review creation form
     */
    public function create(Request $request, Business $business): Response
    {
        $this->authorize('create', Review::class);

        return Inertia::render('downtown-guide/reviews/create', [
            'business' => $business,
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Store a new review
     */
    public function store(Request $request, Business $business): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('create', Review::class);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|min:10',
            'rating' => 'required|numeric|min:1|max:5',
        ]);

        $review = $this->reviewService->create(
            $business,
            $validated,
            $request->user()->id
        );

        return redirect()
            ->route('downtown-guide.businesses.show', $business->slug)
            ->with('success', 'Review submitted successfully! It will be published after moderation.');
    }

    /**
     * Mark review as helpful
     */
    public function helpful(Request $request, Review $review): \Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $review);

        $updatedReview = $this->reviewService->markAsHelpful($review, $request->user()->id);

        return response()->json([
            'helpful_count' => $updatedReview->helpful_count,
            'message' => 'Thank you for your feedback!',
        ]);
    }
}

