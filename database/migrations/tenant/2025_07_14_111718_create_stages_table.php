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
        Schema::create('stages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->string('label', 100);
            $table->string('type')->nullable()->comment('Type of stage, e.g., lead, opportunity');
            $table->unsignedInteger('stage_percent')->nullable()->default(0)->comment('Indicates the progress percentage of this stage');
            $table->unsignedInteger('resolution_hours')->default(0)->comment('Expected resolution time in hours');
            $table->unsignedInteger('resolution_days')->default(0)->comment('Expected resolution time in days');
            $table->unsignedInteger('order')->default(1)->comment('Order of the stage in the pipeline');
            $table->enum('is_delete', ['1', '0'])->default('0')->comment('1=Deleted, 0=Not deleted');
            $table->enum('is_active', ['1', '0'])->default('1')->comment('1=Active, 0=Inactive');
            $table->enum('is_default', ['1', '0'])->default('0')->comment('1=Default, 0=Not default');
            $table->enum('is_final_stage', ['1', '0'])->default('0')->comment('1=Final stage, 0=Not Final stage');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stages');
    }
};
