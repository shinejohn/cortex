<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreBusinessSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tier' => ['required', 'string', 'in:free,basic,premium'],
            'billing_cycle' => ['required', 'string', 'in:monthly,yearly'],
            'auto_renew' => ['sometimes', 'boolean'],
        ];
    }
}


