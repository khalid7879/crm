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
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('user_id')->comment('Belongs to users table');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->ulid('notification_event_id')->comment('Belongs to notification_events table');
            $table->foreign('notification_event_id')->references('id')->on('notification_events')->onDelete('cascade');

            $table->boolean('system')->default(0)->comment('Inactive = 0, Active = 1');
            $table->boolean('sms')->default(0)->comment('Inactive = 0, Active = 1');
            $table->boolean('email')->default(0)->comment('Inactive = 0, Active = 1');
      

            $table->timestamps();

            $table->unique(['user_id', 'notification_event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
