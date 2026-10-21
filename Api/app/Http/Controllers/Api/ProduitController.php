<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;

class ProduitController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Produit::all()
        ]);
    }
}
