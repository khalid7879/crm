<?php

namespace App\Jobs;

use App\Models\Tenant;
use Database\Seeders\AllTenantSeeder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;

class AllTenantSeederJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Tenant $tenant) {}

    public function handle(): void
    {
        tenancy()->initialize($this->tenant); // 🔄 switch to tenant DB

        Artisan::call('db:seed', [
            '--class' => AllTenantSeeder::class,
            '--force' => true,
        ]);

        tenancy()->end(); // 🔚 clean up tenant context
    }
}
