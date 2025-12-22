# GoEventCity API Documentation

**Version:** 1.0  
**Base URL:** `/api`  
**Date:** 2025-12-20

---

## Authentication

Most API endpoints require authentication. Include the authentication token in the request headers:

```
Authorization: Bearer {token}
```

---

## Hub APIs

### List Hubs
**GET** `/hubs`

**Query Parameters:**
- `search` (string, optional) - Search hubs by name or description
- `category` (string, optional) - Filter by category
- `featured` (boolean, optional) - Show only featured hubs
- `verified` (boolean, optional) - Show only verified hubs
- `page` (integer, optional) - Page number for pagination

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Hub Name",
      "slug": "hub-slug",
      "description": "Hub description",
      "category": "music",
      "is_featured": true,
      "is_verified": false,
      "followers_count": 100,
      "events_count": 25
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### Get Hub
**GET** `/hubs/{hub:slug}`

**Response:**
```json
{
  "id": "uuid",
  "name": "Hub Name",
  "slug": "hub-slug",
  "description": "Hub description",
  "sections": [...],
  "members": [...],
  "analytics": {...}
}
```

### Create Hub
**POST** `/hubs`

**Request Body:**
```json
{
  "name": "Hub Name",
  "description": "Hub description",
  "category": "music",
  "workspace_id": "uuid"
}
```

**Response:** 201 Created with hub data

### Update Hub
**PUT** `/hubs/{hub}`

**Request Body:** Same as create

**Response:** 200 OK with updated hub data

### Delete Hub
**DELETE** `/hubs/{hub}`

**Response:** 200 OK

### Track Hub Page View
**POST** `/api/hubs/{hub}/analytics/track-view`

**Response:**
```json
{
  "message": "Page view tracked"
}
```

### Get Hub Analytics Stats
**GET** `/api/hubs/{hub}/analytics/stats`

**Query Parameters:**
- `date_range` (string, optional) - Number of days (default: 30)

**Response:**
```json
{
  "totals": {
    "page_views": 1000,
    "unique_visitors": 500,
    "events_created": 25,
    "members_joined": 50
  },
  "averages": {
    "page_views": 33.33,
    "unique_visitors": 16.67,
    "engagement_score": 75.5
  }
}
```

---

## Check-in APIs

### Create Check-in
**POST** `/api/events/{event}/check-in`

**Request Body:**
```json
{
  "location": "Main Entrance",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "notes": "Optional notes",
  "is_public": true
}
```

**Response:** 201 Created
```json
{
  "message": "Checked in successfully.",
  "check_in": {
    "id": "uuid",
    "event_id": "uuid",
    "user_id": "uuid",
    "checked_in_at": "2025-12-20T12:00:00Z"
  }
}
```

