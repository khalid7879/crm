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
        Schema::create('data_contact_times', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name')->index()->unique();
            $table->text('note')->nullable();
            $table->enum('is_active', ['1', '0'])->default('1')->comment('1=Active, 0=Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_contact_times');
    }
};
