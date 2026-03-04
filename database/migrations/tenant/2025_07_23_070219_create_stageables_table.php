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
        Schema::create('stageables', function (Blueprint $table) {
            $table->id();

            $table->ulid('causer_id')->comment('User who made this action');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            $table->ulid('stage_id')->comment('original data stage id');
            $table->ulid('stageable_id')->comment('ex- lead, contact, opportunities, projects');;
            $table->text('stageable_type')->comment('ex- lead, contact, opportunities, projects');
            $table->text('note')->nullable()->comment('ex- lead, contact, opportunities, projects');
            $table->json('duration')->nullable()->default(null)->comment('Stage duration in months,days,hours format');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stageables');
    }
};