### Get Event Check-ins
**GET** `/api/events/{event}/check-ins`

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "name": "User Name",
      "avatar": "url"
    },
    "checked_in_at": "2025-12-20T12:00:00Z",
    "notes": "Optional notes"
  }
]
```

### Plan Event
**POST** `/api/events/{event}/plan`

**Response:** 200 OK
```json
{
  "id": "uuid",
  "event_id": "uuid",
  "user_id": "uuid",
  "planned_at": "2025-12-20T12:00:00Z"
}
```

### Unplan Event
**DELETE** `/api/events/{event}/unplan`

**Response:** 200 OK
```json
{
  "success": true
}
```

---

## Promo Code APIs

### Validate Promo Code
**POST** `/api/promo-codes/validate`

**Request Body:**
```json
{
  "code": "PROMO20",
  "amount": 100.00,
  "event_id": "uuid" // optional
}
```

**Response:** 200 OK
```json
{
  "valid": true,
  "promo_code": {
    "id": "uuid",
    "code": "PROMO20",
    "type": "percentage",
    "value": 20
  },
  "discount": 20.00,
  "final_amount": 80.00
}
```

**Error Response:** 404 Not Found or 400 Bad Request
```json
{
  "valid": false,
  "message": "Invalid promo code."
}
```

### List Promo Codes
**GET** `/promo-codes`

**Query Parameters:**
- `active` (boolean, optional) - Filter active codes
- `code` (string, optional) - Search by code

**Response:** Paginated list of promo codes

### Create Promo Code
**POST** `/promo-codes`

**Request Body:**
```json
{
  "code": "PROMO20",
  "description": "20% off",
  "type": "percentage",
  "value": 20,
  "min_purchase": 50.00,
  "max_discount": 25.00,
  "usage_limit": 100,
  "is_active": true,
  "starts_at": "2025-01-01T00:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z",
  "applicable_to": ["event-uuid-1", "event-uuid-2"] // optional
}
```

**Response:** 201 Created

---

## Ticket Marketplace APIs

### List Ticket Listings
**GET** `/tickets/marketplace`

**Query Parameters:**
- `event_id` (uuid, optional) - Filter by event
- `status` (string, optional) - Filter by status (available, sold, cancelled)
- `min_price` (decimal, optional) - Minimum price
- `max_price` (decimal, optional) - Maximum price

**Response:** Paginated list of ticket listings

### Create Ticket Listing
**POST** `/tickets/list-for-sale`

**Request Body:**
```json
{
  "original_ticket_order_item_id": "uuid",
  "event_id": "uuid",
  "price": 50.00,
  "quantity": 1
}
```

**Response:** 201 Created

### Purchase Ticket Listing
**POST** `/tickets/marketplace/{listing}/purchase`

**Response:** Redirects to payment or returns order data

### Transfer Ticket
**POST** `/tickets/transfer/{ticketOrderItem}`

**Request Body:**
```json
{
  "receiver_user_id": "uuid",
  "message": "Transfer message" // optional
}
```

**Response:** 201 Created

### Accept Ticket Transfer
**POST** `/tickets/transfer/{transfer}/complete`

**Response:** 200 OK

### Decline Ticket Transfer
**POST** `/tickets/transfer/{transfer}/cancel`

**Response:** 200 OK

### Gift Ticket
**POST** `/tickets/gift/{ticketOrderItem}`

**Request Body:**
```json
{
  "receiver_email": "recipient@example.com",
  "receiver_user_id": "uuid", // optional if user exists
  "message": "Gift message" // optional
}
```

**Response:** 201 Created

### Redeem Ticket Gift
**GET** `/tickets/gift/redeem/{token}`

**Response:** 200 OK with gift details

---

## Ticket Order APIs

### Create Ticket Order
**POST** `/api/ticket-orders`

**Request Body:**
```json
{
  "event_id": "uuid",
  "items": [
    {
      "ticket_plan_id": "uuid",
      "quantity": 2
    }
  ],
  "promo_code": {
    "code": "PROMO20"
  }, // optional
  "billing_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St"
  } // optional
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "status": "pending",
  "total": 100.00,
  "session_id": "stripe_session_id", // if paid
  "url": "https://checkout.stripe.com/..." // if paid
}
```

**Free Tickets Response:** 201 Created with completed order (no session_id/url)

### Get Ticket Order
**GET** `/api/ticket-orders/{order}`

**Response:**
```json
{
  "id": "uuid",
  "event": {...},
  "items": [
    {
      "id": "uuid",
      "ticket_plan": {...},
      "quantity": 2,
      "unit_price": 50.00,
      "total_price": 100.00,
      "qr_code": "path/to/qr-code.svg"
    }
  ],
  "status": "completed",
  "payment_status": "completed",
  "total": 100.00
}
```

### Verify Ticket
**GET** `/tickets/verify/{ticketCode}`

**Response:** 200 OK
```json
{
  "valid": true,
  "message": "Ticket verified successfully.",
  "ticket": {
    "id": "uuid",
    "ticket_order": {...},
    "ticket_plan": {...},
    "qr_code_verified_at": "2025-12-20T12:00:00Z"
  }
}
```

**Error Response:** 404 Not Found or 400 Bad Request
```json
{
  "valid": false,
  "message": "Invalid QR code."
}
```

---

## Booking APIs

### Get Booking Financial Breakdown
**GET** `/api/bookings/{booking}/financial-breakdown`

**Response:**
```json
{
  "base_price": 500.00,
  "fees": [
    {
      "name": "Service Fee",
      "amount": 50.00,
      "type": "percentage",
      "value": 10
    }
  ],
  "subtotal": 500.00,
  "total_fees": 52.50,
  "discount": 0,
  "total": 552.50,
  "paid": 0,
  "remaining": 552.50,
  "currency": "USD"
}
```

### Advance Booking Step
**POST** `/api/bookings/{booking}/advance-step`

**Response:** 200 OK with updated booking

---

## Weather APIs

### Get Event Weather
**GET** `/api/events/{event}/weather`

**Response:**
```json
{
  "temperature": 72.5,
  "condition": "Clear",
  "description": "clear sky",
  "icon": "01d",
  "humidity": 65,
  "wind_speed": 5.2,
  "forecast": [
    {
      "date": "2025-12-21",
      "temperature": 75.0,
      "condition": "Partly Cloudy"
    }
  ]
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error message"]
  }
}
```

### Pagination Response
```json
{
  "data": [...],
  "links": {
    "first": "url",
    "last": "url",
    "prev": "url",
    "next": "url"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited:
- **Authenticated:** 60 requests per minute
- **Unauthenticated:** 30 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1638360000
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Server Error |

---

## Webhooks

### Stripe Webhook
**POST** `/stripe/webhook`

**Events Handled:**
- `checkout.session.completed` - Ticket order payment completed
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.failed` - Payment failed

**Headers Required:**
```
Stripe-Signature: signature
```

---

**Last Updated:** 2025-12-20

