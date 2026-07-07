<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->unique();
            $table->text('location')->nullable();
            $table->integer('loyalty_points')->default(0);
            $table->string('referral_code', 20)->unique();
            $table->foreignId('referrer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            // Index pour optimisation
            $table->index(['email', 'deleted_at']);
            $table->index('referral_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};