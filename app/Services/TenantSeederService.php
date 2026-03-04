<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\Role;
use App\Models\User;
use Faker\Generator;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\Department;
use App\Models\Permission;
use App\Models\Tenant\Tag;
use App\Models\CentralUser;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Note;
use App\Models\Tenant\Task;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use App\Models\Tenant\Stage;
use App\Models\Tenant\Contact;
use App\Models\Tenant\Product;
use App\Models\Tenant\Profile;
use App\Models\Tenant\Project;
use App\Models\Tenant\DataRating;
use App\Models\Tenant\DataSource;
use App\Models\Tenant\SocialLink;
use App\Models\Tenant\DataEmpSize;
use App\Models\Tenant\DataRevenue;
use App\Models\Tenant\Opportunity;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\DataCategory;
use App\Models\Tenant\DataPriority;
use App\Models\Tenant\Organization;
use Stancl\Tenancy\Facades\Tenancy;
use App\Models\Tenant\SystemCountry;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant\CompanySetting;
use App\Models\Tenant\DataContactTime;
use App\Models\Tenant\DataDesignation;
use App\Models\Tenant\DataEmailSetting;
use App\Models\Tenant\NotificationEvent;

class TenantSeederService extends BaseModelService
{
    protected Generator $fake;
    private bool $production;

    public function __construct()
    {
        $this->fake = Faker::create();
        $this->production = (bool) config('seeder.production', false);
    }



    /**
     * Start tenant create method        
     *
     * @param integer $isChecked
     * @return void
     */
    public function tenantCreate($isChecked = 0)
    {
        ## isChecked == 1, this method from only a tenant migrations
        $tenantDatas = [
            [
                'id' => 'ihelpkl',
                'company' => 'iHelpKl',
                'email' => 'superadmin@ihelpkl.com',
                'email_verified_at' => now(),
            ],
        ];
        foreach ($tenantDatas as $tenantData) {
            $tenant = Tenant::create($tenantData);
            $tenant->run(function () use ($tenant) {
                $userInputs = [
                    'global_id' => $tenant->id,
                    'name' => 'ihelpkl admin',
                    'email' => 'superadmin@ihelpkl.com',
                    'password' => Hash::make('Sadmin2025#'),
                    'is_active' => '1',
                ];

                $user = User::create([...$userInputs, 'is_default_admin' => true, 'ip' => request()->ip()]);
                $userInputs['email_verified_at'] = now();
                CentralUser::create($userInputs);
                $this->companySettingCreate($tenant);


                $contact = Contact::create(['email' => $user->email, 'nickname' => $user->name]);

                $user->contactUser()->sync($contact->id);

                $contact->causer_id = $contact->id;
                $contact->owner_id = $contact->id;

                $contact->save();
            });

            if ($isChecked == 1) {
                $this->moduleCreate();
                $this->roleCreate();
                $this->permissionCreate();
                $this->userCreate($tenantData);
                $this->moduleCreate();
                // $this->roleCreate();
                $this->permissionCreate();
                $this->socialLinkCreate();
                $this->dataContactTimeCreate();
                $this->dataEmpSizeCreate();
                // $this->departmentCreate();
                $this->assignRole();
                $this->dataCategoryCreate();
                $this->productCreate();
                $this->revenueCreate();
                $this->dataSourceCreate();
                $this->stageCreate();
                $this->dataPrioritiesCreate();
                $this->dataRatingCreate();
                $this->designationCreate();
                $this->tagCreate();
                // $this->contactCreate();
                $this->organizationCreate();
                $this->leadCreate();
                $this->notificationEventCreate();
                $this->taskCreate();
                $this->noteCreate();
                $this->opportunityCreate();
                $this->emailSettingCreate();
                $this->projectCreate();
            }
        }
    }

    public function companySettingCreate($data)
    {
        $companySettings = [
            [
                'type' => 'Company',
                'value' => $data->company
            ],
            [
                'type' => 'Phone',
                'value' => $this->fake->numerify('01#########'),
            ],
            [
                'type' => 'Email',
                'value' => ''
            ],
            [
                'type' => 'Address',
                'value' => ''
            ],
        ];
        foreach ($companySettings as $key => $companySetting) {
            CompanySetting::create($companySetting);
        }
    }

    /**
     * Start user create method
     *
     * @param array $tenant
     * @return void
     * @author Mamun <mamunhossen149191@gmail.com>
     */
    public function backupUserCreate($tenant = [])
    {
        if ($this->production) {
            if (User::where('email', 'sales@ihelpkl.com')->exists() || CentralUser::where('email', 'sales@ihelpkl.com')->exists()) {
                return;
            }
            $userData = [
                'global_id' => $tenant['id'],
                'name' => 'Sales Executive',
                'email' => 'sales@ihelpkl.com',
                'password' => Hash::make("Sales2025#"),
                'is_active' => '1',
            ];
            if (!empty($tenant)) {
                Tenancy::initialize($tenant['id']);
                $this->roleCreate();
                $this->departmentCreate();
            }
            $user = User::create([...$userData, 'is_default_admin' => true, 'ip' => request()->ip()]);
            if ($user) {

                $contact = Contact::create(['email' => $user->email, 'nickname' => $user->name, 'salutation' => rand(1, 4)]);

                $user->department()->sync(Department::inRandomOrder()->first()?->id);
                $user->contactUser()->sync($contact->id);

                $contact->causer_id = $contact->id;
                $contact->owner_id = $contact->id;

                $contact->save();
            }
            $user->assignRole(Role::where('name', 'Sales Executive')->first()?->id);
            // $userData['email_verified_at'] = now();
            CentralUser::create([...$userData, 'email_verified_at' => now(), 'ip' => request()->ip()]);
        } else {

            for ($i = 0; $i < 10; $i++) {

                $email = $this->fake->unique()->safeEmail();

                if (User::where('email', $email)->exists() || CentralUser::where('email', $email)->exists()) {
                    continue;
                }
                $userData = [
                    'global_id' => $tenant['id'],
                    'name' => $this->fake->unique()->name(),
                    'email' => $email,
                    'password' => Hash::make("12345678#"),
                    'is_active' => '1',
                ];
                if (!empty($tenant)) {
                    Tenancy::initialize($tenant['id']);
                    $this->roleCreate();
                    $this->departmentCreate();
                }
                $user = User::create([...$userData, 'is_default_admin' => true, 'ip' => request()->ip()]);
                if ($user) {

                    $contact = Contact::create(['email' => $user->email, 'nickname' => $user->name, 'salutation' => rand(1, 4)]);

                    $user->department()->sync(Department::inRandomOrder()->first()?->id);
                    $user->contactUser()->sync($contact->id);

                    $contact->causer_id = $contact->id;
                    $contact->owner_id = $contact->id;

                    $contact->save();
                }
                $user->assignRole(Role::inRandomOrder()->first()?->id);
                // $userData['email_verified_at'] = now();
                CentralUser::create([...$userData, 'email_verified_at' => now(), 'ip' => request()->ip()]);
            }
        }
    }
    public function userCreate(array $tenant = [])
    {
        if (empty($tenant)) {
            return;
        }

        Tenancy::initialize($tenant['id']);

        $this->roleCreate();
        $this->departmentCreate();

        if ($this->production) {
            $this->createProductionUser($tenant);
        } else {
            $this->createFakeUsers($tenant, 10);
        }
    }
    protected function createProductionUser(array $tenant): void
    {
        $email = 'sales@ihelpkl.com';

        if (
            User::where('email', $email)->exists() ||
            CentralUser::where('email', $email)->exists()
        ) {
            return;
        }

        $userData = $this->baseUserData($tenant, [
            'name'  => 'Sales Executive',
            'email' => $email,
            'password' => Hash::make('Sales2025#'),
        ]);

        $user = $this->createUserWithContact($userData, true);

        $user->assignRole(
            Role::where('name', 'Sales Executive')->value('id')
        );

        CentralUser::create([
            ...$userData,
            'email_verified_at' => now(),
        ]);
    }
    protected function createFakeUsers(array $tenant, int $count = 10): void
    {
        for ($i = 0; $i < $count; $i++) {

            $email = $this->fake->unique()->safeEmail();

            if (
                User::where('email', $email)->exists() ||
                CentralUser::where('email', $email)->exists()
            ) {
                continue;
            }

            $userData = $this->baseUserData($tenant, [
                'name'  => $this->fake->name(),
                'email' => $email,
                'password' => Hash::make('12345678#'),
            ]);

            $user = $this->createUserWithContact($userData, true);

            $user->assignRole(
                Role::inRandomOrder()->value('id')
            );

            CentralUser::create([
                ...$userData,
                'email_verified_at' => now(),
            ]);
        }
    }
    protected function createUserWithContact(array $userData, bool $defaultAdmin = false): User
    {
        $user = User::create([
            ...$userData,
            'is_default_admin' => $defaultAdmin,
        ]);

        $contact = Contact::create([
            'email'      => $user->email,
            'nickname'   => $user->name,
            'salutation' => rand(1, 4),
            'causer_id'  => null,
            'owner_id'   => null,
        ]);

        $user->department()->sync(
            Department::inRandomOrder()->value('id')
        );

        $user->contactUser()->sync($contact->id);

        $contact->update([
            'causer_id' => $contact->id,
            'owner_id'  => $contact->id,
        ]);

        return $user;
    }

