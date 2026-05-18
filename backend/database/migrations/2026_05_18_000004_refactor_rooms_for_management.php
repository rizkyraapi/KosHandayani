<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            if (Schema::hasColumn('rooms', 'name') && ! Schema::hasColumn('rooms', 'room_name')) {
                $table->renameColumn('name', 'room_name');
            }
        });

        Schema::table('rooms', function (Blueprint $table): void {
            if (! Schema::hasColumn('rooms', 'room_type')) {
                if (Schema::getConnection()->getDriverName() === 'sqlite') {
                    $table->string('room_type')->default('single');
                } else {
                    $table->enum('room_type', ['single', 'double', 'suite'])->default('single');
                }
            }

            if (! Schema::hasColumn('rooms', 'description')) {
                $table->text('description')->nullable();
            }

            if (! Schema::hasColumn('rooms', 'thumbnail')) {
                $table->string('thumbnail')->nullable();
            }

            if (! Schema::hasColumn('rooms', 'max_guest')) {
                $table->integer('max_guest')->default(1);
            }
        });

        if (Schema::hasColumn('rooms', 'room_type')) {
            DB::table('rooms')
                ->whereNull('room_type')
                ->update(['room_type' => 'single']);
        }

        if (Schema::hasColumn('rooms', 'max_guest')) {
            DB::table('rooms')
                ->whereNull('max_guest')
                ->update(['max_guest' => 1]);
        }

        if (! Schema::hasTable('room_facilities')) {
            Schema::create('room_facilities', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('room_id')->constrained()->cascadeOnDelete();
                $table->string('facility_name');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('room_images')) {
            Schema::create('room_images', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('room_id')->constrained()->cascadeOnDelete();
                $table->string('image_url');
                $table->boolean('is_primary')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('room_images');
        Schema::dropIfExists('room_facilities');

        Schema::table('rooms', function (Blueprint $table): void {
            foreach (['max_guest', 'thumbnail', 'description', 'room_type'] as $column) {
                if (Schema::hasColumn('rooms', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('rooms', function (Blueprint $table): void {
            if (Schema::hasColumn('rooms', 'room_name') && ! Schema::hasColumn('rooms', 'name')) {
                $table->renameColumn('room_name', 'name');
            }
        });
    }
};
