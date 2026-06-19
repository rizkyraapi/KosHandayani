<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('rooms', 'room_type')) {
            Schema::table('rooms', function (Blueprint $table): void {
                $table->dropColumn('room_type');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('rooms', 'room_type')) {
            Schema::table('rooms', function (Blueprint $table): void {
                $table->string('room_type')->default('single')->after('branch_id');
            });
        }
    }
};
