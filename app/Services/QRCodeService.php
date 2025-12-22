<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TicketOrderItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class QRCodeService
{
    /**
     * Generate QR code for a ticket order item
     */
    public function generateForTicketOrderItem(TicketOrderItem $ticketOrderItem): string
    {
        // Generate a unique ticket code
        $ticketCode = $this->generateTicketCode($ticketOrderItem);

        // Create QR code data URL
        $qrData = $this->generateQRCodeData($ticketCode, $ticketOrderItem);

        // Store QR code as image file
        $qrCodePath = $this->storeQRCode($ticketCode, $qrData);

        // Update ticket order item with QR code path
        $ticketOrderItem->update([
            'qr_code' => $qrCodePath,
            'ticket_code' => $ticketCode,
        ]);

        return $qrCodePath;
    }

    /**
     * Generate a unique ticket code
     */
    private function generateTicketCode(TicketOrderItem $ticketOrderItem): string
    {
        // Format: ORDER_ID-ITEM_ID-RANDOM
        $orderId = Str::substr($ticketOrderItem->ticket_order_id, 0, 8);
        $itemId = Str::substr($ticketOrderItem->id, 0, 8);
        $random = Str::random(8);

        return strtoupper("{$orderId}-{$itemId}-{$random}");
    }

    /**
     * Generate QR code data (URL or data string)
     */
    private function generateQRCodeData(string $ticketCode, TicketOrderItem $ticketOrderItem): string
    {
        // Create a verification URL for the ticket
        $baseUrl = config('app.url');
        $verificationUrl = "{$baseUrl}/tickets/verify/{$ticketCode}";

        return $verificationUrl;
    }

    /**
     * Store QR code image file
     */
    private function storeQRCode(string $ticketCode, string $data): string
    {
        // Use a simple QR code generation API (no external dependencies)
        // In production, you might want to use a library like simplesoftwareio/simple-qrcode
        $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=".urlencode($data);

        // Download and store the QR code image
        $qrCodeImage = file_get_contents($qrCodeUrl);
        $filename = "tickets/qr-codes/{$ticketCode}.png";
        Storage::disk('public')->put($filename, $qrCodeImage);

        return $filename;
    }

    /**
     * Get QR code image URL
     */
    public function getQRCodeUrl(string $qrCodePath): string
    {
        return Storage::disk('public')->url($qrCodePath);
    }

    /**
     * Verify ticket code
     */
    public function verifyTicketCode(string $ticketCode): ?TicketOrderItem
    {
        $ticketOrderItem = TicketOrderItem::where('ticket_code', $ticketCode)
            ->with(['ticketOrder.event', 'ticketPlan'])
            ->first();

        if (!$ticketOrderItem) {
            return null;
        }

        // Check if ticket order is completed
        if ($ticketOrderItem->ticketOrder->status !== 'completed') {
            return null;
        }

        return $ticketOrderItem;
    }
}

