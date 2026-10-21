<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'id_produit' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'mode_livraison' => 'boolean',
            'telephone' => 'nullable|string',
            'lieu_livraison' => 'nullable|string',
        ]);

        try {
            $result = DB::transaction(function () use ($validated) {
                // 1. Verrouiller le produit
                $produit = Produit::where('id', $validated['id_produit'])->lockForUpdate()->first();

                // 2. Vérifier le stock réel disponible
                if ($produit->stock < $validated['quantite']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stock insuffisant. Il ne reste que ' . $produit->stock . ' exemplaire(s).'
                    ], 400);
                }

                // 3. Décrémenter le stock global du produit
                $produit->stock -= $validated['quantite'];
                $produit->save();

                // 4. Créer la commande définitive
                $commande = Commande::create([
                    'user_id' => $validated['user_id'],
                    'date' => now()->toDateString(),
                    'heure' => now()->toTimeString(),
                    'statut' => 'VALIDEE',
                    'mode_livraison' => $validated['mode_livraison'] ?? true,
                    'telephone' => $validated['telephone'] ?? null,
                    'lieu_livraison' => $validated['lieu_livraison'] ?? null,
                    'idempotency_key' => $validated['idempotency_key'] ?? uniqid('idemp_', true),
                ]);

                // 5. Attacher le produit à la commande via la table pivot (contenir)
                $commande->produits()->attach($produit->id, ['quantite' => $validated['quantite']]);

                return response()->json([
                    'success' => true,
                    'message' => 'Commande passée et stock mis à jour avec succès !',
                    'data' => $commande
                ], 201);
            });

            return $result;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }
}
