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
        Schema::create('categoryables', function (Blueprint $table) {
            $table->id();
            $table->ulid('data_category_id')->comment('original data category_id');
            $table->ulid('categoryable_id')->comment('Ex: Lead, opportunity, contact, project');
            $table->text('categoryable_type')->comment('Ex: Lead, opportunity, contact, project');

            ## Optional: index for faster lookups
            $table->index(['data_category_id', 'categoryable_id'], 'categoryable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categoryables');
    }
};
