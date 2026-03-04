<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('company', 100)->nullable()->unique()->comment('Company name');
            $table->string('email_verify_token', 6)->nullable()->unique();
            $table->timestamp('email_verify_start_at')->nullable()->comment('when email verification time starts');
            $table->timestamp('email_verify_expired_at')->nullable()->comment('when email verification time end');
            $table->timestamp('email_verified_at')->nullable()->comment('when email verification successful');

            $table->string('mobile_no', 20)->nullable();
            $table->string('mobile_verify_token', 6)->nullable();
            $table->timestamp('mobile_verified_at')->nullable();
            $table->timestamp('mobile_verified_start_at')->nullable();
            $table->timestamp('mobile_verified_expired_at')->nullable();

            $table->string('timezone', 50)->default('UTC');
            $table->string('locale', 10)->default('en');
            $table->string('currency', 10)->default('USD');

            $table->string('avatar', 255)->nullable();
            $table->string('plan', 100)->default('trial');

            // Use DB::raw here instead of `now()` to avoid migration freezing
            $table->timestamp('trial_ends_at')->default(now()->addDays(15));
            $table->timestamp('subscription_ends_at')->nullable();

            $table->unsignedInteger('max_users')->default(5)->comment('Trial tenant can have only 5 test users');
            $table->unsignedInteger('profile_completion_percentage')->default(50);

            $table->tinyInteger('status')->default(1)->comment('0=inactive, 1=trial, 2=active, 3=suspended, 4=expired');

            $table->softDeletes();
            $table->json('data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