    protected function baseUserData(array $tenant, array $overrides = []): array
    {
        return array_merge([
            'global_id' => $tenant['id'],
            'is_active' => 1,
            'ip' => request()->ip(),
        ], $overrides);
    }


    /**
     * Module create
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function moduleCreate($tenant = [])
    {
        $modules = [
            [
                'name' => 'Users',
                'note' => 'Users module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Settings',
                'note' => 'Settings module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Modules',
                'note' => 'Modules module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Tasks',
                'note' => 'Tasks module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Follow-ups',
                'note' => 'Follow-ups module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Reports',
                'note' => 'Reports module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Roles',
                'note' => 'Roles module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Permissions',
                'note' => 'Permissions module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Departments',
                'note' => 'Departments module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Leads',
                'note' => 'Leads module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Opportunities',
                'note' => 'Opportunities module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Clients',
                'note' => 'Clients module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'SMS',
                'note' => 'SMS module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Email',
                'note' => 'Email module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Products',
                'note' => 'Products module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Industry Types',
                'note' => 'Industry type module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Lead Sources',
                'note' => 'Lead source module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Stages',
                'note' => 'Stage module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Lead Priorities',
                'note' => 'Lead priority module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Lead Ratings',
                'note' => 'Lead rating module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Data Designations',
                'note' => 'Data Designation module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Notification Settings',
                'note' => 'Notification Setting module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Company Settings',
                'note' => 'Company Setting module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Social Links',
                'note' => 'Social Link module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Data Contact Times',
                'note' => 'Data contact times module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Data Emp Sizes',
                'note' => 'Data emp sizes module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'User Settings',
                'note' => 'User setting module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Email Settings',
                'note' => 'Email setting module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Data Revenue',
                'note' => 'Data revenue module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Contacts',
                'note' => 'Contacts module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Organization',
                'note' => 'Organization module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Projects',
                'note' => 'Projects module',
                'parent_checked' => '1',
            ],
            [
                'name' => 'Reports',
                'note' => 'Reports module',
                'parent_checked' => '1',
            ],
        ];
        foreach ($modules as $module) {
            if (Module::where('name', $module['name'])->exists()) {
                continue;
            }
            Module::create($module);
        }
    }


    /**
     * Role create
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function roleCreate($tenant = [])
    {
        $roles = [
            [
                'name' => SUPER_ADMIN,
                'guard_name' => 'web'
            ],
            [
                'name' => 'Admin',
                'guard_name' => 'web'
            ],
            [
                'name' => 'Head Of Department',
                'guard_name' => 'web'
            ],
            [
                'name' => 'Sales Executive',
                'guard_name' => 'web'
            ],
        ];
        foreach ($roles as $role) {
            if (Role::where('name', $role['name'])->exists()) {
                continue;
            }
            Role::create($role);
        }
    }

    /**
     * contact create
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function contactCreate()
    {
        for ($i = 0; $i < 10; $i++) {
            $title = $this->fake->words(2, true);

            if (Contact::where('nickname', $title)->exists()) {
                continue;
            }

            $contactData = [
                'nickname' => $title,
                'causer_id' => null,
                'owner_id' => null,
                'salutation' => rand(1, 4),
                'mobile_number' => $this->fake->numerify('01#########'),
                'email' => $this->fake->unique()->safeEmail(),
                'dob' => Carbon::now()->subYears(rand(18, 60))->format('Y-m-d'),
                'details' => $this->fake->sentence(12),
                'is_parent_user_deleted' => false,
                'is_delete' => true,
            ];
            $contact = Contact::create($contactData);
            if ($contact) {

                $contact->address()->Create([
                    'type' => SHIPPING,
                    'country' => 'Bangladesh',
                    'city' => 'Dhaka',
                    'post_code' => $this->fake->postcode(),
                    'street' => $this->fake->streetAddress(),
                ]);

                $user = Contact::inRandomOrder()->first()?->id;
                $contactId = $this->usersContactReference($user);
                $this->doAttachWithParentModel(parentModel: $contact, childModel: $contactId, relationalMethod: 'associates');

                $tag = Tag::inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $contact, childModel: $tag, relationalMethod: 'tags');

                $socialLink = SocialLink::inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $contact, childModel: $socialLink, relationalMethod: 'socials', additionalInputs: ['url' => $this->fake->url()]);
            }
        }
    }

    /**
     * Organization create
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function organizationCreate($tenant = [])
    {
        $allowedNames = [
            'ihelpbd',
            'tcg',
            'labadi',
            'zenex',
            'akiz',
            'alibaba',
            'amazong',
            'google',
            'facebook'
        ];

        $endMonth = now()->startOfMonth();
        $startMonth = $endMonth->copy()->subMonths(11);

        $months = collect(range(0, 11))
            ->map(fn($i) => $startMonth->copy()->addMonths($i));

        $pattern = [3, 4, 2];

        foreach ($months as $index => $monthDate) {

            $year = $monthDate->year;
            $month = $monthDate->month;

            $today = Carbon::today();

            $maxDay = ($year == $today->year && $month == $today->month)
                ? $today->day
                : Carbon::create($year, $month)->daysInMonth;

            $length = $pattern[$index % count($pattern)];

            for ($i = 0; $i < $length; $i++) {

                $baseName = ucfirst($this->fake->randomElement($allowedNames));
                $suffix   = $this->fake->companySuffix();
                $uniqueNo = rand(100, 9999);

                $name = "{$baseName} {$suffix} {$uniqueNo}";

                ## Extra safety (very low chance of hit now)
                if (Organization::where('name', $name)->exists()) {
                    continue;
                }

                $userId = Contact::inRandomOrder()->value('id');

                $organization = Organization::create([
                    'name'         => $name,
                    'causer_id'    => $userId,
                    'owner_id'     => $userId,
                    'mobile_number' => $this->fake->numerify('01#########'),
                    'website'      => $this->fake->url(),
                    'details'      => $this->fake->sentence(12),
                    'is_sample'    => true,
                    'created_at'   => Carbon::create(
                        $year,
                        $month,
                        rand(1, $maxDay)
                    ),
                    'updated_at'   => now(),
                ]);

                if (!$organization) {
                    continue;
                }

                foreach ([SHIPPING, BILLING] as $type) {
                    $country = SystemCountry::inRandomOrder()->first();

                    $organization->address()->create([
                        'type'      => $type,
                        'country'   => $country?->name,
                        'city'      => $country?->cities?->first()?->name,
                        'post_code' => $this->fake->postcode(),
                        'street'    => $this->fake->streetAddress(),
                    ]);
                }


                if ($tagId = Tag::inRandomOrder()->value('id')) {
                    $this->doAttachWithParentModel(
                        parentModel: $organization,
                        childModel: $tagId,
                        relationalMethod: 'tags'
                    );
                }


                if ($userId = User::inRandomOrder()->value('id')) {
                    $contactId = $this->usersContactReference($userId);

                    $this->doAttachWithParentModel(
                        parentModel: $organization,
                        childModel: $contactId,
                        relationalMethod: 'associates'
                    );
                }


                if ($socialId = SocialLink::inRandomOrder()->value('id')) {
                    $this->doAttachWithParentModel(
                        parentModel: $organization,
                        childModel: $socialId,
                        relationalMethod: 'socials',
                        additionalInputs: ['url' => $this->fake->url()]
                    );
                }
            }
        }
    }




    /*
        Start department create method
        Author Mamun 
    **/
    public function departmentCreate($tenant = [])
    {
        $departments = [
            [
                'name' => 'Lead Management',
            ],
            [
                'name' => 'Opportunity Management',
            ],
            [
                'name' => 'Pipeline Tracking',
            ],
            [
                'name' => 'Sales Forecasting',
            ],
            [
                'name' => 'Quotation / Proposal Management',
            ],
        ];
        foreach ($departments as $key => $department) {
            if (Department::where('name', $department['name'])->exists()) {
                continue;
            }
            Department::create($department);
        }
    }
    ## End department create method

