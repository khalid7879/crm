<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Services\TenantSeederService;

class PermissionModelSeeder extends Seeder
{
    private TenantSeederService $tenantSeederService;
    public function __construct(TenantSeederService $tenantSeederService)
    {
        $this->tenantSeederService = $tenantSeederService;
    }
    public function run(): void
    {
        $this->tenantSeederService->permissionCreate();
    }
}
