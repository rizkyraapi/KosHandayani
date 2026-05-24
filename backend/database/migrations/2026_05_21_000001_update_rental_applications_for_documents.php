<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rental_applications', function (Blueprint $table): void {
            if (! Schema::hasColumn('rental_applications', 'move_in_date')) {
                $table->date('move_in_date')->nullable()->after('room_id');
            }

            if (! Schema::hasColumn('rental_applications', 'ktp_file')) {
                $table->string('ktp_file')->nullable()->after('duration');
            }

            if (! Schema::hasColumn('rental_applications', 'kk_file')) {
                $table->string('kk_file')->nullable()->after('ktp_file');
            }

            if (! Schema::hasColumn('rental_applications', 'owner_notes')) {
                $table->text('owner_notes')->nullable()->after('status');
            }
        });

        DB::table('rental_applications')
            ->whereNotIn('status', ['pending', 'approved', 'rejected'])
            ->update(['status' => 'pending']);

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE rental_applications MODIFY status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE rental_applications MODIFY status VARCHAR(255) NOT NULL DEFAULT 'pending'");
        }

        Schema::table('rental_applications', function (Blueprint $table): void {
            foreach (['move_in_date', 'ktp_file', 'kk_file', 'owner_notes'] as $column) {
                if (Schema::hasColumn('rental_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
