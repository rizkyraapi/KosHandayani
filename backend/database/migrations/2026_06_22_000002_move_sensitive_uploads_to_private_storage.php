<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $this->movePaths('public', 'local', $this->sensitivePaths());
    }

    public function down(): void
    {
        $this->movePaths('local', 'public', $this->sensitivePaths());
    }

    private function sensitivePaths(): array
    {
        $paths = collect();

        if (Schema::hasTable('rental_applications')) {
            $paths = $paths
                ->concat(DB::table('rental_applications')->pluck('ktp_file'))
                ->concat(DB::table('rental_applications')->pluck('kk_file'));
        }

        if (Schema::hasTable('expenses')) {
            $paths = $paths->concat(DB::table('expenses')->pluck('receipt_path'));
        }

        return $paths
            ->filter(fn (mixed $path): bool => is_string($path) && $path !== '')
            ->unique()
            ->values()
            ->all();
    }

    private function movePaths(string $sourceDisk, string $targetDisk, array $paths): void
    {
        foreach ($paths as $path) {
            if (! Storage::disk($sourceDisk)->exists($path)) {
                continue;
            }

            if (! Storage::disk($targetDisk)->exists($path)) {
                $stream = Storage::disk($sourceDisk)->readStream($path);

                if ($stream === false) {
                    continue;
                }

                try {
                    if (! Storage::disk($targetDisk)->put($path, $stream)) {
                        continue;
                    }
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            }

            Storage::disk($sourceDisk)->delete($path);
        }
    }
};
