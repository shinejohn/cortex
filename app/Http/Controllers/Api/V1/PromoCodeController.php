<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StorePromoCodeRequest;
use App\Http\Resources\Api\V1\PromoCodeResource;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PromoCodeController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = PromoCode::query()->active();

        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        $codes = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($codes);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string']]);
        $code = PromoCode::where('code', $request->code)->active()->first();

        if (!$code || !$code->isValid()) {
            return $this->error('Invalid promo code', 'INVALID_CODE');
        }

        return $this->success(new PromoCodeResource($code), 'Promo code is valid');
    }
}


