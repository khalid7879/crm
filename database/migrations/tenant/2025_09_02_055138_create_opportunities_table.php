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
        Schema::create('opportunities', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('causer_id')->comment('Belongs to users/contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->ulid('owner_id')->comment('Belongs to users/contacts Table');
            $table->foreign('owner_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->string('name', 500)->index();
            $table->text('details')->nullable();
            $table->dateTime('date_forecast')->nullable()->comment('tentative close date');
            $table->dateTime('date_close')->nullable()->comment('actual close date');
            $table->decimal('amount', 12, 2)->default(0)->index();
            $table->string('currency', 50)->nullable()->comment('currency code of opportunity amount');
            $table->unsignedInteger('progress_percent')->default(0)->comment('Probability of win this opportunity');
            $table->boolean('is_active')->default(1);
            $table->boolean('is_sample')->default(0)->comment('1=Sample data, 0=Original data');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
