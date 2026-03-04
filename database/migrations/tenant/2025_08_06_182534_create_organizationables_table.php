<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organizationables', function (Blueprint $table) {
            $table->id();
            ## Use ULID for organization foreign key
            $table->ulid('organization_id');

            ## Polymorphic ULID fields
            $table->ulid('organizationable_id')->comment('ex- lead,contact,opportunities,project');
            $table->string('organizationable_type')->comment('ex- lead,contact,opportunities,project');

            ## Ensure uniqueness for polymorphic relation
            $table->unique([
                'organization_id',
                'organizationable_id',
                'organizationable_type',
            ], 'org_morph_unique');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizationables');
    }
};
