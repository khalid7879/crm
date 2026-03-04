<?php

namespace Database\Seeders\Tenant;

use App\Services\TenantSeederService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    private TenantSeederService $tenantUeederService;
    public function __construct(TenantSeederService $tenantUeederService)
    {
        $this->tenantUeederService = $tenantUeederService;
    }
    public function run(): void
    {
        $this->tenantUeederService->departmentCreate();
    }
}
