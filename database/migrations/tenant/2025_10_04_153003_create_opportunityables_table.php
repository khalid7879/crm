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
        Schema::create('opportunityables', function (Blueprint $table) {
            $table->id();
            $table->ulid('opportunity_id')->comment('Main opportunity id');
            $table->ulid('opportunityable_id')->comment('Ex: Lead, contact id');
            $table->text('opportunityable_type')->comment('Ex: Lead, contact model class full namespace');

            ## Optional: index for faster lookups
            $table->index(['opportunity_id', 'opportunityable_id'], 'opportunity_index');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunityables');
    }
};
