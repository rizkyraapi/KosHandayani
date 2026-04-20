<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('rooms', function (Blueprint $table) {
        $table->id();

        $table->string('name');         // nama kamar
        $table->integer('price');       // harga kamar
        $table->string('branch');       // cabang (Cabang 1 / Cabang 2)
        $table->boolean('is_available'); // status kamar (true = kosong)

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
