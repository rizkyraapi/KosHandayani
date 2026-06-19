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
            if (! Schema::hasColumn('payments', 'payment_category')) {
                $table->string('payment_category')->default('initial_rent')->after('rental_application_id');
            }

            if (! Schema::hasColumn('payments', 'room_occupancy_id')) {
                $table->foreignId('room_occupancy_id')
                    ->nullable()
                    ->after('payment_category')
                    ->constrained('room_occupancies')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('payments', 'duration_months')) {
                $table->unsignedSmallInteger('duration_months')->nullable()->after('discount_amount');
            }

            if (! Schema::hasColumn('payments', 'monthly_price')) {
                $table->unsignedBigInteger('monthly_price')->nullable()->after('duration_months');
            }

            if (! Schema::hasColumn('payments', 'period_start')) {
                $table->date('period_start')->nullable()->after('monthly_price');
            }

            if (! Schema::hasColumn('payments', 'period_end')) {
                $table->date('period_end')->nullable()->after('period_start');
            }

            if (! Schema::hasColumn('payments', 'settlement_time')) {
                $table->timestamp('settlement_time')->nullable()->after('paid_at');
            }
        });

        DB::table('payments')
            ->whereNull('payment_category')
            ->update(['payment_category' => 'initial_rent']);

        if ($this->hasIndex('payments', 'payments_rental_application_id_unique')) {
            Schema::table('payments', function (Blueprint $table): void {
                $table->dropUnique('payments_rental_application_id_unique');
            });
        }

        Schema::table('payments', function (Blueprint $table): void {
            if (! $this->hasIndexOnColumns('payments', ['rental_application_id'])) {
                $table->index('rental_application_id', 'payments_rental_application_id_index');
            }

            if (! $this->hasIndexOnColumns('payments', ['payment_category', 'transaction_status'])) {
                $table->index(['payment_category', 'transaction_status'], 'payments_category_status_index');
            }

            if (! $this->hasIndexOnColumns('payments', ['room_occupancy_id', 'payment_category'])) {
                $table->index(['room_occupancy_id', 'payment_category'], 'payments_occupancy_category_index');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('payments')) {
            return;
        }

        Schema::table('payments', function (Blueprint $table): void {
            if ($this->hasIndex('payments', 'payments_occupancy_category_index')) {
                $table->dropIndex('payments_occupancy_category_index');
            }

            if ($this->hasIndex('payments', 'payments_category_status_index')) {
                $table->dropIndex('payments_category_status_index');
            }

            if ($this->hasIndex('payments', 'payments_rental_application_id_index')) {
                $table->dropIndex('payments_rental_application_id_index');
            }
        });

        Schema::table('payments', function (Blueprint $table): void {
            foreach ([
                'settlement_time',
                'period_end',
                'period_start',
                'monthly_price',
                'duration_months',
                'room_occupancy_id',
            ] as $column) {
                if (Schema::hasColumn('payments', $column)) {
                    if ($column === 'room_occupancy_id') {
                        $table->dropConstrainedForeignId($column);
                    } else {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }

    private function hasIndex(string $table, string $name): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(fn (array $index): bool => ($index['name'] ?? null) === $name);
    }

    private function hasIndexOnColumns(string $table, array $columns): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(fn (array $index): bool => ($index['columns'] ?? []) === $columns);
    }
};
