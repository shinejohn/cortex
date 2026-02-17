<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class PagesController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('downtown-guide/pages/about');
    }

    public function privacy(): Response
    {
        return Inertia::render('downtown-guide/pages/privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('downtown-guide/pages/terms');
    }
}
