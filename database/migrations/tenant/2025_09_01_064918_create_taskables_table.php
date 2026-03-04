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
        Schema::create('taskables', function (Blueprint $table) {
            $table->id();
            $table->ulid('task_id')->comment('original task_id');
            $table->ulid('taskable_id')->comment('Ex: Lead, opportunity, contact, project');
            $table->text('taskable_type')->comment('Ex: Lead, opportunity, contact, project');

            ## Optional: index for faster lookups
            $table->index(['task_id', 'taskable_id'], 'taskable_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taskables');
    }
};
