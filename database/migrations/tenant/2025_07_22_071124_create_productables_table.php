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
        Schema::create('productables', function (Blueprint $table) {
            $table->id();
            $table->ulid('product_id');
            $table->ulid('productable_id');
            $table->text('productable_type');
            $table->decimal('face_value', 8, 2)->default(0)->comment('Original price from data management');
            $table->decimal('customized_value', 8, 2)->default(0)->comment('customized price');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productables');
    }
};
