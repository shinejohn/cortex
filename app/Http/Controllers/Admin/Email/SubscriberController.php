<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Email;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\EmailSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        $subscribers = EmailSubscriber::query()
            ->with('community:id,name')
            ->when($request->community_id, fn($q, $c) => $q->where('community_id', $c))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->search, fn($q, $s) => $q->where('email', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Admin/Email/Subscribers/Index', [
            'subscribers' => $subscribers,
            'filters' => $request->only(['community_id', 'status', 'type', 'search']),
            'communities' => Community::select('id', 'name')->orderBy('name')->get(),
            'statuses' => ['pending', 'active', 'unsubscribed', 'bounced', 'complained'],
            'types' => ['reader', 'smb'],
        ]);
    }

    public function show(EmailSubscriber $subscriber): Response
    {
        $subscriber->load(['community', 'business']);

        return Inertia::render('Admin/Email/Subscribers/Show', [
            'subscriber' => $subscriber,
        ]);
    }
}