    /*
        Start industry type create method
        Author Mamun 
    **/
    public function dataCategoryCreate($tenant = [])
    {
        $dataCategories = [
            [
                'name' => 'Education',
                'type' => PRODUCT,
                'is_delete' => '1'
            ],
            [
                'name' => 'Medical',
                'type' => PRODUCT,
                'is_delete' => '1'
            ],
            [
                'name' => 'Finance',
                'type' => INDUSTRY,
                'is_delete' => '1'
            ],
            [
                'name' => 'Construction',
                'type' => PRODUCT,
                'is_delete' => '1'
            ],
            [
                'name' => 'Transportation ',
                'type' => INDUSTRY,
                'is_delete' => '1'
            ],
            [
                'name' => 'Agriculture ',
                'type' => INDUSTRY,
                'is_delete' => '1'
            ],
            [
                'name' => 'Email ',
                'type' => TASK,
                'is_delete' => '0'
            ],
            [
                'name' => 'Follow-up',
                'type' => TASK,
                'is_delete' => '0'
            ],
            [
                'name' => 'Meeting ',
                'type' => TASK,
                'is_delete' => '0'
            ],
            [
                'name' => 'Phone call',
                'type' => TASK,
                'is_delete' => '0'
            ],
            [
                'name' => 'To-do',
                'type' => TASK,
                'is_delete' => '0'
            ],
            [
                'name' => 'Get started',
                'type' => TASK,
                'is_delete' => '0'
            ],
            [
                'name' => 'Get started',
                'type' => OPPORTUNITY,
                'is_delete' => '1'
            ],
            [
                'name' => 'Get started',
                'type' => PROJECT,
                'is_delete' => '1'
            ],

        ];
        foreach ($dataCategories as $key => $dataCategory) {
            if (DataCategory::where(['name' => $dataCategory['name'], 'type' => $dataCategory['type']])->exists()) {
                continue;
            }
            DataCategory::create($dataCategory);
        }
    }

    ## End department create method

    /*
        Start industry type create method
        Author Mamun 
    **/
    public function productCreate($tenant = [])
    {
        $products = [
            [
                'name' => 'CRM',
                'price' => 10000
            ],
            [
                'name' => 'Call center',
                'price' => 20000
            ],
            [
                'name' => 'Omni',
                'price' => 30000
            ],
            [
                'name' => 'Ticket Management',
                'price' => 25000
            ],
        ];
        foreach ($products as $key => $product) {

            if (Product::where('name', $product['name'])->exists()) {
                continue;
            }
            $product = Product::create($product);

            $category = DataCategory::where('type', INDUSTRY)->inRandomOrder()->first();

            if ($category) {
                $product->categories()->sync($category->id);
            }
        }
    }

    ## End product create method

    /*
        Start revenue create method
        Author Mamun 
    **/
    public function revenueCreate($tenant = [])
    {
        $revenues = [
            [
                'name' => 'New',
            ],
            [
                'name' => 'Expansion',
            ],
            [
                'name' => 'Recurring',
            ],
            [
                'name' => 'Project',
            ],
            [
                'name' => 'Service',
            ],
            [
                'name' => 'Fee',
            ],
            [
                'name' => 'Commission',
            ],
            [
                'name' => 'Other',
            ],
        ];
        foreach ($revenues as $key => $revenue) {
            if (DataRevenue::where('name', $revenue['name'])->exists()) {
                continue;
            }
            DataRevenue::create($revenue);
        }
    }

    /*
        Social link create method
        Author Mamun 
    **/
    public function socialLinkCreate($tenant = [])
    {
        $socialLinks = _socialLinks();
        $order = 1;
        foreach ($socialLinks as $key => $socialLink) {
            if (SocialLink::where('name', $socialLinks[$key]['label'])->exists()) {
                continue;
            }
            $data = [
                'name' => $socialLinks[$key]['label'],
                'icon' => $socialLinks[$key]['icon'],
                'order' => ++$order,
            ];
            SocialLink::create($data);
        }
    }

    /*
        Data contact time create method
        Author Mamun 
    **/
    public function dataContactTimeCreate($tenant = [])
    {
        $dataContactTimes = [
            [
                'name' => "Evening (6 PM to 8 PM)",
                'note' => $this->fake->sentence(),
            ],
            [
                'name' => "Morning (10 AM to 12 PM)",
                'note' => $this->fake->sentence(),
            ],
            [
                'name' => "Afternoon (1 PM to 3 PM)",
                'note' => $this->fake->sentence(),
            ],
            [
                'name' => "Late Afternoon (3 PM to 5 PM)",
                'note' => $this->fake->sentence(),
            ],
            [
                'name' => "Night (8 PM to 10 PM)",
                'note' => $this->fake->sentence(),
            ],
        ];

        foreach ($dataContactTimes as $key => $dataContactTime) {
            if (DataContactTime::where('name', $dataContactTime['name'])->exists()) {
                continue;
            }
            DataContactTime::create($dataContactTime);
        }
    }

    /*
        Data contact time create method
        Author Mamun 
    **/
    public function dataEmpSizeCreate($tenant = [])
    {
        $dataEmpSizes = [
            [
                'name' => "Size 1 to 10",
                'note' => $this->fake->sentence(),
                'size' => 10,
            ],
            [
                'name' => "Size 11 to 50",
                'note' => $this->fake->sentence(),
                'size' => 50,
            ],
            [
                'name' => "Size 51 to 100",
                'note' => $this->fake->sentence(),
                'size' => 100,
            ],
            [
                'name' => "Size 101 to 200",
                'note' => $this->fake->sentence(),
                'size' => 200,
            ],

        ];
        foreach ($dataEmpSizes as $key => $dataEmpSize) {
            if (DataEmpSize::where('name', $dataEmpSize['name'])->exists()) {
                continue;
            }
            DataEmpSize::create($dataEmpSize);
        }
    }

