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
        Schema::create('contacts', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('causer_id')->nullable()->comment('Belongs to contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts');

            $table->ulid('owner_id')->nullable()->comment('Belongs to contacts Table');
            $table->foreign('owner_id')->references('id')->on('contacts');

            $table->string('nickname', 50)->index();
            $table->string('first_name', 50)->index()->nullable();
            $table->string('last_name', 50)->nullable();
            $table->boolean('is_parent_user_deleted')->default(false);
            $table->boolean('is_delete')->default(false)->comment('contacts referenced with user not deletable');
            $table->string('salutation', 200)->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('email')->nullable();
            $table->date('dob')->nullable();
            $table->text('details')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
