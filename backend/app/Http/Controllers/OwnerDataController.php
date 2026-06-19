<?php

namespace App\Http\Controllers;

use App\Services\OwnerAnalyticsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class OwnerDataController extends Controller
{
    public function __construct(private readonly OwnerAnalyticsService $analytics) {}

    public function dashboard(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        return $this->success($this->analytics->dashboard($this->branchId($request)));
    }

    public function rooms(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        return $this->success($this->analytics->rooms($this->branchId($request)));
    }

    public function applications(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        return $this->success($this->analytics->applicationMonitoring($this->branchId($request)));
    }

    public function payments(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        return $this->success($this->analytics->payments($this->branchId($request)));
    }

    public function tenants(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        return $this->success($this->analytics->tenants($this->branchId($request)));
    }

    public function reports(Request $request): JsonResponse
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $filters = $this->reportFilters($request);

        return $this->success($this->analytics->reports(
            year: $filters['year'],
            month: $filters['month'],
            branchId: $filters['branch_id'],
        ));
    }

    public function exportReportPdf(Request $request): Response
    {
        if ($response = $this->ensureOwner($request)) {
            return $response;
        }

        $filters = $this->reportFilters($request);
        $report = $this->analytics->reports(
            year: $filters['year'],
            month: $filters['month'],
            branchId: $filters['branch_id'],
        );
        $logoPath = resource_path('images/koshandayani-logo.svg');
        $logoDataUri = is_file($logoPath)
            ? 'data:image/svg+xml;base64,'.base64_encode((string) file_get_contents($logoPath))
            : null;
        $filename = implode('-', array_filter([
            'laporan-keuangan-kos-handayani',
            (string) $filters['year'],
            $filters['month'] ? str_pad((string) $filters['month'], 2, '0', STR_PAD_LEFT) : null,
            Str::slug($report['export']['meta']['branch_label']),
        ])).'.pdf';

        return Pdf::loadView('owner.reports.pdf', [
            'report' => $report,
            'logoDataUri' => $logoDataUri,
        ])
            ->setOption('isPhpEnabled', true)
            ->setPaper('a4', 'portrait')
            ->download($filename);
    }

    /**
     * @return array{year: int, month: ?int, branch_id: ?int}
     */
    private function reportFilters(Request $request): array
    {
        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        return [
            'year' => (int) ($validated['year'] ?? now()->year),
            'month' => isset($validated['month']) ? (int) $validated['month'] : null,
            'branch_id' => $this->branchId($request),
        ];
    }

    private function branchId(Request $request): ?int
    {
        $branchScope = $request->query('branch_id');

        if ($branchScope === null || $branchScope === '' || $branchScope === 'all') {
            return null;
        }

        return (int) Validator::make(
            ['branch_id' => $branchScope],
            ['branch_id' => ['required', 'integer', 'exists:branches,id']],
        )->validate()['branch_id'];
    }

    private function success(array $data): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
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
