<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketOrderItem;
use App\Services\TicketGiftService;
use App\Services\TicketTransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TicketActionController extends Controller
{
    public function transfer(Request $request, TicketOrderItem $ticketOrderItem): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
        ]);

        $transfer = app(TicketTransferService::class)->createTransfer(
            $ticketOrderItem,
            $request->user(),
            $validated['recipient_email']
        );

        return response()->json(['transfer' => $transfer, 'message' => 'Transfer initiated']);
    }

    public function gift(Request $request, TicketOrderItem $ticketOrderItem): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        $gift = app(TicketGiftService::class)->createGift(
            $ticketOrderItem,
            $request->user(),
            $validated['recipient_email'],
            $validated
        );

        return response()->json(['gift' => $gift, 'message' => 'Gift sent']);
    }
}
