<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image')->nullable();
            $table->enum('type', ['boisson', 'dessert', 'petit-dejeuné', 'déjeuné']);
            $table->boolean('is_available')->default(true);
            $table->integer('popularity_score')->default(0);
            $table->timestamps();
            $table->softDeletes();
            // Index pour recherche et tri
            $table->index(['type', 'is_available']);
            $table->index('popularity_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
            