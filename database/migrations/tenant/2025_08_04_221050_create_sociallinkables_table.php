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
        Schema::create('socialables', function (Blueprint $table) {
            $table->id();
            $table->ulid('social_link_id')->comment('Data social link id');

            ## Polymorphic columns must match morph name "socialable"
            $table->ulid('socialable_id')->comment('Ex: Lead, Contact, Opportunity, Organization');
            $table->string('socialable_type')->comment('Ex: Lead, Contact, Opportunity, Organization');

            $table->text('url');

            ## Index for faster lookups
            $table->index(['socialable_id', 'socialable_type'], 'socialables_index');

            ## Foreign key constraint on social_link_id with cascade on delete 
            $table->foreign('social_link_id')
                ->references('id')
                ->on('social_links')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('socialables');
    }
};
