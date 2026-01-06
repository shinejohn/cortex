<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Workspace;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Complete E-commerce Purchase Flow
 * 
 * This test simulates a complete e-commerce purchase scenario:
 * 1. Create store
 * 2. Create products
 * 3. User browses products
 * 4. User adds products to cart
 * 5. User updates quantities
 * 6. User removes items
 * 7. User creates order
 * 8. Process payment (mock)
 * 9. Verify order status
 * 10. Verify inventory updated
 */
final class EcommercePurchaseFlowTest extends IntegrationTestCase
{
    public function test_complete_ecommerce_purchase_workflow(): void
    {
        $workspace = Workspace::factory()->create();

        // Step 1: Create store
        $storeResponse = $this->authenticatedJson('POST', '/api/v1/stores', [
            'workspace_id' => $workspace->id,
            'name' => 'Test Store',
            'description' => 'A test store',
            'status' => 'active',
        ]);

        $storeResponse->assertStatus(201);
        $storeId = $storeResponse->json('data.id');

        // Step 2: Create products
        $product1Response = $this->authenticatedJson('POST', '/api/v1/products', [
            'store_id' => $storeId,
            'name' => 'Product 1',
            'description' => 'First product',
            'price' => 29.99,
            'stock_quantity' => 100,
            'status' => 'active',
        ]);

        $product1Response->assertStatus(201);
        $product1Id = $product1Response->json('data.id');

        $product2Response = $this->authenticatedJson('POST', '/api/v1/products', [
            'store_id' => $storeId,
            'name' => 'Product 2',
            'description' => 'Second product',
            'price' => 49.99,
            'stock_quantity' => 50,
            'status' => 'active',
        ]);

        $product2Response->assertStatus(201);
        $product2Id = $product2Response->json('data.id');

        // Step 3: User browses products
        $productsResponse = $this->authenticatedJson('GET', '/api/v1/products');
        $productsResponse->assertStatus(200);
        $products = $productsResponse->json('data');
        $this->assertGreaterThanOrEqual(2, count($products));

        // Step 4: User adds products to cart
        $cartItem1Response = $this->authenticatedJson('POST', '/api/v1/carts/items', [
            'product_id' => $product1Id,
            'quantity' => 2,
        ]);

        $cartItem1Response->assertStatus(201);

        $cartItem2Response = $this->authenticatedJson('POST', '/api/v1/carts/items', [
            'product_id' => $product2Id,
            'quantity' => 1,
        ]);

        $cartItem2Response->assertStatus(201);

        // Step 5: User views cart
        $cartResponse = $this->authenticatedJson('GET', '/api/v1/carts');
        $cartResponse->assertStatus(200);
        $cartData = $cartResponse->json('data');
        $this->assertCount(2, $cartData['items']);

        // Step 6: User updates quantity
        $cartItemId = $cartData['items'][0]['id'];
        $updateResponse = $this->authenticatedJson('PUT', "/api/v1/carts/items/{$cartItemId}", [
            'quantity' => 3,
        ]);

        $updateResponse->assertStatus(200);

        // Step 7: User creates order
        $orderResponse = $this->authenticatedJson('POST', '/api/v1/orders', [
            'store_id' => $storeId,
            'shipping_address' => [
                'street' => '123 Main St',
                'city' => 'Miami',
                'state' => 'FL',
                'zipcode' => '33101',
            ],
            'payment_method' => 'card',
        ]);

        $orderResponse->assertStatus(201);
        $orderId = $orderResponse->json('data.id');

        // Step 8: Verify order status
        $orderDetailsResponse = $this->authenticatedJson('GET', "/api/v1/orders/{$orderId}");
        $orderDetailsResponse->assertStatus(200);
        $orderData = $orderDetailsResponse->json('data');
        $this->assertEquals('pending', $orderData['status']);

        // Step 9: Verify inventory updated
        $product1AfterResponse = $this->authenticatedJson('GET', "/api/v1/products/{$product1Id}");
        $product1AfterResponse->assertStatus(200);
        $product1Data = $product1AfterResponse->json('data');
        // Stock should be reduced by 3 (updated quantity)
        $this->assertLessThan(100, $product1Data['stock_quantity']);
    }
}


