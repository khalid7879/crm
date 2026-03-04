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
        Schema::create('attachments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title', 100);

            $table->ulid('causer_id')->comment('Belongs to users/contacts Table');
            $table->foreign('causer_id')->references('id')->on('contacts')->cascadeOnDelete();

            $table->string('attachmentable_type');
            $table->ulid('attachmentable_id');

            $table->string('alt_text', 255)->nullable();
            $table->string('attachment_file', 255)->nullable();
            $table->text('details')->nullable();

            $table->enum('is_active', ['1', '0'])->default('1')->comment('1=Active, 0=Inactive');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
