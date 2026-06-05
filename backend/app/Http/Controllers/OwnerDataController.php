<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\RoomOccupancy;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerDataController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $successfulStatuses = ['settlement', 'capture'];
        $rooms = Room::query()->get();
        $payments = Payment::query();

        return response()->json([
            'success' => true,
            'data' => [
                'total_rooms' => $rooms->count(),
                'available_rooms' => $rooms->where('room_status', 'available')->count(),
                'occupied_rooms' => $rooms->where('room_status', 'occupied')->count(),
                'maintenance_rooms' => $rooms->where('room_status', 'maintenance')->count(),
                'active_tenants' => RoomOccupancy::where('status', 'active')->distinct('user_id')->count('user_id'),
                'pending_applications' => RentalApplication::where('status', 'pending')->count(),
                'successful_payments' => (clone $payments)->whereIn('transaction_status', $successfulStatuses)->count(),
                'paid_revenue' => (int) Payment::whereIn('transaction_status', $successfulStatuses)->sum('gross_amount'),
                'pending_payments' => Payment::where('transaction_status', 'pending')->count(),
            ],
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $payments = Payment::with(['rentalApplication.user', 'rentalApplication.room.branch'])
            ->latest()
            ->get();

        $successfulStatuses = ['settlement', 'capture'];
        $failedStatuses = ['expire', 'cancel', 'deny'];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_collected' => (int) $payments
                        ->whereIn('transaction_status', $successfulStatuses)
                        ->sum('gross_amount'),
                    'paid_count' => $payments->whereIn('transaction_status', $successfulStatuses)->count(),
                    'failed_count' => $payments->whereIn('transaction_status', $failedStatuses)->count(),
                    'pending_count' => $payments->where('transaction_status', 'pending')->count(),
                    'tenant_count' => $payments
                        ->pluck('rentalApplication.user_id')
                        ->filter()
                        ->unique()
                        ->count(),
                ],
                'payments' => $payments->map(fn (Payment $payment) => $this->formatPayment($payment))->values(),
            ],
        ]);
    }

    public function tenants(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $occupancies = RoomOccupancy::with(['user', 'room.branch', 'rentalApplication.payment'])
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $occupancies->map(fn (RoomOccupancy $occupancy) => [
                'id' => $occupancy->id,
                'user_id' => $occupancy->user_id,
                'room_id' => $occupancy->room_id,
                'rental_application_id' => $occupancy->rental_application_id,
                'tenant' => $occupancy->user?->toProfileArray(),
                'room' => $occupancy->room ? [
                    'id' => $occupancy->room->id,
                    'room_name' => $occupancy->room->room_name,
                    'branch' => $occupancy->room->branch ? [
                        'id' => $occupancy->room->branch->id,
                        'branch_name' => $occupancy->room->branch->branch_name,
                    ] : null,
                ] : null,
                'start_date' => optional($occupancy->start_date)->toDateString(),
                'end_date' => optional($occupancy->end_date)->toDateString(),
                'status' => $occupancy->status,
                'payment_status' => $occupancy->rentalApplication?->payment_status,
                'payment' => $occupancy->rentalApplication?->payment ? [
                    'order_id' => $occupancy->rentalApplication->payment->order_id,
                    'gross_amount' => $occupancy->rentalApplication->payment->gross_amount,
                    'transaction_status' => $occupancy->rentalApplication->payment->transaction_status,
                    'paid_at' => optional($occupancy->rentalApplication->payment->paid_at)->toDateTimeString(),
                ] : null,
            ])->values(),
        ]);
    }

    private function formatPayment(Payment $payment): array
    {
        $application = $payment->rentalApplication;
        $tenant = $application?->user;
        $room = $application?->room;

        return [
            'id' => $payment->id,
            'rental_application_id' => $payment->rental_application_id,
            'order_id' => $payment->order_id,
            'transaction_id' => $payment->transaction_id,
            'gross_amount' => $payment->gross_amount,
            'payment_type' => $payment->payment_type,
            'transaction_status' => $payment->transaction_status,
            'snap_token' => $payment->snap_token,
            'paid_at' => optional($payment->paid_at)->toDateTimeString(),
            'created_at' => $payment->created_at,
            'updated_at' => $payment->updated_at,
            'tenant' => $tenant?->toProfileArray(),
            'room' => $room ? [
                'id' => $room->id,
                'room_name' => $room->room_name,
                'branch' => $room->branch ? [
                    'id' => $room->branch->id,
                    'branch_name' => $room->branch->branch_name,
                ] : null,
            ] : null,
            'rental_application' => $application ? [
                'id' => $application->id,
                'duration' => $application->duration,
                'status' => $application->status,
                'payment_status' => $application->payment_status,
                'move_in_date' => optional($application->move_in_date)->toDateString(),
            ] : null,
        ];
    }

    private function ensureOwner(Request $request): ?JsonResponse
    {
        if ($request->user()?->role === 'owner') {
            return null;
        }

        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki akses untuk aksi ini',
            'data' => null,
        ], 403);
    }
}
