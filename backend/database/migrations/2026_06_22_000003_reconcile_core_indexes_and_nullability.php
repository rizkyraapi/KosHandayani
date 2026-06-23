<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('expenses') && Schema::hasColumn('expenses', 'description')) {
            Schema::table('expenses', function (Blueprint $table): void {
                $table->text('description')->nullable()->change();
            });
        }

        $this->addIndexIfMissing(
            'rental_applications',
            ['user_id', 'created_at'],
            'rental_applications_user_created_index',
        );
        $this->addIndexIfMissing(
            'rental_applications',
            ['room_id', 'status', 'payment_status'],
            'rental_applications_room_lifecycle_index',
        );
        $this->addIndexIfMissing(
            'payments',
            ['rental_application_id', 'payment_category', 'transaction_status'],
            'payments_application_category_status_index',
        );
        $this->addIndexIfMissing(
            'room_occupancies',
            ['user_id', 'status'],
            'room_occupancies_user_status_index',
        );
        $this->addIndexIfMissing(
            'room_occupancies',
            ['room_id', 'status'],
            'room_occupancies_room_status_index',
        );
        $this->addIndexIfMissing(
            'room_occupancies',
            ['status', 'end_date'],
            'room_occupancies_status_end_date_index',
        );
        $this->addIndexIfMissing(
            'expenses',
            ['expense_date', 'branch_id'],
            'expenses_expense_date_branch_id_index',
        );
        $this->addIndexIfMissing(
            'expenses',
            ['category', 'expense_date'],
            'expenses_category_expense_date_index',
        );

        if (
            Schema::hasTable('room_occupancies')
            && ! $this->hasUniqueIndexOnColumns('room_occupancies', ['rental_application_id'])
            && ! DB::table('room_occupancies')
                ->select('rental_application_id')
                ->groupBy('rental_application_id')
                ->havingRaw('COUNT(*) > 1')
                ->exists()
        ) {
            Schema::table('room_occupancies', function (Blueprint $table): void {
                $table->unique('rental_application_id', 'room_occupancies_rental_application_unique');
            });
        }

        if (
            Schema::hasTable('lease_reminders')
            && ! $this->hasUniqueIndexOnColumns('lease_reminders', ['room_occupancy_id', 'reminder_type', 'channel'])
            && ! DB::table('lease_reminders')
                ->select(['room_occupancy_id', 'reminder_type', 'channel'])
                ->groupBy(['room_occupancy_id', 'reminder_type', 'channel'])
                ->havingRaw('COUNT(*) > 1')
                ->exists()
        ) {
            Schema::table('lease_reminders', function (Blueprint $table): void {
                $table->unique(
                    ['room_occupancy_id', 'reminder_type', 'channel'],
                    'lease_reminders_occupancy_type_channel_unique',
                );
            });
        }
    }

    public function down(): void
    {
        $this->dropIndexIfExists('lease_reminders', 'lease_reminders_occupancy_type_channel_unique', true);
        $this->dropIndexIfExists('room_occupancies', 'room_occupancies_rental_application_unique', true);
        $this->dropIndexIfExists('expenses', 'expenses_category_expense_date_index');
        $this->dropIndexIfExists('expenses', 'expenses_expense_date_branch_id_index');
        $this->dropIndexIfExists('room_occupancies', 'room_occupancies_status_end_date_index');
        $this->dropIndexIfExists('room_occupancies', 'room_occupancies_room_status_index');
        $this->dropIndexIfExists('room_occupancies', 'room_occupancies_user_status_index');
        $this->dropIndexIfExists('payments', 'payments_application_category_status_index');
        $this->dropIndexIfExists('rental_applications', 'rental_applications_room_lifecycle_index');
        $this->dropIndexIfExists('rental_applications', 'rental_applications_user_created_index');
    }

    private function addIndexIfMissing(string $table, array $columns, string $name): void
    {
        if (! Schema::hasTable($table) || $this->hasIndexOnColumns($table, $columns)) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($columns, $name): void {
            $blueprint->index($columns, $name);
        });
    }

    private function hasIndexOnColumns(string $table, array $columns): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(fn (array $index): bool => ($index['columns'] ?? []) === $columns);
    }

    private function hasUniqueIndexOnColumns(string $table, array $columns): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(fn (array $index): bool => ($index['columns'] ?? []) === $columns
                && ($index['unique'] ?? false));
    }

    private function dropIndexIfExists(string $table, string $name, bool $unique = false): void
    {
        if (! Schema::hasTable($table) || ! collect(Schema::getIndexes($table))->contains(
            fn (array $index): bool => ($index['name'] ?? null) === $name,
        )) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($name, $unique): void {
            if ($unique) {
                $blueprint->dropUnique($name);

                return;
            }

            $blueprint->dropIndex($name);
        });
    }
};
