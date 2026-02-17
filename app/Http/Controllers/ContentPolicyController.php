<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final class ContentPolicyController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('ContentPolicy', [
            'lastUpdated' => '2026-02-17',
        ]);
    }
}
