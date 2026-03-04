<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taggables', function (Blueprint $table) {
            $table->id();
            $table->ulid('tag_id')->comment('original data tag id');
            $table->ulid('taggable_id')->comment('ex- lead, contact');
            $table->string('taggable_type')->comment('ex- lead, contact');
            ## Optional: index for faster lookups
            $table->index(['taggable_id', 'tag_id'], 'taggable_index');


            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taggables');
    }
};
