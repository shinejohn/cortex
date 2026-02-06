<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\ClassifiedCategory;
use Illuminate\Http\JsonResponse;

final class ClassifiedCategoryController extends Controller
{
    /**
     * Get specifications for a category.
     */
    public function specifications(ClassifiedCategory $category): JsonResponse
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
}
