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
        Schema::create('task_histories', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('task_id')->comment('Belongs to tasks Table');
            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete()->cascadeOnDelete();

            $table->ulid('causer_id')->comment('Belongs to users/contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->ulid('owner_id')->comment('Belongs to users/contacts Table');
            $table->foreign('owner_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->string('name', 300);
            $table->text('details')->nullable();
            $table->dateTime('date_start')->default(now());
            $table->dateTime('date_due')->nullable();
            $table->dateTime('date_reminder')->nullable();
            $table->unsignedTinyInteger('progress_percent')->default(0)->comment('0 to 100');
            $table->boolean('is_sample')->default(0)->comment('1=Sample data, 0=Original data');
            $table->boolean('is_active')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_histories');
    }
};
