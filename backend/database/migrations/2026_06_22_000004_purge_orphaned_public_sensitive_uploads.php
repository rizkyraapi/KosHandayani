<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $referencedDocuments = collect();

        if (Schema::hasTable('rental_applications')) {
            $referencedDocuments = $referencedDocuments
                ->concat(DB::table('rental_applications')->pluck('ktp_file'))
                ->concat(DB::table('rental_applications')->pluck('kk_file'));
        }

        $this->deleteUnreferencedFiles(
            'rental_documents',
            $referencedDocuments->filter()->unique()->all(),
        );

        $referencedReceipts = Schema::hasTable('expenses')
            ? DB::table('expenses')->whereNotNull('receipt_path')->pluck('receipt_path')->all()
            : [];

        $this->deleteUnreferencedFiles('expenses/receipts', $referencedReceipts);
    }

    public function down(): void
    {
        // Orphaned sensitive files cannot be reconstructed safely.
    }

    private function deleteUnreferencedFiles(string $directory, array $referencedPaths): void
    {
        $referenced = array_fill_keys($referencedPaths, true);

        foreach (Storage::disk('public')->files($directory) as $path) {
            if (! isset($referenced[$path])) {
                Storage::disk('public')->delete($path);
            }
        }
    }
};
