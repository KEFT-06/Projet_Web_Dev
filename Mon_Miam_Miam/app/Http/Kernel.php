<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middlewareGroups = [
        'web' => [],
        'api' => [\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,],
    ];

    /**
     * The application's route middleware.
     *
     * These can be assigned to routes individually.
     *
     * @var array<string, class-string>
     */
    protected $routeMiddleware = [
        // role middleware checks if the authenticated user has at least one of the given roles
        'role' => \App\Http\Middleware\CheckRole::class,
    ];
}