<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\BaseTenantController;
use Inertia\Response;

/**
 * @component HomeController
 *
 * @description
 * Frontend Home Controller responsible for rendering
 * the tenant-specific landing page using Inertia.js.
 *
 * This controller acts as the entry point for the
 * frontend home view within a multi-tenant context.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
class HomeController extends BaseTenantController
{
    /**
     * @method index
     *
     * @description
     * Renders the frontend home page for the current tenant.
     * The response is returned as an Inertia view, allowing
     * seamless integration between Laravel and the frontend
     * JavaScript framework.
     *
     * @return \Inertia\Response
     */
    public function index(): Response
    {
        return inertia('Frontend/HomePage');
    }
}
