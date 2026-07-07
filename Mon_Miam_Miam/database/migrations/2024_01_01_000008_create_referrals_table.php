<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referee_id')->constrained('users')->cascadeOnDelete();
            $table->integer('reward_points')->default(5);
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
            
            // Empêcher doublons
            $table->unique(['referrer_id', 'referee_id']);
            $table->index(['referrer_id', 'status']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
