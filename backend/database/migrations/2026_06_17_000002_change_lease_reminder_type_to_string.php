<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lease_reminders') && Schema::hasColumn('lease_reminders', 'reminder_type')) {
            DB::statement('ALTER TABLE lease_reminders MODIFY reminder_type VARCHAR(32) NOT NULL');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('lease_reminders') && Schema::hasColumn('lease_reminders', 'reminder_type')) {
            DB::statement("ALTER TABLE lease_reminders MODIFY reminder_type ENUM('H30','H7','H1','H0','OVERDUE') NOT NULL");
        }
    }
};
