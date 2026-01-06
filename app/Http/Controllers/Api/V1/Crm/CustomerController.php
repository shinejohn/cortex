<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreCustomerRequest;
use App\Http\Requests\Api\V1\UpdateCustomerRequest;
use App\Http\Resources\Api\V1\Crm\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group CRM
 * 
 * Customer management endpoints for CRM operations.
 */
final class CustomerController extends BaseController
{
    /**
     * List customers.
     * 
     * @queryParam tenant_id string Filter by tenant ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam lifecycle_stage string Filter by lifecycle stage (lead, mql, sql, customer). Example: lead
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()->with(['tenant', 'smbBusiness']);

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('lifecycle_stage')) {
            $query->where('lifecycle_stage', $request->lifecycle_stage);
        }

        $customers = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($customers);
    }

    /**
     * Get customer details.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "first_name": "John",
     *     "last_name": "Doe",
     *     "email": "john@example.com",
     *     "lifecycle_stage": "lead"
     *   }
     * }
     * 
     * @authenticated
     */
    public function show(Customer $customer): JsonResponse
    {
        return $this->success(new CustomerResource($customer->load(['tenant', 'smbBusiness', 'deals', 'interactions', 'tasks'])));
    }

    /**
     * Create customer.
     * 
     * @bodyParam tenant_id string required The tenant ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam smb_business_id string The SMB business ID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam first_name string required The customer's first name. Example: John
     * @bodyParam last_name string required The customer's last name. Example: Doe
     * @bodyParam email string required The customer's email. Example: john@example.com
     * @bodyParam phone string The customer's phone number. Example: +1-555-123-4567
     * @bodyParam lifecycle_stage string The lifecycle stage. Example: lead
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Customer created successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());
        return $this->success(new CustomerResource($customer), 'Customer created successfully', 201);
    }

    /**
     * Update customer.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam first_name string The customer's first name. Example: John
     * @bodyParam last_name string The customer's last name. Example: Doe
     * @bodyParam email string The customer's email. Example: john@example.com
     * @bodyParam lifecycle_stage string The lifecycle stage. Example: customer
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Customer updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);
        $customer->update($request->validated());
        return $this->success(new CustomerResource($customer), 'Customer updated successfully');
    }

    /**
     * Delete customer.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);
        $customer->delete();
        return $this->noContent();
    }

    /**
     * Get customer interactions.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function interactions(Request $request, Customer $customer): JsonResponse
    {
        $interactions = $customer->interactions()->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));
        return $this->paginated($interactions);
    }

    /**
     * Get customer deals.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function deals(Request $request, Customer $customer): JsonResponse
    {
        $deals = $customer->deals()->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));
        return $this->paginated($deals);
    }

    /**
     * Get customer tasks.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function tasks(Request $request, Customer $customer): JsonResponse
    {
        $tasks = $customer->tasks()->orderBy('due_date')->paginate($request->get('per_page', 20));
        return $this->paginated($tasks);
    }

    /**
     * Get customer campaigns.
     * 
     * @urlParam customer string required The customer UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function campaigns(Request $request, Customer $customer): JsonResponse
    {
        $campaigns = $customer->campaignRecipients()->with('campaign')->paginate($request->get('per_page', 20));
        return $this->paginated($campaigns);
    }

    /**
     * Search customers.
     * 
     * @queryParam q string required Search query (name or email). Example: john
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...]
     * }
     * 
     * @authenticated
     */
    public function search(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($request->has('q')) {
            $query->where('first_name', 'like', '%'.$request->q.'%')
                ->orWhere('last_name', 'like', '%'.$request->q.'%')
                ->orWhere('email', 'like', '%'.$request->q.'%');
        }

        $customers = $query->limit(20)->get();
        return $this->success(CustomerResource::collection($customers));
    }
}

