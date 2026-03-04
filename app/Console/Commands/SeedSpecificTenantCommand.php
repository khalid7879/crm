<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\Artisan;
use App\Models\Tenant;
use Stancl\Tenancy\Facades\Tenancy;

use Illuminate\Console\Command;

class SeedSpecificTenantCommand extends Command
{
    protected $signature = 'tenant:seed-tenant {tenant_id}';
    protected $description = 'Run seeder for only a specific tenant';

    public function handle()
    {
        $tenantId = $this->argument('tenant_id');

        // Find the tenant
        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            $this->error("Tenant not found: $tenantId");
            return;
        }

        $this->info("⏳ Seeding tenant: {$tenant->id}");

        // Initialize the tenant's context
        Tenancy::initialize($tenant);

        // Run the tenant-specific seeder
        Artisan::call('db:seed', [
            '--class' => 'AllTenantSeeder',
            '--force' => true,
        ]);

        $this->info(Artisan::output());
        $this->info("✅ Done seeding tenant: {$tenant->id}");

        // End the tenancy context
        Tenancy::end();
    }
}
