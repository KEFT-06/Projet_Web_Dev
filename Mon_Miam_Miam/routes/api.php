<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// ✅ Importation des bons contrôleurs
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LoyaltyTransactionController as LoyaltyController;
use App\Http\Controllers\Api\ReferralController;

// ✅ Page d’accueil (facultative)
Route::get('/', function () {
    return view('welcome');
});

// ===============================================================
// 🔓 ROUTES PUBLIQUES
// ===============================================================
Route::middleware('api')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
});

// ===============================================================
// 🔒 ROUTES PROTÉGÉES (auth:sanctum)
// ===============================================================
Route::middleware('auth:sanctum')->group(function () {

    // ✅ Authentification
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');

    // ===============================================================
    // 👨‍🎓 ÉTUDIANT
    // ===============================================================
    Route::middleware('role:student')->group(function () {
        Route::post('/orders', [OrderController::class, 'store'])->middleware('permission:orders:create');
        Route::get('/orders', [OrderController::class, 'myOrders'])->middleware('permission:orders:view-own');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->middleware('permission:orders:view-own');
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->middleware('permission:orders:cancel');

        Route::get('/loyalty/balance', [LoyaltyController::class, 'balance'])->middleware('permission:loyalty:view');
        Route::get('/loyalty/history', [LoyaltyController::class, 'history'])->middleware('permission:loyalty:view');
        Route::post('/loyalty/redeem', [LoyaltyController::class, 'redeem'])->middleware('permission:loyalty:redeem');

        Route::get('/referral/code', [ReferralController::class, 'getCode'])->middleware('permission:referral:generate-code');
        Route::get('/referral/stats', [ReferralController::class, 'stats'])->middleware('permission:referral:view-stats');
        Route::get('/referral/referrals', [ReferralController::class, 'myReferrals'])->middleware('permission:referral:view-stats');
        Route::post('/referral/apply', [ReferralController::class, 'applyCode'])->middleware('permission:referral:apply-code');


        Route::post('/complaints', [ComplaintController::class, 'store'])->middleware('permission:complaints:create');
        Route::get('/complaints', [ComplaintController::class, 'myComplaints'])->middleware('permission:complaints:view-own');
        Route::get('/complaints/{complaint}', [ComplaintController::class, 'show'])->middleware('permission:complaints:view-own');
    });

    // ===============================================================
    // 👨‍🍳 EMPLOYÉ
    // ===============================================================
    Route::middleware('role:employee')->group(function () {
        Route::get('/orders/pending', [OrderController::class, 'pending'])->middleware('permission:orders:list');
        Route::patch('/orders/{order}/prepare', [OrderController::class, 'prepare'])->middleware('permission:orders:update');
        Route::patch('/orders/{order}/complete', [OrderController::class, 'complete'])->middleware('permission:orders:update');

        Route::get('/menu', [MenuItemController::class, 'index'])->middleware('permission:menu:view');
        Route::patch('/menu/{menuItem}/toggle-availability', [MenuItemController::class, 'toggleAvailability'])->middleware('permission:menu:toggle-availability');

        Route::get('/complaints', [ComplaintController::class, 'index'])->middleware('permission:complaints:list');
        Route::post('/complaints/{complaint}/respond', [ComplaintController::class, 'respond'])->middleware('permission:complaints:update');

        Route::get('/statistics/week', [StatisticsController::class, 'weekStats'])->middleware('permission:statistics:view');
    });

    // ===============================================================
    // 👑 ADMIN
    // ===============================================================
    Route::middleware('role:admin')->group(function () {

        // Menu
        Route::apiResource('menu', MenuItemController::class);
        Route::post('/menu/{menuItem}/toggle-availability', [MenuItemController::class, 'toggleAvailability']);

        // Promotions
        Route::apiResource('promotions', PromotionController::class);

        // Orders
        Route::get('/orders', [OrderController::class, 'index'])->middleware('permission:orders:list');

        // Statistics
        Route::get('/statistics/dashboard', [StatisticsController::class, 'dashboard'])->middleware('permission:statistics:view');
        Route::get('/statistics/export', [StatisticsController::class, 'export'])->middleware('permission:statistics:export');

        // Complaints
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::patch('/complaints/{complaint}/resolve', [ComplaintController::class, 'resolve']);

        // Settings
        Route::apiResource('settings', SettingController::class);
    });

    // ===============================================================
    // 👨‍💼 EMPLOYEES (MANAGER + ADMIN)
    // ===============================================================
    // L'autorisation est gérée par EmployeePolicy dans le contrôleur.
    // Le middleware de groupe ou de permission n'est plus nécessaire ici.
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/stats', [EmployeeController::class, 'stats']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::patch('/employees/{employee}/status', [EmployeeController::class, 'toggleStatus']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);
    Route::patch('/employees/{employee}/role', [EmployeeController::class, 'changeRole']);
});

// ===============================================================
// 🌐 ROUTE PUBLIQUE
// ===============================================================
Route::get('/public', function () {
    return "Route publique 👋";
});

// ===============================================================
// 👤 ROUTES UTILISATEUR CONNECTÉ
// ===============================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
