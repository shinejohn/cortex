<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class NewsletterController extends Controller
{
    /**
     * Subscribe an email to the newsletter.
     */
    public function subscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        DB::table('email_subscribers')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'user_id' => $request->user()?->id,
                'source' => 'footer',
                'status' => 'active',
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
                'updated_at' => now(),
            ]
        );

        return redirect()->back()->with('success', 'You have been subscribed to our newsletter!');
    }
}
