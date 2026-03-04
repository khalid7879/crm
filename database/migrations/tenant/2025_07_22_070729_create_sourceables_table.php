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
        Schema::create('sourceables', function (Blueprint $table) {
            $table->id();
            $table->ulid('data_source_id')->comment('original data sources');
            $table->ulid('sourceable_id')->comment('Ex: Lead, opportunity, contact');
            $table->text('sourceable_type')->comment('Ex: Lead, opportunity, contact');

            ## Optional: index for faster lookups
            $table->index(['data_source_id', 'sourceable_id'], 'sourceable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sourceables');
    }
};
