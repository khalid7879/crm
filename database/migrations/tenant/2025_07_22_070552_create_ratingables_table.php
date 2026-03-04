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
        Schema::create('ratingables', function (Blueprint $table) {
            $table->ulid('data_rating_id')->comment('original data rating id');
            $table->ulid('ratingable_id')->comment('ex- lead, organization, opportunity, contact');
            $table->text('ratingable_type')->comment('ex- lead, organization, opportunity, contact');

            ## Optional: composite primary key
            $table->primary(['data_rating_id', 'ratingable_id']);

            ## Optional: index for faster lookups
            $table->index(['data_rating_id', 'ratingable_id'], 'ratingable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratingables');
    }
};
