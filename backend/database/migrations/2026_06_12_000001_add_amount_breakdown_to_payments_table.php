<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('payments')) {
            return;
        }

        Schema::table('payments', function (Blueprint $table): void {
            if (! Schema::hasColumn('payments', 'subtotal_amount')) {
                $table->unsignedBigInteger('subtotal_amount')->default(0)->after('rental_application_id');
            }

            if (! Schema::hasColumn('payments', 'discount_amount')) {
                $table->unsignedBigInteger('discount_amount')->default(0)->after('subtotal_amount');
            }
        });

        DB::table('payments')
            ->where('subtotal_amount', 0)
            ->update(['subtotal_amount' => DB::raw('gross_amount')]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('payments')) {
            return;
        }

        Schema::table('payments', function (Blueprint $table): void {
            if (Schema::hasColumn('payments', 'discount_amount')) {
                $table->dropColumn('discount_amount');
            }

            if (Schema::hasColumn('payments', 'subtotal_amount')) {
                $table->dropColumn('subtotal_amount');
            }
        });
    }
};
