<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class StoreOrderRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à effectuer cette requête.
     */
    public function authorize(): bool
    {
        return Auth::check(); // L'utilisateur doit simplement être connecté pour créer une commande
    }

    /**
     * Récupère les règles de validation qui s'appliquent à la requête.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'delivery_type' => 'required|in:delivery,on_site',
            'delivery_address' => 'nullable|string|max:255|required_if:delivery_type,delivery',
            'delivery_time' => 'nullable|date|after:now',
            'comment' => 'nullable|string|max:1000',
            'points_to_use' => 'nullable|integer|min:0',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0', // Le prix doit être validé côté serveur
        ];
    }
    /**
     * Messages de validation personnalisés.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'delivery_type.required' => 'Le type de livraison est requis (delivery ou on_site).',
            'delivery_address.required_if' => 'L\'adresse de livraison est requise pour une livraison.',
            'items.required' => 'Le panier ne peut pas être vide.',
            'items.array' => 'Le panier doit être une liste d\'articles.',
            'items.*.menu_item_id.required' => 'Chaque article du panier doit avoir un identifiant.',
            'items.*.menu_item_id.exists' => 'Un des articles du panier n\'existe pas.',
            'items.*.quantity.required' => 'La quantité pour chaque article est requise.',
            'items.*.quantity.min' => 'La quantité doit être d\'au moins 1.',
            'items.*.price.required' => 'Le prix de chaque article est requis pour la validation.',
        ];
    }
}