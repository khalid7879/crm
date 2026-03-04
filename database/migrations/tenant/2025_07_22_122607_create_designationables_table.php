<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('designationables', function (Blueprint $table) {
            $table->id();
            $table->ulid('data_designation_id')->comment('original data designation id');
            $table->ulid('designationable_id')->comment('ex- lead, contact');
            $table->string('designationable_type')->comment('ex- lead, contact');

            ## Optional: index for faster lookups
            $table->index(['designationable_id', 'designationable_type'], 'designationable_index');


            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('designationables');
    }
};
