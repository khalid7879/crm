<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Tenant;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'auth' => \App\Http\Middleware\EnsureUserIsAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {

            $tenantIdentifier = request()->segment(1);
            $isTenantExist = Tenant::where('id', $tenantIdentifier)->exists();

            // $tenant = Tenant::where('id', $tenantIdentifier)->first();



            ## Optional: Get shared data as above
            $middleware = app(HandleInertiaRequests::class);
            $sharedData = $middleware->share($request);
            // dd($sharedData);

            // dd( $isTenantExist, $sharedData, $request, $response, $exception,);
            ## New: Specific handling for TenantCouldNotBeIdentifiedByPathException
            if (!$isTenantExist || $exception instanceof TenantCouldNotBeIdentifiedByPathException) {
                $props = [
                    'translations' => collect($sharedData)->only(['staticImages', 'faviconPath', 'logoPath', 'translations']),
                    'status' => 404,
                    'tenant' => null,
                    'message' => 'The requested tenant could not be found',
                ];
                return Inertia::render('Errors/CommonWebErrorPage', $props);
            }
            // dd($isTenantExist, $sharedData, $request, $response, $exception,);

            ## Your existing code for 500, 503, 404, 403
            if (app()->environment(['local', 'testing', 'production']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                $props = [
                    'translations' => collect($sharedData)->only(['staticImages', 'faviconPath', 'logoPath', 'translations']),
                    'status' => $response->getStatusCode(),
                    'tenant' => $tenantIdentifier,
                    'message' => 'Something went wrong',

                ];
                return Inertia::render('Errors/TenantErrorPage', $props);
            }

            ## Handle CSRF mismatch (419)
            if ($response->getStatusCode() === 419) {
                return redirect()->route('tenant.login');
            }



            return $response;
        });
    })->create();
