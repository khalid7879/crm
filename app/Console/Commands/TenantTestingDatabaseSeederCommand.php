<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\QcDatabaseSeeder;
use Illuminate\Support\Facades\Artisan;

class TenantTestingDatabaseSeederCommand extends Command
{
    protected $signature = 'tenant:qc {model?} {count?}';
    protected $description = 'Insert QC testing data into existing tables only';

    public function handle()
    {
        $max = 200000;
        $modelName = $this->argument('model') ? strtolower($this->argument('model')) : '';
        $modelData = $this->argument('count');

        if (!$modelName) {
            $this->error('Please provide a model for testing data');
            return;
        }

        if (!in_array(strtolower($modelName), ['lead', 'opportunity'])) {
            $this->error('Only lead or opportunity is supported');
            return Command::FAILURE;
        }

        if (empty($modelData) || !is_numeric($modelData)) {
            $this->error('Model argument must end with a numeric value, e.g., lead 10');
            return;
        }

        if ($modelData > $max || $modelData < 5000) {
            $this->error('Count must be between 5000 and 200000');
            return Command::FAILURE;
        }


        if ($modelName === 'lead') {
            config(['seeder.qc_lead_count' => (int) $modelData]);
        }

        $this->info("QC Insert: {$modelData} {$modelName}(s)");


        Artisan::call('db:seed', [
            '--class' => QcDatabaseSeeder::class,
            '--force' => true,
        ]);

        $this->line(Artisan::output());

        return Command::SUCCESS;
    }
}
