<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use RuntimeException;

class MidtransService
{
    public function createSnapToken(array $payload): string
    {
        $this->configure();

        return Snap::getSnapToken($payload);
    }

    public function getTransactionStatus(string $orderId): array
    {
        $this->configure();

        return (array) Transaction::status($orderId);
    }

    public function isValidNotificationSignature(array $payload): bool
    {
        if (app()->environment('local')) {
            return true;
        }

        $serverKey = config('services.midtrans.server_key');

        foreach (['order_id', 'status_code', 'gross_amount', 'signature_key'] as $key) {
            if (! isset($payload[$key])) {
                return false;
            }
        }

        if (! $serverKey) {
            return false;
        }

        $signature = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].$serverKey
        );

        return hash_equals($signature, (string) $payload['signature_key']);
    }

    private function configure(): void
    {
        $serverKey = config('services.midtrans.server_key');

        if (! $serverKey) {
            throw new RuntimeException('Midtrans server key belum dikonfigurasi.');
        }

        Config::$serverKey = $serverKey;
        Config::$clientKey = config('services.midtrans.client_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }
}
