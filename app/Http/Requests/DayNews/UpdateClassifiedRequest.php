<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateClassifiedRequest extends FormRequest
{
    public function authorize(): bool
    {
        $classified = $this->route('classified');
        return $this->user() !== null && $this->user()->id === $classified->user_id;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'required', 'string', Rule::in([
                'for_sale',
                'housing',
                'jobs',
                'services',
                'community',
                'personals',
            ])],
            'subcategory' => ['nullable', 'string', 'max:100'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'max:5000'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'price_type' => ['nullable', 'string', Rule::in(['fixed', 'negotiable', 'contact_for_pricing'])],
            'condition' => ['nullable', 'string', 'max:50'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required' => 'Category is required.',
            'category.in' => 'Invalid category selected.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'description.required' => 'Description is required.',
            'description.max' => 'Description cannot exceed 5,000 characters.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price cannot be negative.',
            'price_type.in' => 'Invalid price type selected.',
            'location.required' => 'Location is required.',
            'location.max' => 'Location cannot exceed 255 characters.',
            'images.max' => 'You can upload a maximum of 5 images.',
            'images.*.image' => 'All files must be images.',
            'images.*.max' => 'Each image file size cannot exceed 5MB.',
            'images.*.mimes' => 'Images must be JPEG, PNG, GIF, or WebP files.',
        ];
    }
}

