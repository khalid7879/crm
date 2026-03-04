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
        Schema::create('notes', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('title', 200);

            $table->ulid('causer_id')->comment('Belongs to users/contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->ulid('owner_id')->comment('Belongs to users/contacts Table');
            $table->foreign('owner_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->text('details')->nullable();
            $table->dateTime('date_reminder')->nullable();
            $table->boolean('is_active')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
