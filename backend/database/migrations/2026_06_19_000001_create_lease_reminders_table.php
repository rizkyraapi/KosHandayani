<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lease_reminders')) {
            return;
        }

        Schema::create('lease_reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('room_occupancy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('channel')->default('email');
            $table->string('reminder_type', 32);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['room_occupancy_id', 'reminder_type', 'channel'], 'lease_reminder_lookup_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lease_reminders');
    }
};
