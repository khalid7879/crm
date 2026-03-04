<?php

namespace Database\Seeders;

use Database\Seeders\Tenant\DepartmentSeeder;
use Database\Seeders\Tenant\PermissionModelSeeder;
use Database\Seeders\Tenant\ProfileSeeder;
use Database\Seeders\Tenant\RoleSeeder;
use Database\Seeders\Tenant\UserSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AllTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = tenant();
        UserSeeder::$currentTenant = $tenant;
        ## Seeders for Tenant
        $this->call([
            UserSeeder::class, 
            // DepartmentSeeder::class,
            // RoleSeeder::class,
            // PermissionModelSeeder::class,
            // ProfileSeeder::class,
        ]);
    }
}
