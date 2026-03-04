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
        Schema::create('ai_analysis', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('causer_id')->comment('Belongs to users/contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnDelete();

            /***
             * Polymorphic relation fields:
             * analysisable_type => model class (e.g., App\Models\{Lead|Opportunity})
             * analysisable_id   => model primary key
             */
            $table->string('analysisable_type');
            $table->ulid('analysisable_id');

            /***
             * AI insight fields
             * AI-generated summary of the entity
             * AI-suggested next step
             */
            $table->text('summary')->nullable()->comment('AI-generated summary of the entity');
            $table->text('current_position')->nullable()->comment('Current position/status of the entity based on analysis');
            $table->text('next_best_action')->nullable()->comment('AI-suggested next step/action for the entity');
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_analysis');
    }
};
