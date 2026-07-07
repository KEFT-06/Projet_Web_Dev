<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints pour l'authentification des utilisateurs (inscription, connexion, déconnexion)"
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     tags={"Authentication"},
     *     summary="Enregistrer un nouvel utilisateur (étudiant)",
     *     description="Crée un nouvel utilisateur avec le rôle 'student' et retourne un token d'authentification.",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Données de l'utilisateur pour l'inscription",
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "phone"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Password123", description="Doit contenir au moins 8 caractères, une majuscule et un chiffre."),
     *             @OA\Property(property="phone", type="string", example="699887766"),
     *             @OA\Property(property="location", type="string", nullable=true, example="Cité U, Yaoundé"),
     *             @OA\Property(property="referral_code", type="string", nullable=true, description="Code de parrainage d'un autre utilisateur.", example="USER_5f8b1a3b..."),
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Utilisateur enregistré avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Utilisateur enregistré avec succès"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="1|abcdef123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation"
     *     )
     * )
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|regex:/[A-Z]/|regex:/[0-9]/',
            'phone' => 'nullable|string',
            'residence' => 'nullable|string',
            'room' => 'nullable|string',
            'referralCode' => 'nullable|exists:users,referral_code',
        ]);

        // Combiner firstName et lastName en name
        $fullName = $validated['firstName'] . ' ' . $validated['lastName'];

        // Créer l'utilisateur
        $user = User::create([
            'name' => $fullName,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'location' => $validated['residence'] ?? null,
            'referrer_id' => $this->getReferrerId($validated['referralCode'] ?? null),
            'referral_code' => 'USER_' . uniqid(),
        ]);

        // Assigner rôle étudiant
        $user->assignRole('student');

        // Préparer la réponse avec firstName et lastName
        $userData = $user->toArray();
        $nameParts = explode(' ', $user->name, 2);
        $userData['firstName'] = $nameParts[0] ?? '';
        $userData['lastName'] = $nameParts[1] ?? '';

        return response()->json([
            'message' => 'Utilisateur enregistré avec succès',
            'user' => $userData,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Authentication"},
     *     summary="Connecter un utilisateur",
     *     description="Authentifie un utilisateur avec son email et mot de passe, et retourne un token.",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Identifiants de l'utilisateur",
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Connexion réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Connexion réussie"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="2|abcdef123456"),
     *             @OA\Property(property="roles", type="array", @OA\Items(type="string"), example={"student"}),
     *             @OA\Property(property="permissions", type="array", @OA\Items(type="object"), example={})
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Identifiants incorrects"
     *     )
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Préparer la réponse avec firstName et lastName
        $userData = $user->toArray();
        $nameParts = explode(' ', $user->name, 2);
        $userData['firstName'] = $nameParts[0] ?? '';
        $userData['lastName'] = $nameParts[1] ?? '';
        $userData['role'] = $user->getRoleNames()->first() ?? 'student';

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $userData,
            'token' => $user->createToken('auth_token')->plainTextToken,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Authentication"},
     *     summary="Déconnecter l'utilisateur",
     *     description="Invalide le token d'authentification actuel de l'utilisateur.",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Déconnexion réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Déconnexion réussie")
     *         )
     *     )
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }
    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     tags={"Authentication"},
     *     summary="Obtenir les informations de l'utilisateur authentifié",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Informations de l'utilisateur", @OA\JsonContent(type="object"))
     * )
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoleNames(),
            'permissions' => $request->user()->getAllPermissions(),
        ]);
    }

    private function getReferrerId(?string $referralCode): ?int
    {
        if (!$referralCode) {
            return null;
        }
        $referrer = User::where('referral_code', $referralCode)->first();
        return $referrer?->id;
    }
}