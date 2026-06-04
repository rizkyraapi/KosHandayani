<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rental_applications', function (Blueprint $table): void {
            if (! Schema::hasColumn('rental_applications', 'payment_status')) {
                $table->string('payment_status')->default('pending')->after('owner_notes');
            }

            if (! Schema::hasColumn('rental_applications', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('payment_status');
            }

            if (! Schema::hasColumn('rental_applications', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('approved_at');
            }
        });

        if (! Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('rental_application_id')->constrained()->cascadeOnDelete();
                $table->string('order_id')->unique();
                $table->string('transaction_id')->nullable();
                $table->unsignedBigInteger('gross_amount');
                $table->string('payment_type')->nullable();
                $table->string('transaction_status')->default('pending');
                $table->string('snap_token')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();

                $table->unique('rental_application_id');
            });
        } else {
            Schema::table('payments', function (Blueprint $table): void {
                if (! Schema::hasColumn('payments', 'rental_application_id')) {
                    $table->foreignId('rental_application_id')->nullable()->constrained()->cascadeOnDelete();
                }

                if (! Schema::hasColumn('payments', 'order_id')) {
                    $table->string('order_id')->nullable();
                }

                if (! Schema::hasColumn('payments', 'transaction_id')) {
                    $table->string('transaction_id')->nullable();
                }

                if (! Schema::hasColumn('payments', 'gross_amount')) {
                    $table->unsignedBigInteger('gross_amount')->default(0);
                }

                if (! Schema::hasColumn('payments', 'payment_type')) {
                    $table->string('payment_type')->nullable();
                }

                if (! Schema::hasColumn('payments', 'transaction_status')) {
                    $table->string('transaction_status')->default('pending');
                }

                if (! Schema::hasColumn('payments', 'snap_token')) {
                    $table->string('snap_token')->nullable();
                }

                if (! Schema::hasColumn('payments', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('room_occupancies')) {
            Schema::create('room_occupancies', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('room_id')->constrained()->cascadeOnDelete();
                $table->foreignId('rental_application_id')->constrained()->cascadeOnDelete();
                $table->date('start_date');
                $table->date('end_date')->nullable();
                $table->string('status')->default('active');
                $table->timestamps();

                $table->unique('rental_application_id');
            });
        } else {
            Schema::table('room_occupancies', function (Blueprint $table): void {
                if (! Schema::hasColumn('room_occupancies', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
                }

                if (! Schema::hasColumn('room_occupancies', 'room_id')) {
                    $table->foreignId('room_id')->nullable()->constrained()->cascadeOnDelete();
                }

                if (! Schema::hasColumn('room_occupancies', 'rental_application_id')) {
                    $table->foreignId('rental_application_id')->nullable()->constrained()->cascadeOnDelete();
                }

                if (! Schema::hasColumn('room_occupancies', 'start_date')) {
                    $table->date('start_date')->nullable();
                }

                if (! Schema::hasColumn('room_occupancies', 'end_date')) {
                    $table->date('end_date')->nullable();
                }

                if (! Schema::hasColumn('room_occupancies', 'status')) {
                    $table->string('status')->default('active');
                }
            });
        }
    }

    public function down(): void
    {
        // No-op: this migration is idempotent and may run against existing production tables.
    }
};
