<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id')->nullable();
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('base_salary');
            $table->json('details')->nullable();
            $table->integer('net_salary');
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('payment_proof')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->uuid('processed_by')->nullable();
            $table->boolean('is_generated')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('employee_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('processed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
