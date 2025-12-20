<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use App\Models\Coupon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        $coupon = $this->route('coupon');
        return $this->user() !== null && $this->user()->id === $coupon->user_id;
    }

    public function rules(): array
    {
        $coupon = $this->route('coupon');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'discount_type' => ['sometimes', 'required', 'string', Rule::in([
                'percentage',
                'fixed_amount',
                'buy_one_get_one',
                'free_item',
            ])],
            'discount_value' => ['nullable', 'numeric', 'min:0', 'required_if:discount_type,percentage,fixed_amount'],
            'terms' => ['nullable', 'string', 'max:1000'],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon->id)],
            'image' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'business_name' => ['sometimes', 'required', 'string', 'max:255'],
            'business_id' => ['nullable', 'exists:businesses,id'],
            'business_location' => ['nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after:start_date'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Coupon title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 2,000 characters.',
            'discount_type.required' => 'Discount type is required.',
            'discount_type.in' => 'Invalid discount type selected.',
            'discount_value.required_if' => 'Discount value is required for percentage and fixed amount discounts.',
            'discount_value.numeric' => 'Discount value must be a valid number.',
            'discount_value.min' => 'Discount value cannot be negative.',
            'terms.max' => 'Terms cannot exceed 1,000 characters.',
            'code.max' => 'Code cannot exceed 50 characters.',
            'code.unique' => 'This coupon code is already in use.',
            'image.image' => 'The file must be an image.',
            'image.max' => 'Image file size cannot exceed 5MB.',
            'image.mimes' => 'Image must be a JPEG, PNG, GIF, or WebP file.',
            'business_name.required' => 'Business name is required.',
            'business_name.max' => 'Business name cannot exceed 255 characters.',
            'business_id.exists' => 'Selected business does not exist.',
            'business_location.max' => 'Business location cannot exceed 255 characters.',
            'start_date.required' => 'Start date is required.',
            'start_date.date' => 'Start date must be a valid date.',
            'end_date.required' => 'End date is required.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.after' => 'End date must be after start date.',
            'usage_limit.integer' => 'Usage limit must be a valid number.',
            'usage_limit.min' => 'Usage limit must be at least 1.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
        ];
    }
}

