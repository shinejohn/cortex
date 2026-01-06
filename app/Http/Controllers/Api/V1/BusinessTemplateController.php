<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\BusinessTemplateResource;
use App\Models\Business;
use App\Models\BusinessTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessTemplateController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = BusinessTemplate::query()->where('is_active', true);

        if ($request->has('industry_id')) {
            $query->where('industry_id', $request->industry_id);
        }

        $templates = $query->paginate($request->get('per_page', 20));
        return $this->paginated($templates);
    }

    public function applyTemplate(Request $request, Business $business): JsonResponse
    {
        $this->authorize('update', $business);
        $request->validate(['template_id' => ['required', 'uuid', 'exists:business_templates,id']]);

        $template = BusinessTemplate::findOrFail($request->template_id);
        $business->update(['template_id' => $template->id]);

        return $this->success(new BusinessTemplateResource($template), 'Template applied successfully');
    }
}


