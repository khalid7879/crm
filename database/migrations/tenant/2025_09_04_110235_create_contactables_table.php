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
        Schema::create('contactables', function (Blueprint $table) {
            ## Use ULID for organization foreign key
            $table->ulid('contact_id');

            ## Polymorphic ULID fields
            $table->ulid('contactable_id')->comment('ex- lead,opportunities,project');
            $table->string('contactable_type')->comment('ex- lead,opportunities,project');

            ## Ensure uniqueness for polymorphic relation
            $table->unique(
                ['contact_id', 'contactable_id', 'contactable_type'],
                'contactables_unique'
            );
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contactables');
    }
};
