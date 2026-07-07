<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *      schema="StoreMenuItemRequest",
 *      title="Store Menu Item Request",
 *      description="Request body for creating a new menu item",
 *      type="object",
 *      required={"name", "price", "type"},
 *      @OA\Property(property="name", type="string", maxLength=255, description="Name of the menu item"),
 *      @OA\Property(property="description", type="string", nullable=true, description="Description of the menu item"),
 *      @OA\Property(property="price", type="number", format="float", description="Price of the menu item"),
 *      @OA\Property(property="image", type="string", nullable=true, format="url", description="URL of the image"),
 *      @OA\Property(property="type", type="string", enum={"boisson", "dessert", "petit-dejeuné", "déjeuné"}),
 *      @OA\Property(property="is_available", type="boolean", default=true, description="Availability of the item")
 * )
 */
class StoreMenuItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled in the controller via policies
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|url',
            'type' => 'required|in:boisson,dessert,petit-dejeuné,déjeuné',
            'is_available' => 'sometimes|boolean',
        ];
    }
}