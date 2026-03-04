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
        Schema::create('profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('user_id')->comment('Belongs to users Table');
            $table->foreign('user_id')->references('id')->on('users');

            $table->string('language', 100)->nullable();
            $table->string('photo', 100)->nullable();
            $table->string('telephone', 100)->nullable();
            $table->string('mobile_phone', 100)->nullable();
            $table->string('salutation', 100)->nullable();
            $table->text('note')->nullable();

            $table->string('time_zone', 100)->nullable();
            $table->string('currency', 100)->nullable();
            $table->string('date_format', 100)->nullable();
            $table->string('time_format', 100)->nullable();
            $table->enum('is_active', ['1', '0'])->default('1')->comment('1=Active, 0=Inactive');
            $table->text('working_hours')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
