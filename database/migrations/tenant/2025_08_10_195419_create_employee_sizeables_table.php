<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_sizeables', function (Blueprint $table) {
            $table->ulid('employee_size_id')->comment('Original employee size id');
            $table->ulid('employee_sizeable_id')->comment('ex- lead,contact,opportunities,project');
            $table->string('employee_sizeable_type')->comment('ex- lead,contact,opportunities,project');

            $table->foreign('employee_size_id')
                ->references('id')
                ->on('data_emp_sizes')
                ->cascadeOnDelete();

            ## Ensure uniqueness for polymorphic relation
            $table->unique([
                'employee_size_id',
                'employee_sizeable_id',
                'employee_sizeable_type',
            ], 'employee_sizeables_unique');

            $table->index(
                ['employee_sizeable_id', 'employee_sizeable_type'],
                'employee_sizeables_index'
            );

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_sizeables');
    }
};
