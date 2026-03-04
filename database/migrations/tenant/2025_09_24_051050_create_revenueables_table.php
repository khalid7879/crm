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
        Schema::create('revenue_typeables', function (Blueprint $table) {
            $table->id();
            $table->ulid('data_revenue_type_id')->comment('original data revenue_id');
            $table->ulid('revenue_typeable_id')->comment('Ex: Lead, opportunity, contact, project');
            $table->text('revenue_typeable_type')->comment('Ex: Lead, opportunity, contact, project');

            ## Optional: index for faster lookups
            $table->index(['data_revenue_type_id', 'revenue_typeable_id'], 'revenue_typeable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenue_typeables');
    }
};