    /*
        Start industry type create method
        Author Mamun 
    **/
    public function dataSourceCreate($tenant = [])
    {
        $leadSources = [
            [
                'name' => 'Facebook',
            ],
            [
                'name' => 'Youtube',
            ],
            [
                'name' => 'Instagram',
            ],
            [
                'name' => 'Google Ads',
            ],
            [
                'name' => 'Web',
            ],
            [
                'name' => 'Others',
            ],
            [
                'name' => 'Import',
            ],
            [
                'name' => 'None',
            ],
            [
                'name' => 'Referral',
            ],
        ];
        foreach ($leadSources as $key => $leadSource) {
            if (DataSource::where('name', $leadSource['name'])->exists()) {
                continue;
            }
            DataSource::create($leadSource);
        }
    }
    /*
        Start Lead stage create method
        Author Mamun 
    **/
    public function stageCreate($tenant = [])
    {
        $stages = [
            [
                'name' => 'Open - Not Contacted',
                'label' => 'Not Contacted',
                'type' => LEAD,
                'resolution_hours' => 72,
                'resolution_days' => 0,
                'order' => 2,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '1',
                'is_final_stage' => '0',
                'stage_percent' => '0'
            ],
            [
                'name' => 'Open - Attempted Contact',
                'label' => 'Attempted Contact',
                'type' => LEAD,
                'resolution_hours' => 0,
                'resolution_days' => 7,
                'order' => 3,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Open - Contacted',
                'label' => 'Contacted',
                'type' => LEAD,
                'resolution_hours' => 0,
                'resolution_days' => 5,
                'order' => 4,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '50'
            ],
            [
                'name' => 'Closed - Disqualified',
                'label' => 'Disqualified',
                'type' => LEAD,
                'resolution_hours' => 0,
                'resolution_days' => 0,
                'order' => 5,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '0'
            ],
            [
                'name' => 'Closed - Converted',
                'label' => 'Converted',
                'type' => LEAD,
                'resolution_hours' => 0,
                'resolution_days' => 0,
                'order' => 6,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '1',
                'stage_percent' => '100'
            ],

            [
                'name' => 'Choose new state',
                'label' => 'Choose new state',
                'type' => STATE,
                'order' => 9,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Open',
                'label' => 'Open',
                'type' => STATE,
                'order' => 10,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Own',
                'label' => 'Own',
                'type' => STATE,
                'order' => 11,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Lost',
                'label' => 'Lost',
                'type' => STATE,
                'order' => 12,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Suspended',
                'label' => 'Suspended',
                'type' => STATE,
                'order' => 13,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Abandoned',
                'label' => 'Abandoned',
                'type' => STATE,
                'order' => 14,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Not started',
                'label' => 'Pending',
                'type' => TASK,
                'order' => 15,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '1',
                'is_final_stage' => '0',
                'stage_percent' => '0'
            ],
            [
                'name' => 'In progress',
                'label' => 'Working',
                'type' => TASK,
                'order' => 16,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '50'
            ],
            [
                'name' => 'Completed',
                'label' => 'Done',
                'type' => TASK,
                'order' => 17,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '100'
            ],
            [
                'name' => 'Deferred',
                'label' => 'Delayed',
                'type' => TASK,
                'order' => 18,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '30'
            ],
            [
                'name' => 'Stopped',
                'label' => 'Canceled',
                'type' => TASK,
                'order' => 19,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '0'
            ],
            [
                'name' => 'Open - Prospecting',
                'label' => 'Prospecting',
                'type' => OPPORTUNITY,
                'order' => 20,
                'is_delete' => '1',
                'is_active' => '1',
                'is_default' => '1',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Open - Qualification',
                'label' => 'Qualification',
                'type' => OPPORTUNITY,
                'order' => 21,
                'is_delete' => '1',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '20'
            ],
            [
                'name' => 'Open - Needs analysis',
                'label' => 'Needs analysis',
                'type' => OPPORTUNITY,
                'order' => 22,
                'is_delete' => '1',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '30'
            ],
            [
                'name' => 'Open - Proposal',
                'label' => 'Proposal',
                'type' => OPPORTUNITY,
                'order' => 23,
                'is_delete' => '1',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '50'
            ],
            [
                'name' => 'Open - Negotiation',
                'label' => 'Negotiation',
                'type' => OPPORTUNITY,
                'order' => 24,
                'is_delete' => '1',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '70'
            ],
            [
                'name' => 'Closed - Won',
                'label' => 'Won',
                'type' => OPPORTUNITY,
                'order' => 25,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '1',
                'stage_percent' => '100'
            ],
            [
                'name' => 'Closed - Lost',
                'label' => 'Lost',
                'type' => OPPORTUNITY,
                'order' => 26,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '0'
            ],
            [
                'name' => 'Open - Not started',
                'label' => ' Not started',
                'type' => PROJECT,
                'order' => 27,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '1',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Inprogress-Plan ',
                'label' => 'Plan',
                'type' => PROJECT,
                'order' => 28,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Inprogress-Design ',
                'label' => 'Design',
                'type' => PROJECT,
                'order' => 28,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Inprogress-Develop ',
                'label' => 'Develop',
                'type' => PROJECT,
                'order' => 29,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Inprogress-Testing ',
                'label' => 'Testing',
                'type' => PROJECT,
                'order' => 30,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Closed - Completed',
                'label' => 'Completed',
                'type' => PROJECT,
                'order' => 31,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '1',
                'stage_percent' => '10'
            ],
            [
                'name' => 'Closed - Canceled',
                'label' => 'Canceled',
                'type' => PROJECT,
                'order' => 32,
                'is_delete' => '0',
                'is_active' => '1',
                'is_default' => '0',
                'is_final_stage' => '0',
                'stage_percent' => '10'
            ],


        ];

        foreach ($stages as $key => $stage) {
            if (Stage::where(['name' => $stage['name'], 'name' => $stage['type']])->exists()) {
                continue;
            }
            Stage::create($stage);
        }
    }

    /*
        Start Lead priority create method
        Author Mamun 
    **/
    public function dataPrioritiesCreate($tenant = [])
    {
        $leadPriorities = [
            [
                'name' => 'Low',
            ],
            [
                'name' => 'Medium',
            ],
            [
                'name' => 'High',
            ],

        ];
        foreach ($leadPriorities as $key => $leadPriority) {
            if (DataPriority::where('name', $leadPriority['name'])->exists()) {
                continue;
            }
            DataPriority::create($leadPriority);
        }
    }

    /*
    /*
        Start Lead rating create method
        Author Mamun 
    **/
    public function dataRatingCreate($tenant = [])
    {
        $leadRatings = [
            [
                'name' => 'A - Category',
                'rating' => 5,
            ],
            [
                'name' => 'B - Category',
                'rating' => 4,
            ],
            [
                'name' => 'C - Category',
                'rating' => 3,
            ],
            [
                'name' => 'D - Category',
                'rating' => 2,
            ],
            [
                'name' => 'E - Category',
                'rating' => 1,
            ],

        ];
        foreach ($leadRatings as $key => $leadRating) {
            if (DataRating::where('name', $leadRating['name'])->exists()) {
                continue;
            }
            DataRating::create($leadRating);
        }
    }

    /* Start permission create method
    Author Mamun
    **/
    public function permissionCreate()
    {
        $modules = Module::all();

        foreach ($modules as $module) {
            $moduleName = strtolower($module->name);
            $moduleId = $module->id;

            ## Define the permissions
            $permissions = [
                $moduleName . '-create',
                $moduleName . '-list',
                $moduleName . '-edit',
                $moduleName . '-delete',
            ];

            foreach ($permissions as $permissionName) {
                if (Permission::where('name', $permissionName)->exists()) {
                    continue;
                }
                Permission::create([
                    'module_id' => $moduleId,
                    'name' => $permissionName,
                    'guard_name' => 'web',
                ]);
            }

            $module = Module::where('name', 'Reports')->first();

            if ($module) {
                $moduleId = $module->id;

                $reportPermissions = [
                    'all-lead-report',
                    'lead-report-by-status',
                    'all-contact-report',
                    'all-task-report',
                    'all-opportunity-report',
                    'all-project-report',
                    'all-organization-report',
                    'user-activity-report',
                    'user-owner-associate-report',
                    'user-activity-log-report',
                    'all-lead-report-group',
                    'all-contact-report-group',
                    'all-task-report-group',
                    'all-opportunity-report-group',
                    'all-project-report-group',
                    'all-organizations-report-group',
                    'all-user-report-group',
                ];

                foreach ($reportPermissions as $reportPermission) {

                    if (!Permission::where('name', $reportPermission)->exists()) {

                        Permission::create([
                            'module_id' => $moduleId,
                            'name' => $reportPermission,
                            'guard_name' => 'web',
                        ]);
                    }
                }
            }
        }
    }

    ## End permission create method

    /**
     * Start profile create method
     * @author Mamun
     */
    public function profileCreate()
    {
        $users = User::with(['contactReference'])->all();
        foreach ($users as $key => $user) {
            Profile::create([
                'user_id' => $user->contactReference->first()->id,
                'tenant_id' => 'akij',
                'department_id' => Department::inRandomOrder()->value('id'),
                'office_location' => $this->fake->address,
                'working_hours' => (string) rand(1, 24),
            ]);
        }
    }
    ## End profile create method

    /*
    Assign role method
    Auth
    **/
    public function assignRole()
    {
        $user = User::orderBy('id')->first();
        $role = Role::orderBy('id')->first();

        if ($user && $role) {
            $user->assignRole($role->id);
        }
    }

    /*
       Tag create method
        Author Mamun 
    **/

    public function tagCreate()
    {
        $tagData = ['CRM', 'TASK', 'FOLLOW-UP', 'CONTACT'];
        foreach ($tagData as $key => $tag) {
            Tag::create(['name' => $tag]);
        }
    }

    /*
       Note create method
        Author Mamun 
    **/

    public function noteCreate()
    {
        for ($i = 0; $i < 5; $i++) {
            $title = $this->fake->words(2, true);
            $userId = Contact::inRandomOrder()->first()?->id;
            if (Note::where('title', $title)->exists()) {
                continue;
            }
            $noteData = [
                'title' => $title,
                'details' => $this->fake->sentence(12),
                'causer_id' => $userId,
                'owner_id' => $userId,
                'date_reminder' => Carbon::now(),
            ];
            $note = Note::create($noteData);
            if ($note) {
                $user = Contact::inRandomOrder()->first()?->id;
                $contactId = $this->usersContactReference($user);
                $note->associates()->attach($contactId);
            }
        }
    }


