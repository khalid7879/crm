<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Stancl\Tenancy\Facades\Tenancy;

class AllTenantSeederCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:all_seed_ihelp';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seeding for all tenant';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenants = Tenant::all();

        if (empty($tenants)) {
            $this->error('Tenant not found.');
            return;
        }
        foreach ($tenants as $key => $tenant) {
            ## Activates the tenant's database connection
            Tenancy::initialize($tenant['id']);
            ## Start progress bar
            $this->info(" Start: Seeding run for " . $tenant['id']);
            // Run the seeder
            Artisan::call('db:seed', [
                '--class' => 'AllTenantSeeder',
                '--force' => true,
            ]);
            $this->info(" End: Seeding run for " . $tenant['id']);
        }
    }
}
