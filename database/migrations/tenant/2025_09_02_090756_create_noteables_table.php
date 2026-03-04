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
        Schema::create('noteables', function (Blueprint $table) {
            $table->id();
            $table->ulid('note_id')->comment('original note_id');
            $table->ulid('noteable_id')->comment('Ex: Lead, opportunity, contact, project');
            $table->text('noteable_type')->comment('Ex: Lead, opportunity, contact, project');

            ## Optional: index for faster lookups
            $table->index(['note_id', 'noteable_id'], 'noteable_index');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('noteables');
    }
};
