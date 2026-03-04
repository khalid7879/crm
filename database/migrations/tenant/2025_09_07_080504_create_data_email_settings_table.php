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
        Schema::create('data_email_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('host');
            $table->string('port',100);
            $table->string('password',100);
            $table->string('encryption',200);
            $table->string('user_name',200);
            $table->string('mail_from_address',200);
            
            $table->enum('is_active', ['1', '0'])->default('0')->comment('1=Active, 0=Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_email_settings');
    }
};
