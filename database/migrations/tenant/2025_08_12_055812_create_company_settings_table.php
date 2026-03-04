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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('type', 100);
            $table->text('value')->nullable();
            $table->enum('is_active', ['1', '0'])->default('1')->comment('1=Active, 0=Inactive');
            $table->enum('is_delete', ['1', '0'])->default(false)->comment('1=Delete, 0=Not delete');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
