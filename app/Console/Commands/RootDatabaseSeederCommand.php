<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class RootDatabaseSeederCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:seed {production?}';
    protected $description = 'Run seeder for root DB and Tenant';
    public $production = false;

    /**
     * The console command description.
     *
     * @var string
     */

    /**
     * Execute the console command.
     */

    public function handle()
    {
        $arg = $this->argument('production');

        $this->production = ($arg === 'PROD');

        config(['seeder.production' => $this->production]);

        $this->info('Production mode: ' . ($this->production ? 'YES' : 'NO'));

        $prefix = 'sass_crm_db_ihelp_2025_';
        $likePattern = str_replace('_', '\_', $prefix) . '%';
        $this->info("Dropping & re-creating the main database...");

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
        $this->info("Start: Seeding root DB");

        Artisan::call('migrate:fresh', ['--seed' => false, '--force' => true]);

        // Run the tenant-specific seeder
        // Artisan::call('db:seed', [
        //     '--class' => 'DatabaseSeeder',
        //     '--force' => true,
        // ]);

        Artisan::call('db:seed', [
            '--class' => 'DatabaseSeeder',
            '--force' => true,
        ]);

        $this->info(Artisan::output());
        $this->info("✅ Done seeding root DB");

        // End the tenancy context

    }
}
