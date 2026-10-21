<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produit;

class ProduitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Produit::insert([
            [
                'nom_produit' => 'Smartphone Gaming Pro X',
                'prix' => 450000.00,
                'stock' => 5, // Stock limité pour tester la concurrence
                'stock_reserve' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom_produit' => 'Casque Bluetooth Sans Fil',
                'prix' => 35000.00,
                'stock' => 50,
                'stock_reserve' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom_produit' => 'Clavier Mécanique RGB',
                'prix' => 25000.00,
                'stock' => 1, // <--- TRÈS IMPORTANT : Stock à 1 pour tester le verrouillage JMeter / 500 requêtes !
                'stock_reserve' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