    public function leadCreate(): void
    {
        $faker = $this->fake;

        ## Build list of the last 12 months including current
        $endMonth = now()->startOfMonth();
        $startMonth = $endMonth->copy()->subMonths(11);
        $months = collect(range(0, 11))->map(fn($i) => $startMonth->copy()->addMonths($i));

        ## Preload related model IDs to minimize DB hits
        $stages = Stage::where('type', LEAD)->pluck('id')->all();
        $sources = DataSource::pluck('id')->all();
        $designations = DataDesignation::pluck('id')->all();
        $products = Product::pluck('id')->all();
        $ratings = DataRating::pluck('id')->all();
        $priorities = DataPriority::pluck('id')->all();
        $categories = DataCategory::where('type', INDUSTRY)->pluck('id')->all();
        $users = User::pluck('id')->all();
        $contacts = Contact::pluck('id')->all();
        $organizations = Organization::pluck('id')->all();
        $socialLinks = SocialLink::pluck('id')->all();
        $contactTimes = DataContactTime::pluck('id')->all();

        ## Sanity check
        if (empty($contacts)) {
            logger()->warning('⚠️ No contacts found — skipping lead creation.');
            return;
        }

        $today = Carbon::today();

        ## Iterate through each of the last 12 months
        foreach ($months as $monthDate) {
            $year = $monthDate->year;
            $month = $monthDate->month;
            ## Create random number of leads for this month minimum 10 maximum 20
            $length = random_int(10, 20);

            $maxDay = ($year == $today->year && $month == $today->month)
                ? $today->day
                : Carbon::create($year, $month)->daysInMonth;


            for ($i = 1; $i <= $length; $i++) {
                $userId = $faker->randomElement($contacts);

                $leadData = [
                    'creator_id' => $userId,
                    'owner_id' => $userId,
                    'unique_id' => _generateUniqueId('Lead', 'unique_id', LEAD),
                    'salutation' => rand(1, 4),
                    'first_name' => $faker->firstName(),
                    'last_name' => $faker->lastName(),
                    'nickname' => $faker->userName(),
                    'dob' => Carbon::now()->subYears(rand(20, 50)),
                    'email' => $faker->unique()->safeEmail(),
                    'telephone' => $faker->numerify('880-2-#######'),
                    'mobile_phone' => $faker->numerify('01#########'),
                    'alt_mobile_phone' => $faker->numerify('01#########'),
                    'fax' => $faker->numerify('880-2-#######'),
                    'website' => $faker->url(),
                    'details' => $faker->sentence(12),
                    'is_active' => (string) $faker->randomElement([0, 1]),
                    'icon' => '',
                    'preferred_contact_method' => 1,
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, $maxDay)),
                    'updated_at' => now(),
                ];

                $lead = Lead::create($leadData);

                if ($lead) {
                    ## Attach stage
                    $stage = $faker->randomElement($stages);
                    $this->doAttachWithParentModel(
                        parentModel: $lead,
                        childModel: $stage,
                        relationalMethod: 'stages',
                        additionalInputs: ['causer_id' => $faker->randomElement($contacts)]
                    );

                    ## Address
                    $lead->address()->create([
                        'state' => $faker->state(),
                        'post_code' => $faker->postcode(),
                        'street' => $faker->streetAddress(),
                    ]);

                    ## Many-to-many relationships
                    $lead->sources()->sync([$faker->randomElement($sources)]);
                    $lead->designations()->sync([$faker->randomElement($designations)]);
                    $lead->products()->sync([$faker->randomElement($products)]);
                    $lead->ratings()->sync([$faker->randomElement($ratings)]);
                    $lead->priorities()->sync([$faker->randomElement($priorities)]);
                    $lead->categories()->sync([$faker->randomElement($categories)]);

                    ## Associates (link via user contact)
                    if (!empty($users)) {
                        $user = $faker->randomElement($users);
                        $contactId = $this->usersContactReference($user);
                        if ($contactId) {
                            $lead->associates()->sync([$contactId]);
                        }
                    }

                    ## Organization
                    if (!empty($organizations)) {
                        $lead->organizations()->sync([$faker->randomElement($organizations)]);
                    }

                    ## Social links
                    if (!empty($socialLinks)) {
                        $lead->socials()->sync([
                            $faker->randomElement($socialLinks) => ['url' => $faker->url()],
                        ]);
                    }

                    ## Preferable contact time
                    if (!empty($contactTimes)) {
                        $lead->preferableTimes()->sync([$faker->randomElement($contactTimes)]);
                    }
                }
            }

