<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Tenancy;
use App\Models\Tenant;

class TenantTruncateCommand extends Command
{
    protected $signature = 'tenant:truncate_ihelp {tenant_id}';
    protected $description = 'Truncate all tables for specific tenant';

    public function handle()
    {
        $tenantId = $this->argument('tenant_id');
        $tenant = Tenant::where('id', $tenantId)->first();

        if (! $tenant) {
            $this->error('Tenant not found.');
            return;
        }
        // Tenancy::initialize($tenant);
        tenancy()->initialize($tenant);

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Get all table names
        $tables = DB::select('SHOW TABLES');
        $dbNameKey = 'Tables_in_' . DB::getDatabaseName();

        ## Start progress bar
        $this->output->progressStart(collect($tables)->count());

        foreach ($tables as $table) {
            $tableName = $table->$dbNameKey;
            if ($tableName !== 'migrations') {
                DB::table($tableName)->truncate();
                $this->info("Truncated: $tableName");
            }
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        tenancy()->end();

        ## End progress bar
        $this->output->progressFinish();

        $this->info('✅ All tenant tables truncated for akij.');
    }
}
