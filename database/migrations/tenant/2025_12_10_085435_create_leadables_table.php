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
        Schema::create('leadables', function (Blueprint $table) {
            $table->id();
            $table->ulid('lead_id')->comment('original lead_id');
            $table->ulid('leadable_id')->comment('Ex: contact');
            $table->text('leadable_type')->comment('Ex: contact');

            ## Optional: index for faster lookups
            $table->index(['lead_id', 'leadable_id'], 'leadable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leadables');
    }
};
