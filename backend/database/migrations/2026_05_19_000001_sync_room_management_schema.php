<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('branches')) {
            Schema::create('branches', function (Blueprint $table): void {
                $table->id();
                $table->string('branch_name');
                $table->string('city')->nullable();
                $table->text('address')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        $this->ensureBranchesFromExistingRooms();

        Schema::table('rooms', function (Blueprint $table): void {
            if (! Schema::hasColumn('rooms', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            }

            if (! Schema::hasColumn('rooms', 'gender_type')) {
                if (Schema::getConnection()->getDriverName() === 'sqlite') {
                    $table->string('gender_type')->default('mixed');
                } else {
                    $table->enum('gender_type', ['male', 'female', 'mixed'])->default('mixed');
                }
            }

            if (! Schema::hasColumn('rooms', 'room_status')) {
                if (Schema::getConnection()->getDriverName() === 'sqlite') {
                    $table->string('room_status')->default('available');
                } else {
                    $table->enum('room_status', ['available', 'occupied', 'maintenance'])->default('available');
                }
            }
        });

        $this->backfillRoomBranchIds();

        if (Schema::hasColumn('rooms', 'gender_type')) {
            DB::table('rooms')->whereNull('gender_type')->update(['gender_type' => 'mixed']);
        }

        if (Schema::hasColumn('rooms', 'room_status')) {
            DB::table('rooms')
                ->whereNull('room_status')
                ->update([
                    'room_status' => DB::raw("CASE WHEN is_available = 1 THEN 'available' ELSE 'occupied' END"),
                ]);
        }

        if (Schema::hasColumn('rooms', 'is_available') && Schema::hasColumn('rooms', 'room_status')) {
            DB::table('rooms')->where('room_status', 'available')->update(['is_available' => true]);
            DB::table('rooms')->whereIn('room_status', ['occupied', 'maintenance'])->update(['is_available' => false]);
        }
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            if (Schema::hasColumn('rooms', 'branch_id')) {
                $table->dropConstrainedForeignId('branch_id');
            }

            foreach (['gender_type', 'room_status'] as $column) {
                if (Schema::hasColumn('rooms', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::dropIfExists('branches');
    }

    private function ensureBranchesFromExistingRooms(): void
    {
        $legacyBranches = collect();

        if (Schema::hasColumn('rooms', 'branch')) {
            $legacyBranches = DB::table('rooms')
                ->whereNotNull('branch')
                ->where('branch', '!=', '')
                ->distinct()
                ->pluck('branch');
        }

        if ($legacyBranches->isEmpty() && DB::table('branches')->count() === 0) {
            $legacyBranches = collect(['Cabang Utama']);
        }

        foreach ($legacyBranches as $branchName) {
            DB::table('branches')->updateOrInsert(
                ['branch_name' => $branchName],
                [
                    'city' => null,
                    'address' => null,
                    'description' => null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }
    }

    private function backfillRoomBranchIds(): void
    {
        if (! Schema::hasColumn('rooms', 'branch_id')) {
            return;
        }

        $defaultBranchId = DB::table('branches')->value('id');

        if (! $defaultBranchId) {
            $defaultBranchId = DB::table('branches')->insertGetId([
                'branch_name' => 'Cabang Utama',
                'city' => null,
                'address' => null,
                'description' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (Schema::hasColumn('rooms', 'branch')) {
            DB::table('rooms')
                ->whereNull('branch_id')
                ->orderBy('id')
                ->select(['id', 'branch'])
                ->chunkById(100, function ($rooms) use ($defaultBranchId): void {
                    foreach ($rooms as $room) {
                        $branchId = $defaultBranchId;

                        if ($room->branch) {
                            $branchId = DB::table('branches')
                                ->where('branch_name', $room->branch)
                                ->value('id') ?? $defaultBranchId;
                        }

                        DB::table('rooms')->where('id', $room->id)->update(['branch_id' => $branchId]);
                    }
                });

            return;
        }

        DB::table('rooms')->whereNull('branch_id')->update(['branch_id' => $defaultBranchId]);
    }
};
