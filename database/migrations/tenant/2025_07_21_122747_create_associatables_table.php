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
        Schema::create('associatables', function (Blueprint $table) {
            $table->id();

            $table->ulid('contact_id')->comment('Belongs to users Table who are associates');
            $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('cascade');

            $table->ulid('associatable_id')->comment('Lead,Tasks,Opportunity,Organization,Projects,Followup and more');
            $table->text('associatable_type')->comment('Lead,Tasks,Opportunity,Organization,Projects,Followup and more');

            ## Index for faster lookups
            $table->index(['contact_id', 'associatable_id'], 'associatable_index');



            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('associatables');
    }
};
