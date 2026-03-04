<?php

namespace Database\Seeders\Tenant;

use App\Services\TenantSeederService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public static $currentTenant;
    /**
     * Run the database seeds.
     */
    // $tenant = tenant();
    // dd($tenant);
    private TenantSeederService $tenantSeederService;
    public function __construct(TenantSeederService $tenantSeederService)
    {
        $this->tenantSeederService = $tenantSeederService;
    }
    public function run(): void
    {
        $this->command->info('Start Tenant seeding');
        $tenant = self::$currentTenant;
        // $this->tenantSeederService->userCreate($tenant);
        $this->tenantSeederService->moduleCreate($tenant);
        $this->tenantSeederService->roleCreate($tenant);
        $this->tenantSeederService->permissionCreate($tenant);
        $this->tenantSeederService->departmentCreate($tenant);
        $this->command->info('End Tenant seeding');
    }
}
