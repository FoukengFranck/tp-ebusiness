<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer un utilisateur de test par défaut
        User::firstOrCreate(
            ['email' => 'client@test.com'],
            [
                'name' => 'Client Test',
                'password' => bcrypt('password123'),
                'role' => 'client'
            ]
        );

        // Lancer le seeder des produits
        $this->call([
            ProduitSeeder::class,
        ]);
    }
}
