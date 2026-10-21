<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $table = 'commandes';

    protected $fillable = [
        'date',
        'heure',
        'statut',
        'user_id',
        'mode_livraison',
        'telephone',
        'lieu_livraison',
        'idempotency_key',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'contenir', 'id_commande', 'id_produit')
            ->withPivot('quantite');
    }
}
