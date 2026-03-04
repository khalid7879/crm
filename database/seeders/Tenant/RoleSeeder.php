<?php

namespace Database\Seeders\Tenant;

use App\Services\TenantSeederService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    private TenantSeederService $tenantSeederService;
    public function __construct(TenantSeederService $tenantSeederService)
    {
        $this->tenantSeederService = $tenantSeederService;
    }
    public function run(): void
    {
        $this->tenantSeederService->roleCreate();
    }
}
