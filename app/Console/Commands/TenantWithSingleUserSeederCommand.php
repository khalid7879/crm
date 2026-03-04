<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;


class TenantWithSingleUserSeederCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:migrate-fresh-tenant';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Drops all tenant DB with root DB and only a tenant migrations ';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $prefix = 'sass_crm_db_ihelp_2025_';
        $likePattern = str_replace('_', '\_', $prefix) . '%';
        $this->info(" Dropping & re-creating the main database...");

        $databases = DB::select("
        SELECT SCHEMA_NAME as db_name FROM information_schema.schemata
        WHERE SCHEMA_NAME LIKE ? AND SCHEMA_NAME NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')
    ", [$likePattern]);

        foreach ($databases as $db) {
            $this->line("- {$db->db_name}");
        }

        foreach ($databases as $db) {
            DB::statement("DROP DATABASE `{$db->db_name}`");
            $this->info("Dropped: {$db->db_name}");
        }

        // Reset main database
        Artisan::call('migrate:fresh', ['--seed' => false, '--force' => true]);
        $this->info(Artisan::output());
        $this->info(" Main databases refreshed!");
        // Seed tenant
        Artisan::call('db:seed', [
            '--class' => 'RootTenantSeeder',
            '--force' => true,
        ]);
        $this->info("✅  Tenant databases created!: ");
    }
}
