<?php

namespace Database\Seeders;
use Database\Seeders\Tenant\TenantSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RootTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         ## Seeders for Tenant
        $this->call([
            TenantSeeder::class,
        ]);
    }
}
