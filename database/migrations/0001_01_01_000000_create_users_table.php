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
        Schema::create('users', function (Blueprint $table) {
            $table->ulid('id')->primary()->comment('Local central ID (optional)');
            $table->string('global_id', 100)->comment('Tenant domain from central db - required for syncing with tenants')->index();
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('email_verify_token', 6)->nullable()->unique();
            $table->timestamp('email_verify_start_at')->nullable()->comment('when email verification time starts');
            $table->timestamp('email_verify_expired_at')->nullable()->comment('when email verification time end');
            $table->timestamp('email_verified_at')->nullable()->comment('when email verification successful');
            $table->enum('is_active', ['1', '0', '2'])->default('2')->comment('1=Active, 0=Inactive, 2=Pending');
            $table->string('ip', 15)->nullable()->comment('Registered user IP address');
            $table->text('additional1')->nullable()->comment('additional attribute if required');
            $table->text('additional2')->nullable()->comment('additional attribute if required');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('token')->nullable();
            $table->timestamps();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->ulid('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