            logger()->info("✅ 10 leads created for {$monthDate->format('M Y')}");
        }

        logger()->info('🎯 Lead creation completed for the last 12 months including current month.');
    }



    /*
       Task create method
        Author Mamun 
    **/

    public function taskCreate()
    {
        $endMonth = now()->startOfMonth();
        $startMonth = $endMonth->copy()->subMonths(11);
        $months = collect(range(0, 11))
            ->map(fn($i) => $startMonth->copy()->addMonths($i));

        $pattern = [3, 4, 2];

        foreach ($months as $index => $monthDate) {
            $year = $monthDate->year;
            $month = $monthDate->month;

            $today = Carbon::today();

            $maxDay = ($year == $today->year && $month == $today->month)
                ? $today->day
                : Carbon::create($year, $month)->daysInMonth;

            $length = $pattern[$index % count($pattern)];
            for ($i = 0; $i < $length; $i++) {
                $userId = Contact::inRandomOrder()->first()?->id;
                $taskData = [
                    'causer_id' => $userId,
                    'owner_id' => $userId,
                    'name' => $this->fake->words(2, true),
                    'details' => $this->fake->sentence(12),
                    'date_start' => Carbon::now(),
                    'date_due' => Carbon::now()->addMinutes(10),
                    'date_reminder' => Carbon::now()->addMinutes(8),
                    'progress_percent' => rand(1, 9),
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, $maxDay)),
                    'updated_at' => now(),
                ];
                $task = Task::create($taskData);
                if ($task) {

                    $user = User::inRandomOrder()->first()?->id;
                    $contactId = $this->usersContactReference($user);
                    $task->associates()->attach($contactId);

                    $stage = Stage::where('type', TASK)
                        ->where('name', '!=', 'Completed')
                        ->inRandomOrder()
                        ->first()?->id;

                    $this->doAttachWithParentModel(parentModel: $task, childModel: $stage, relationalMethod: 'stages', additionalInputs: ['causer_id' => $contactId]);

                    $category = DataCategory::where(['type' => 'TASK'])->inRandomOrder()->first()?->id;
                    $task->categories()->attach($category);

                    $priority = DataPriority::inRandomOrder()->first()?->id;
                    $task->priorities()->attach($priority);

                    $lead = Lead::inRandomOrder()->first();

                    $this->doAttachWithParentModel(syncType: 'attach', parentModel: $lead, relationalMethod: 'tasks', childModel: $task);
                }
            }
        }
    }

    /*
       opportunity create method
        Author Mamun 
    **/

    public function opportunityCreate()
    {
        $endMonth = now()->startOfMonth();
        $startMonth = $endMonth->copy()->subMonths(11);
        $months = collect(range(0, 11))
            ->map(fn($i) => $startMonth->copy()->addMonths($i));

        $pattern = [3, 4, 2];

        foreach ($months as $index => $monthDate) {
            $year = $monthDate->year;
            $month = $monthDate->month;

            $today = Carbon::today();

            $maxDay = ($year == $today->year && $month == $today->month)
                ? $today->day
                : Carbon::create($year, $month)->daysInMonth;

            $length = $pattern[$index % count($pattern)];

            for ($i = 0; $i < $length; $i++) {
                $userId = Contact::inRandomOrder()->first()?->id;
                $date_forecast = Carbon::now()->addDays(15);
                $date_close = Carbon::now()->addDays(30);
                $opportunityData = [
                    'causer_id' => $userId,
                    'owner_id' => $userId,
                    'name' => $this->fake->words(2, true),
                    'details' => $this->fake->sentence(12),
                    'date_forecast' => $date_forecast,
                    'date_close' => $date_close,
                    'progress_percent' => rand(10, 20),
                    'amount' => rand(10000, 99999),
                    'currency' => '৳',
                    'is_active' => rand(0, 1),
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, $maxDay)),
                    'updated_at' => now(),
                ];
                $opportunity = Opportunity::create($opportunityData);
                if ($opportunity) {

                    $user = User::inRandomOrder()->first()?->id;
                    $contactId = $this->usersContactReference($user);
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $contactId, relationalMethod: 'associates');

                    $organization = Organization::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $organization, relationalMethod: 'organizations');

                    $category = DataCategory::where('type', OPPORTUNITY)->inRandomOrder()->first()?->id;

                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $category, relationalMethod: 'categories');

                    $tag = Tag::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $tag, relationalMethod: 'tags');

                    $stage = Stage::where('type', OPPORTUNITY)->inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $stage, relationalMethod: 'stages', additionalInputs: ['causer_id' => Contact::value('id')]);

                    $product = Product::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $product, relationalMethod: 'products');

                    $task = Task::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $task, relationalMethod: 'tasks');

                    $note = Note::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $note, relationalMethod: 'notes');

                    $tag = Tag::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $tag, relationalMethod: 'tags');

                    $source = DataSource::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $source, relationalMethod: 'sources');

                    ## Do attach with lead model 1 Dec 2025 <sakil.diu.cse@gmail.com>
                    if ($i % 2 === 0) {
                        $lead = Lead::inRandomOrder()->first();
                        $this->doAttachWithParentModel(parentModel: $lead, childModel: $opportunity, relationalMethod: 'opportunities');
                    }
                }
            }
        }
    }

    /*
       Email Setting create method

        Author Mamun 
    **/
    public function emailSettingCreate()
    {
        DataEmailSetting::create([
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'password' => $this->fake->password(12),
            'encryption' => 'tls',
            'user_name' => $this->fake->userName,
            'mail_from_address' => $this->fake->safeEmail,
        ]);
    }

    /*
       project create method

        Author Mamun 
    **/
    public function projectCreate()
    {
        $endMonth = now()->startOfMonth();
        $startMonth = $endMonth->copy()->subMonths(11);
        $months = collect(range(0, 11))
            ->map(fn($i) => $startMonth->copy()->addMonths($i));

        $pattern = [3, 4, 2];

        foreach ($months as $index => $monthDate) {
            $year = $monthDate->year;
            $month = $monthDate->month;

            $today = Carbon::today();

            $maxDay = ($year == $today->year && $month == $today->month)
                ? $today->day
                : Carbon::create($year, $month)->daysInMonth;

            $length = $pattern[$index % count($pattern)];

            for ($i = 0; $i < $length; $i++) {
                $userId = Contact::inRandomOrder()->value('id');

                $project = Project::create([
                    'causer_id' => $userId,
                    'owner_id'  => $userId,
                    'name'      => $this->fake->words(2, true),
                    'details'   => $this->fake->sentence(12),
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, $maxDay)),
                    'updated_at' => now(),
                ]);


                $user = User::inRandomOrder()->first()?->id;
                $contactId = $this->usersContactReference($user);
                $this->doAttachWithParentModel(parentModel: $project, childModel: $contactId, relationalMethod: 'associates');

                $stage = Stage::where('type', PROJECT)->inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $project, childModel: $stage, relationalMethod: 'stages', additionalInputs: ['causer_id' => $contactId]);

                $tag = Tag::inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $project, childModel: $tag, relationalMethod: 'tags');

                $category = DataCategory::where('type', PROJECT)->inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $project, childModel: $category, relationalMethod: 'categories');
            }
        }
    }

    /*
       Designation create method
        Author Mamun 
    **/
    public function designationCreate()
    {
        for ($i = 0; $i < 10; $i++) {
            DataDesignation::create([
                'name' => $this->fake->jobTitle()
            ]);
        }
    }

    /*
       Notification event create method
        Author Mamun 
    **/
    public function notificationEventCreate()
    {
        $notificationEvents = [
            [
                'name' => 'Lead Create',
                'description' => 'Create event'
            ],
            [
                'name' => 'Lead Update',
                'description' => 'Update event'
            ],
            [
                'name' => 'Lead Delete',
                'description' => 'Delete event'
            ],
            [
                'name' => 'Opportunity Create',
                'description' => 'Opportunity create event'
            ]
        ];
        foreach ($notificationEvents as $key => $notificationEvent) {
            NotificationEvent::create($notificationEvent);
        }
    }

    public function createTenantDefaultData()
    {
        $this->moduleCreate();
        $this->permissionCreate();
        $this->departmentCreate();
        $this->assignRole();
        $this->dataCategoryCreate();
        $this->productCreate();
        $this->dataSourceCreate();
        $this->stageCreate();
        $this->dataPrioritiesCreate();
        $this->dataRatingCreate();
        $this->designationCreate();
        $this->socialLinkCreate();
        $this->dataContactTimeCreate();
        $this->dataEmpSizeCreate();
        $this->revenueCreate();
        $this->tagCreate();
        $this->organizationCreate();
        $this->leadCreate();
        $this->taskCreate();
        $this->noteCreate();
        $this->opportunityCreate();
        $this->projectCreate();
        $this->notificationEventCreate();
    }




    /**
     * Seed fake leads for the last 12 months including the current month.
     *
     * Automatically spans across years (e.g. Dec 2024 → Nov 2025),
     * creating 10 leads per month using Faker data and existing
     * relationship models for a realistic dataset.
     *
     * @return void
     *
     * @author
     * Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function qcLeadCreate($modelData): void
    {

        Tenancy::initialize('ihelpkl');

        $faker = $this->fake;

        $minimumModelData = 50;

        $originalOpportunityData  = (10000 / 200000) * $modelData;
        $originalOrganizationData = (5000 / 200000) * $modelData;
        $originalProjectData      = (7000 / 200000) * $modelData;
        $originalTaskData         = (300000 / 200000) * $modelData;


        $opportunityCount  = max((int) round($originalOpportunityData),  $minimumModelData);
        $organizationCount = max((int) round($originalOrganizationData), $minimumModelData);
        $projectCount      = max((int) round($originalProjectData),      $minimumModelData);
        $taskCount         = max((int) round($originalTaskData),         $minimumModelData);


        ## Preload related model IDs to minimize DB hits
        $stages = Stage::where('type', LEAD)->pluck('id')->all();
        $sources = DataSource::pluck('id')->all();
        $designations = DataDesignation::pluck('id')->all();
        $products = Product::pluck('id')->all();
        $ratings = DataRating::pluck('id')->all();
        $priorities = DataPriority::pluck('id')->all();
        $categories = DataCategory::where('type', INDUSTRY)->pluck('id')->all();
        $users = User::pluck('id')->all();
        $contacts = Contact::pluck('id')->all();
        $organizations = Organization::pluck('id')->all();
        $socialLinks = SocialLink::pluck('id')->all();
        $contactTimes = DataContactTime::pluck('id')->all();

        ## Sanity check
        if (empty($contacts)) {
            logger()->warning('No contacts found — skipping lead creation.');
            return;
        }

        $monthlyLeads = $this->qcMonthWiseDataDivide($modelData);
        if (empty($monthlyLeads)) return;

        foreach ($monthlyLeads as $data) {
            $year = $data['year'];
            $month = $data['month'];

            for ($i = 1; $i <= $data['count']; $i++) {
                $userId = $faker->randomElement($contacts);

                $leadData = [
                    'creator_id' => $userId,
                    'owner_id' => $userId,
                    'unique_id' => _generateUniqueId('Lead', 'unique_id', LEAD),
                    'salutation' => rand(1, 4),
                    'first_name' => $faker->firstName(),
                    'last_name' => $faker->lastName(),
                    'nickname' => $faker->userName(),
                    'dob' => Carbon::now()->subYears(rand(20, 50)),
                    'email' => $faker->unique()->safeEmail(),
                    'telephone' => $faker->numerify('880-2-#######'),
                    'mobile_phone' => $faker->numerify('01#########'),
                    'alt_mobile_phone' => $faker->numerify('01#########'),
                    'fax' => $faker->numerify('880-2-#######'),
                    'website' => $faker->url(),
                    'details' => $faker->sentence(12),
                    'is_active' => (string) $faker->randomElement([0, 1]),
                    'icon' => '',
                    'preferred_contact_method' => 1,
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, 28)),
                    'updated_at' => now(),
                ];

                $lead = Lead::create($leadData);

                if ($lead) {
                    ## Attach stage
                    $stage = $faker->randomElement($stages);
                    $this->doAttachWithParentModel(
                        parentModel: $lead,
                        childModel: $stage,
                        relationalMethod: 'stages',
                        additionalInputs: ['causer_id' => $faker->randomElement($contacts)]
                    );

                    ## Address
                    $lead->address()->create([
                        'state' => $faker->state(),
                        'post_code' => $faker->postcode(),
                        'street' => $faker->streetAddress(),
                    ]);

                    ## Many-to-many relationships
                    $lead->sources()->sync([$faker->randomElement($sources)]);
                    $lead->designations()->sync([$faker->randomElement($designations)]);
                    $lead->products()->sync([$faker->randomElement($products)]);
                    $lead->ratings()->sync([$faker->randomElement($ratings)]);
                    $lead->priorities()->sync([$faker->randomElement($priorities)]);
                    $lead->categories()->sync([$faker->randomElement($categories)]);

                    ## Associates (link via user contact)
                    if (!empty($users)) {
                        $user = $faker->randomElement($users);
                        $contactId = $this->usersContactReference($user);
                        if ($contactId) {
                            $lead->associates()->sync([$contactId]);
                        }
                    }

                    ## Organization
                    if (!empty($organizations)) {
                        $lead->organizations()->sync([$faker->randomElement($organizations)]);
                    }

                    ## Social links
                    if (!empty($socialLinks)) {
                        $lead->socials()->sync([
                            $faker->randomElement($socialLinks) => ['url' => $faker->url()],
                        ]);
                    }

                    ## Preferable contact time
                    if (!empty($contactTimes)) {
                        $lead->preferableTimes()->sync([$faker->randomElement($contactTimes)]);
                    }
                }
            }
        }

        $this->qcContactCreate();
        $this->qcOrganizationCreate($organizationCount);
        $this->qcProjectCreate($projectCount);
        $this->qcTaskCreate($taskCount);
        $this->qcOpportunityCreate($opportunityCount);

        logger()->info('Lead creation completed for the last 12 months including current month.');
    }

    public function qcBulkLeadCreate($modelData)
    {
        Tenancy::initialize('ihelpkl');
        $faker = $this->fake;
        $now = Carbon::now();
        $chunkSize = 5000;
        $contacts = Contact::pluck('id')->all();
        $allUniqueIds = $this->generateBatchUniqueIds($modelData);

        for ($i = 0; $i < $modelData; $i += $chunkSize) {
            $leads = [];
            for ($j = 0; $j < $chunkSize && ($i + $j) < $modelData; $j++) {
                $createdAt = Carbon::now()->subDays(rand(0, 365));
                $index = $i + $j;
                $userId = $faker->randomElement($contacts);
                $leads[] = [
                    'id' => (string) Str::ulid(),
                    'creator_id' => $userId,
                    'owner_id' => $userId,
                    'unique_id' => $allUniqueIds[$index],
                    'nickname' => 'Lead ' . ($index + 1),
                    'email' => 'lead' . ($index + 1) . '@example.com',
                    'created_at' => $createdAt,
                    'updated_at' => $now,
                ];
            }

            DB::table('leads')->insert($leads);
            $this->bulkTaskCreate($leads);
        }
    }

    public function bulkTaskCreate($chunkData)
    {
        $minimumModelData = 50;
        $originalTaskData = (300000 / 200000) * count($chunkData);
        $taskCount = max((int) round($originalTaskData), $minimumModelData);
        $createdAt = Carbon::now()->subDays(rand(0, 365));
        $contacts = Contact::pluck('id')->all();
        $faker = $this->fake;

        $taskData = [];
        $taskIds = []; 

        for ($i = 0; $i < $taskCount; $i++) {
            $userId = $faker->randomElement($contacts);
            $taskId = (string) Str::ulid();

            $taskData[] = [
                'id' => $taskId,
                'causer_id' => $userId,
                'owner_id' => $userId,
                'name' => $faker->words(2, true),
                'details' => $faker->sentence(12),
                'date_start' => Carbon::now(),
                'date_due' => Carbon::now()->addMinutes(10),
                'date_reminder' => Carbon::now()->addMinutes(8),
                'progress_percent' => rand(1, 9),
                'is_sample' => true,
                'created_at' => $createdAt,
                'updated_at' => now(),
            ];

            $taskIds[] = $taskId;
        }

        collect($taskData)->chunk(1000)->each(function ($chunk) {
            DB::table('tasks')->insert($chunk->toArray());
        });


        $leadIds = is_array($chunkData)
            ? collect($chunkData)->pluck('id')->all()
            : $chunkData->pluck('id')->all();
        $this->attachTasksToLeads($leadIds, $taskIds);
    }

    /**
     * Distribute tasks among leads efficiently
     */
    private function attachTasksToLeads(array $taskableIds, array $taskIds): void
    {
        $faker = $this->fake;
        $pivotData = [];
        $now = now();

        foreach ($taskableIds as $taskableId) {
            $numberOfTasks = rand(1, min(5, count($taskIds))); 
            $selectedTaskIds = $faker->randomElements($taskIds, $numberOfTasks);

            foreach ($selectedTaskIds as $taskId) {
                $pivotData[] = [
                    'taskable_id' => $taskableId,
                    'task_id' => $taskId,
                    'taskable_type' => Lead::class,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        ## Bulk insert pivot relationships
        collect($pivotData)->chunk(1000)->each(function ($chunk) {
            DB::table('taskables')->insert($chunk->toArray());
        });
    }

    ## Helper method to generate all IDs at once
    private function generateBatchUniqueIds(int $count): array
    {
        return DB::transaction(function () use ($count) {

            $prefix = 'LEAD';
            $length = 8;

            ## Get current MAX
            $maxNumber = Lead::where('unique_id', 'like', "{$prefix}-%")
                ->lockForUpdate()
                ->selectRaw("MAX(CAST(SUBSTRING_INDEX(unique_id, '-', -1) AS UNSIGNED)) as max_num")
                ->value('max_num') ?? 0;

            $ids = [];
            for ($i = 1; $i <= $count; $i++) {
                $ids[] = sprintf('%s-%0' . $length . 'd', $prefix, $maxNumber + $i);
            }

            return $ids;
        });
    }


    /**
     *  qc contact create
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function qcContactCreate()
    {
        for ($i = 0; $i < 10; $i++) {
            $title = $this->fake->unique()->words(2, true);

            if (Contact::where('nickname', $title)->exists()) {
                continue;
            }

            $contactData = [
                'nickname' => $title,
                'causer_id' => null,
                'owner_id' => null,
                'salutation' => rand(1, 4),
                'mobile_number' => $this->fake->numerify('01#########'),
                'email' => $this->fake->unique()->safeEmail(),
                'dob' => Carbon::now()->subYears(rand(18, 60))->format('Y-m-d'),
                'details' => $this->fake->sentence(12),
                'is_parent_user_deleted' => false,
                'is_delete' => true,
            ];
            $contact = Contact::create($contactData);
            if ($contact) {

                $contact->address()->Create([
                    'type' => SHIPPING,
                    'country' => 'Bangladesh',
                    'city' => 'Dhaka',
                    'post_code' => $this->fake->postcode(),
                    'street' => $this->fake->streetAddress(),
                ]);

                $tag = Tag::inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $contact, childModel: $tag, relationalMethod: 'tags');

                $socialLink = SocialLink::inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $contact, childModel: $socialLink, relationalMethod: 'socials', additionalInputs: ['url' => $this->fake->url()]);
            }
        }
    }

    /**
     * qc organization create
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function qcOrganizationCreate($modelData = 12)
    {
        $monthlyOrganizations = $this->qcMonthWiseDataDivide($modelData);
        if (empty($monthlyOrganizations)) return;

        foreach ($monthlyOrganizations as $data) {
            $year = $data['year'];
            $month = $data['month'];

            for ($i = 0; $i < $data['count']; $i++) {
                $baseName = ucfirst($this->fake->words(2, true));
                $suffix   = $this->fake->companySuffix();
                $uniqueNo = rand(100, 9999);

                $name = "{$baseName} {$suffix} {$uniqueNo}";

                ## Extra safety (very low chance of hit now)
                if (Organization::where('name', $name)->exists()) {
                    continue;
                }

                $userId = Contact::inRandomOrder()->value('id');

                $organization = Organization::create([
                    'name'         => $name,
                    'causer_id'    => $userId,
                    'owner_id'     => $userId,
                    'mobile_number' => $this->fake->numerify('01#########'),
                    'website'      => $this->fake->url(),
                    'details'      => $this->fake->sentence(12),
                    'is_sample'    => true,
                    'created_at' => Carbon::create($year, $month, rand(1, 28)),
                    'updated_at'   => now(),
                ]);

                if (!$organization) {
                    continue;
                }

                foreach ([SHIPPING, BILLING] as $type) {
                    $country = SystemCountry::inRandomOrder()->first();

                    $organization->address()->create([
                        'type'      => $type,
                        'country'   => $country?->name,
                        'city'      => $country?->cities?->first()?->name,
                        'post_code' => $this->fake->postcode(),
                        'street'    => $this->fake->streetAddress(),
                    ]);
                }

                if ($tagId = Tag::inRandomOrder()->value('id')) {
                    $this->doAttachWithParentModel(
                        parentModel: $organization,
                        childModel: $tagId,
                        relationalMethod: 'tags'
                    );
                }

                if ($userId = User::inRandomOrder()->value('id')) {
                    $contactId = $this->usersContactReference($userId);

                    $this->doAttachWithParentModel(
                        parentModel: $organization,
                        childModel: $contactId,
                        relationalMethod: 'associates'
                    );
                }


                if ($socialId = SocialLink::inRandomOrder()->value('id')) {
                    $this->doAttachWithParentModel(
                        parentModel: $organization,
                        childModel: $socialId,
                        relationalMethod: 'socials',
                        additionalInputs: ['url' => $this->fake->url()]
                    );
                }
            }
        }
    }

    /*
       qc project create method

        Author Mamun 
    **/
    public function qcProjectCreate($modelData = 12)
    {
        $monthlyProject = $this->qcMonthWiseDataDivide($modelData);
        if (empty($monthlyProject)) return;

        foreach ($monthlyProject as $data) {
            $year = $data['year'];
            $month = $data['month'];

            for ($i = 0; $i < $data['count']; $i++) {
                $userId = Contact::inRandomOrder()->value('id');

                $project = Project::create([
                    'causer_id' => $userId,
                    'owner_id'  => $userId,
                    'name'      => $this->fake->words(2, true),
                    'details'   => $this->fake->sentence(12),
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, 28)),
                    'updated_at' => now(),
                ]);


                $user = User::inRandomOrder()->first()?->id;
                $contactId = $this->usersContactReference($user);
                $this->doAttachWithParentModel(parentModel: $project, childModel: $contactId, relationalMethod: 'associates');

                $stage = Stage::where('type', PROJECT)->inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $project, childModel: $stage, relationalMethod: 'stages', additionalInputs: ['causer_id' => $contactId]);

                $tag = Tag::inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $project, childModel: $tag, relationalMethod: 'tags');

                $category = DataCategory::where('type', PROJECT)->inRandomOrder()->first()?->id;
                $this->doAttachWithParentModel(parentModel: $project, childModel: $category, relationalMethod: 'categories');
            }
        }
    }


    /*
       qc Task create method
        Author Mamun 
    **/

    public function qcTaskCreate($modelData = 12)
    {
        $monthlyTask = $this->qcMonthWiseDataDivide($modelData);
        if (empty($monthlyTask)) return;

        foreach ($monthlyTask as $data) {
            $year = $data['year'];
            $month = $data['month'];

            for ($i = 0; $i < $data['count']; $i++) {
                $userId = Contact::inRandomOrder()->first()?->id;
                $taskData = [
                    'causer_id' => $userId,
                    'owner_id' => $userId,
                    'name' => $this->fake->words(2, true),
                    'details' => $this->fake->sentence(12),
                    'date_start' => Carbon::now(),
                    'date_due' => Carbon::now()->addMinutes(10),
                    'date_reminder' => Carbon::now()->addMinutes(8),
                    'progress_percent' => rand(1, 9),
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, 28)),
                    'updated_at' => now(),
                ];
                $task = Task::create($taskData);
                if ($task) {

                    $user = User::inRandomOrder()->first()?->id;
                    $contactId = $this->usersContactReference($user);
                    $task->associates()->attach($contactId);

                    $stage = Stage::where('type', TASK)
                        ->where('name', '!=', 'Completed')
                        ->inRandomOrder()
                        ->first()?->id;

                    $this->doAttachWithParentModel(parentModel: $task, childModel: $stage, relationalMethod: 'stages', additionalInputs: ['causer_id' => $contactId]);

                    $category = DataCategory::where(['type' => 'TASK'])->inRandomOrder()->first()?->id;
                    $task->categories()->attach($category);

                    $priority = DataPriority::inRandomOrder()->first()?->id;
                    $task->priorities()->attach($priority);

                    $lead = Lead::inRandomOrder()->first();

                    $this->doAttachWithParentModel(syncType: 'attach', parentModel: $lead, relationalMethod: 'tasks', childModel: $task);
                }
            }
        }
    }

    /*
       qc opportunity create method
        Author Mamun 
    **/

    public function qcOpportunityCreate($modelData = 50)
    {
        $monthlyOpportunity = $this->qcMonthWiseDataDivide($modelData);
        if (empty($monthlyOpportunity)) return;

        foreach ($monthlyOpportunity as $data) {
            $year = $data['year'];
            $month = $data['month'];

            for ($i = 0; $i < $data['count']; $i++) {
                $userId = Contact::inRandomOrder()->first()?->id;
                $date_forecast = Carbon::now()->addDays(15);
                $date_close = Carbon::now()->addDays(30);
                $opportunityData = [
                    'causer_id' => $userId,
                    'owner_id' => $userId,
                    'name' => $this->fake->words(2, true),
                    'details' => $this->fake->sentence(12),
                    'date_forecast' => $date_forecast,
                    'date_close' => $date_close,
                    'progress_percent' => rand(10, 20),
                    'amount' => rand(10000, 99999),
                    'currency' => '৳',
                    'is_active' => rand(0, 1),
                    'is_sample' => true,
                    'created_at' => Carbon::create($year, $month, rand(1, 28)),
                    'updated_at' => now(),
                ];
                $opportunity = Opportunity::create($opportunityData);
                if ($opportunity) {

                    // $user = User::inRandomOrder()->first()?->id;
                    // $contactId = $this->usersContactReference($user);
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $userId, relationalMethod: 'associates');

                    $organization = Organization::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $organization, relationalMethod: 'organizations');

                    $category = DataCategory::where('type', OPPORTUNITY)->inRandomOrder()->first()?->id;

                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $category, relationalMethod: 'categories');

                    $tag = Tag::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $tag, relationalMethod: 'tags');

                    $stage = Stage::where('type', OPPORTUNITY)->inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $stage, relationalMethod: 'stages', additionalInputs: ['causer_id' => Contact::value('id')]);

                    $product = Product::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $product, relationalMethod: 'products');

                    $task = Task::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $task, relationalMethod: 'tasks');

                    $note = Note::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $note, relationalMethod: 'notes');

                    $tag = Tag::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $tag, relationalMethod: 'tags');

                    $source = DataSource::inRandomOrder()->first()?->id;
                    $this->doAttachWithParentModel(parentModel: $opportunity, childModel: $source, relationalMethod: 'sources');

                    ## Do attach with lead model 1 Dec 2025 <sakil.diu.cse@gmail.com>
                    if ($i % 2 === 0) {
                        $lead = Lead::inRandomOrder()->first();
                        $this->doAttachWithParentModel(parentModel: $lead, childModel: $opportunity, relationalMethod: 'opportunities');
                    }
                }
            }
        }
    }

    public function qcMonthWiseDataDivide($modelData)
    {
        if (empty($modelData) || $modelData < 50) {
            return [];
        }
        $endMonth = now()->startOfMonth();
        $startMonth = $endMonth->copy()->subMonths(11);
        $months = collect(range(0, 11))
            ->map(fn($i) => $startMonth->copy()->addMonths($i));

        $totalOpportunity = $modelData;
        $monthsCount = count($months);

        $remaining = $totalOpportunity;
        $monthlyData = [];


        foreach ($months as $index => $monthDate) {

            $monthsLeft = $monthsCount - $index - 1;

            ## Minimum: 0 (or 1 if you want at least 1 per month)
            $min = 1;

            ## Maximum allowed so remaining months can still get something
            $max = $remaining - ($monthsLeft * $min);

            ## Random value for this month
            if ($monthsLeft === 0) {
                $count = $remaining;
            } else {
                $count = random_int($min, max($min, $max));
            }

            $monthlyData[] = [
                'year'  => $monthDate->year,
                'month' => $monthDate->month,
                'count' => $count,
            ];

            $remaining -= $count;
        }
        return $monthlyData;
    }
}
