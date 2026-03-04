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
        Schema::create('leads', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('creator_id')->comment('Belongs to users/contacts Table');
            $table->foreign('creator_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnUpdate();

            $table->ulid('owner_id')->comment('Belongs to users/contacts Table')->nullable();
            $table->foreign('owner_id')->references('id')->on('contacts')->cascadeOnDelete()->cascadeOnUpdate();

            $table->string('unique_id', 50)->unique()->index()->comment('Custom Unique id, belongs to none');
            $table->unsignedInteger('salutation')->nullable();
            $table->string('nickname', 50)->index();
            $table->string('first_name', 50)->index()->nullable();
            $table->string('last_name', 50)->nullable();
            $table->date('dob', 50)->nullable()->default(null)->comment('Person date of birth');
            $table->string('email', 100)->nullable()->index();
            $table->string('telephone', 50)->nullable()->index();
            $table->string('mobile_phone', 50)->nullable()->index();
            $table->string('alt_mobile_phone', 50)->nullable();
            $table->string('fax', 50)->nullable();
            $table->text('website')->nullable();
            $table->text('details')->nullable();
            $table->boolean('is_active')->default(1)->comment('Inactive = 0, active = 1');
            $table->boolean('is_sample')->default(0)->comment('1=Sample data, 0=Original data');
            $table->text('icon')->nullable()->comment('lead image as an icon');
            $table->unsignedInteger('preferred_contact_method')->default(0)->comment('PreferredContactMethod: Email, Sms, Call');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
