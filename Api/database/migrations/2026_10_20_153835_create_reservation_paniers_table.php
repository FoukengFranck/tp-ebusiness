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
        Schema::create('reservation_paniers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('id_produit')->constrained('produits', 'id')->onDelete('cascade');
            $table->integer('quantite');
            $table->dateTime('expires_at');
            $table->string('statut', 50)->default('ACTIVE'); // ACTIVE, CONFIRMEE, EXPIREE
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_paniers');
    }
};
