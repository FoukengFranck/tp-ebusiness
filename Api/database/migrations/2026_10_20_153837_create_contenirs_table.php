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
        Schema::create('contenir', function (Blueprint $table) {
            $table->foreignId('id_commande')->constrained('commandes')->onDelete('cascade');
            $table->foreignId('id_produit')->constrained('produits', 'id')->onDelete('cascade');
            $table->integer('quantite');
            $table->primary(['id_commande', 'id_produit']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contenirs');
    }
};
