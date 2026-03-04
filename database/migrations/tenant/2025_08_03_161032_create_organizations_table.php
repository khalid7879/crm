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
        Schema::create('organizations', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('causer_id')->comment('Belongs to users/contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->ulid('owner_id')->comment('Belongs to users/contacts Table');
            $table->foreign('owner_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->string('name', 300)->unique()->index();
            $table->string('mobile_number')->nullable();
            $table->text('website')->nullable();
            $table->text('details')->nullable();

            $table->boolean('hidden')->default(1)->comment('Hidden = 0, Visible = 1');
            $table->boolean('is_active')->default(1)->comment('Inactive = 0, active = 1');
            $table->boolean('is_sample')->default(0)->comment('1=Sample data, 0=Original data');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
