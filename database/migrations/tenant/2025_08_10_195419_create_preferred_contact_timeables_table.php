<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preferred_contact_timeables', function (Blueprint $table) {
            $table->ulid('data_contact_time_id')->comment('Original employee size id');
            $table->ulid('preferred_contact_timeable_id')->comment('ex- lead,contact,opportunities,project');
            $table->string('preferred_contact_timeable_type')->comment('ex- lead,contact,opportunities,project');

            $table->foreign('data_contact_time_id')
                ->references('id')
                ->on('data_contact_times')
                ->cascadeOnDelete();

            ## Ensure uniqueness for polymorphic relation
            $table->unique([
                'data_contact_time_id',
                'preferred_contact_timeable_id',
                'preferred_contact_timeable_type',
            ], 'preferred_contact_timeables_unique');

            $table->index(
                ['preferred_contact_timeable_id', 'preferred_contact_timeable_type'],
                'preferred_contact_timeables_index'
            );

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferred_contact_timeables');
    }
};
