<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $table = 'produits';

    protected $fillable = [
        'nom_produit',
        'prix',
        'stock',
        'stock_reserve',
    ];

    public function reservations()
    {
        return $this->hasMany(ReservationPanier::class, 'id_produit');
    }

    public function commandes()
    {
        return $this->belongsToMany(Commande::class, 'contenir', 'id_produit', 'id_commande')
            ->withPivot('quantite');
    }
}
