<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationPanier extends Model
{
    protected $table = 'reservation_paniers';

    protected $fillable = [
        'user_id',
        'id_produit',
        'quantite',
        'expires_at',
        'statut',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'id_produit');
    }
}
