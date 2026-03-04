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
        Schema::create('priorityables', function (Blueprint $table) {
            $table->id();
            $table->ulid('data_priority_id')->comment('original data priority id');
            $table->ulid('priorityable_id')->comment('ex- lead, contact, opportunity, project');
            $table->text('priorityable_type')->comment('ex- lead, contact, opportunity, project');

            ## Optional: index for faster lookups
            $table->index(['data_priority_id', 'priorityable_id'], 'priorityable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('priorityables');
    }
};
