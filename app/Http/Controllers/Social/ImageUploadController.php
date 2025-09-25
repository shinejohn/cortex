<?php

declare(strict_types=1);

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class ImageUploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'max:2048'], // 2MB max
        ]);

        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        // Store in public disk under social/images folder
        $path = $file->storeAs('social/images', $filename, 'public');

        // Generate full URL
        $url = asset('storage/'.$path);

        return response()->json([
            'url' => $url,
            'path' => $path,
        ]);
    }
}
