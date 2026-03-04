<?php

namespace Database\Seeders;

use App\Models\CentralUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Services\TenantSeederService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
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
        ## Starting message
        $this->command->warn(PHP_EOL . 'Start: Creating User');
        ## Truncate existing records
        DB::statement('SET FOREIGN_KEY_CHECKS=0');


        $users = [
            [
                'name'  => 'Admin',
                'email' => 'mamunhossen149191@gmail.com',
                'password' => Hash::make('12345678#'),
            ],
            [
                'name'  => 'Sakil',
                'email' => 'shakil@ihelpbd.com',
                'password' => Hash::make('12345678#'),
            ],
            [
                'name'  => 'Mehedi',
                'email' => 'mehedi@ihelpbd.com',
                'password' => Hash::make('12345678#'),
            ],
            [
                'name'  => 'Mamun',
                'email' => 'mamun@ihelpbd.com',
                'password' => Hash::make('12345678#'),
            ],
        ];

        // foreach ($users as $key => $user) {
        //     CentralUser::create($user);
        // }


        ## Starting progressbar
        $this->command->getOutput()->progressStart(collect($users)->count());
        $this->command->warn(PHP_EOL);

        $this->tenantSeederService->tenantCreate(1);

        // ## Finished progressbar and success message
        $this->command->getOutput()->progressFinish();
        $this->command->info('End: Creating User');
    }
}
