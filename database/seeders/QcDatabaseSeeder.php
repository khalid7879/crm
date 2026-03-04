<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\TenantSeederService;

class QcDatabaseSeeder extends Seeder
{
    private TenantSeederService $tenantSeederService;

    public function __construct(TenantSeederService $tenantSeederService)
    {
        $this->tenantSeederService = $tenantSeederService;
    }

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $modelData = config('seeder.qc_lead_count', 10);

        $this->command->warn("Start: Creating {$modelData} Leads");
        $bar = $this->command->getOutput()->createProgressBar($modelData);
        $bar->start();
        // $this->tenantSeederService->qcLeadCreate($modelData);
        $this->tenantSeederService->qcBulkLeadCreate($modelData);

        $bar->finish();
        $this->command->newLine();
        $this->command->info("End: Creating Leads");
    }
}
