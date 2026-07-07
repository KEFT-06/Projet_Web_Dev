<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class UpdateOrderRequest extends FormRequest
{

    /**
     * Détermine si l'utilisateur est autorisé à effectuer cette requête.
     */
    public function authorize(): bool
    {
        $order = $this->route('order');
        return Gate::allows('update', $order);
    }

    /**
     * Récupère les règles de validation qui s'appliquent à la requête.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules()
    {
        return [
            'delivery_type' => 'sometimes|required|string|in:on_site,delivery',
            'delivery_address' => 'sometimes|required|string|max:255',
            'delivery_time' => 'sometimes|required|date_format:Y-m-d H:i:s',
            'comment' => 'sometimes|nullable|string|max:1000',
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
            'delivery_type.in' => 'Le type de livraison doit être "on_site" ou "delivery".',
            'delivery_address.max' => 'L\'adresse de livraison ne peut pas dépasser 255 caractères.',
            'delivery_time.date_format' => 'Le format de la date de livraison doit être "Y-m-d H:i:s".',
            'comment.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
        ];
    }
}
