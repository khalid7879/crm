<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *TenantUserService
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'appName' => env('APP_NAME'),
            'staticImages' => _getStaticImage(),
            'faviconPath' => _getStaticImage('favicon'),
            'logoPath' => _getStaticImage('logo'),
            'translations' => fn() => $this->getJsonTranslations(app()->getLocale()),
            'toastAlert' => fn() => $request->session()->get('toastResponse'),
            'auth' => _getAuthInformation(),
            'authPermissions' => _getAuthPermissions(),
            'tenant' => tenant('id'),
        ];
    }

    function getJsonTranslations($locale)
    {
        $path = resource_path("lang/{$locale}.json");

        if (File::exists($path)) {
            return json_decode(File::get($path), true);
        }

        return [];
    }
}
