<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Services\DayNewsPaymentService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

final class PostPaymentController extends Controller
{
    public function __construct(
        private readonly DayNewsPaymentService $paymentService
    ) {}

    public function success(Request $request): RedirectResponse|Response
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return redirect()
                ->route('day-news.posts.index')
                ->with('error', 'Payment session not found.');
        }

        try {
            $post = $this->paymentService->handleSuccessfulPayment($sessionId);

            return redirect()
                ->route('day-news.posts.index')
                ->with('success', 'Payment successful! Your post has been published.');
        } catch (Exception $e) {
            return redirect()
                ->route('day-news.posts.index')
                ->with('error', 'Payment processing failed. Please contact support.');
        }
    }

    public function cancel(Request $request): RedirectResponse
    {
        return redirect()
            ->route('day-news.posts.index')
            ->with('info', 'Payment cancelled. Your post remains as a draft.');
    }
}
