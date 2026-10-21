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
        Schema::table('commandes', function (Blueprint $table) {
            $table->boolean('mode_livraison')->default(true);
            $table->string('telephone')->nullable();
            $table->string('lieu_livraison')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn(['mode_livraison', 'telephone', 'lieu_livraison']);
        });
    }
};
