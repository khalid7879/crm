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
        Schema::create('lead_areas', function (Blueprint $table) {
            $table->ulid('lead_id')->nullable()->comment('Belongs to leads Table');
            $table->foreign('lead_id')->references('id')->on('leads');
            $table->ulid('data_area_id')->nullable()->comment('Belongs to data_areas Table');
            $table->foreign('data_area_id')->references('id')->on('data_areas');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_areas');
    }
};
