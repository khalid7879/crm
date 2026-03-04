<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class FullResetCommand extends Command
{
    protected $signature = 'tenant:migrate-fresh';
    protected $description = 'Drops all tenant db and root DB migrations';

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
        $this->info("🎉 Main databases refreshed!");
    }
}
