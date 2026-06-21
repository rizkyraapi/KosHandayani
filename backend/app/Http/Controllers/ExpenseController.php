<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Expense;
use App\Services\OwnerAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    public function __construct(private readonly OwnerAnalyticsService $analytics) {}

    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $validated = $request->validate([
            'branch_id' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value !== null && $value !== '' && $value !== 'all' && ! filter_var($value, FILTER_VALIDATE_INT)) {
                        $fail('Cabang yang dipilih tidak valid.');
                    }
                },
            ],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'category' => ['nullable', Rule::in(Expense::CATEGORIES)],
        ]);

        $branchId = isset($validated['branch_id']) && ! in_array($validated['branch_id'], ['', 'all'], true)
            ? (int) $validated['branch_id']
            : null;

        if ($branchId && ! Branch::whereKey($branchId)->exists()) {
            return response()->json([
                'message' => 'Cabang yang dipilih tidak ditemukan.',
                'errors' => ['branch_id' => ['Cabang yang dipilih tidak ditemukan.']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $this->analytics->expenses(
                branchId: $branchId,
                year: (int) ($validated['year'] ?? now()->year),
                month: isset($validated['month']) ? (int) $validated['month'] : null,
                category: $validated['category'] ?? null,
            ),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $validated = $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'category' => ['required', Rule::in(Expense::CATEGORIES)],
            'description' => ['nullable', 'string', 'max:2000'],
            'amount' => ['required', 'integer', 'gt:0'],
            'expense_date' => ['required', 'date'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $expense = Expense::create([
            'branch_id' => $validated['branch_id'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'receipt_path' => $request->file('receipt')?->store('expenses/receipts', 'public'),
            'expense_date' => $validated['expense_date'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengeluaran berhasil ditambahkan.',
            'data' => $this->analytics->formatExpense($expense->load(['branch', 'creator'])),
        ], 201);
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
