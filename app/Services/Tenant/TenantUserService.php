<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\User;
use App\Models\CentralUser;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Note;
use App\Models\Tenant\Task;
use App\Models\Tenant\Contact;
use App\Traits\TenantCommonTrait;
use App\Models\Tenant\Opportunity;
use App\Services\BaseModelService;
use App\Models\Tenant\Organization;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use App\Jobs\TenantRegisterEmailVerifyTokenJob;
use Illuminate\Validation\Rule;

class TenantUserService extends BaseModelService
{
    use TenantCommonTrait;
    /**
     * Class instance
     *
     * @param User $model
     * @param TenantRoleService $tenantRoleService
     * @param TenantDepartmentService $tenantDepartmentService
     */
    public function __construct(User $model, private TenantRoleService $tenantRoleService, private TenantDepartmentService $tenantDepartmentService)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined user routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'usersList'   => 'tenant.users.index',
            'usersCreate' => 'tenant.users.create',
            'usersStore'  => 'tenant.users.store',
            'usersDelete' => 'tenant.users.destroy',
            'usersEdit'   => 'tenant.users.edit',
            'usersUpdate' => 'tenant.users.update',
            'usersStatusChange' => 'tenant.users.status.change',
            'userWiseModel' => 'tenant.user.wise.model',
            'userReassignOrDelete' => 'tenant.user.resignOr.delete',
        ];
    }

    /**
     * @method doResourceValidation
     *
     * @description
     * Handles resource (user) registration and update validation.
     * This component validates core user attributes such as name, email,
     * role, department, and activation status. Email uniqueness is handled
     * dynamically for create and update operations.
     *
     * When password validation is enabled, it enforces strong password rules
     * including length, case sensitivity, numeric, and special characters.
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     * @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(
        array $inputs,
        string $id = '',
        bool $isValidatePassword = false
    ) {

        /**
         * Base validation rules
         */
        $rules = [
            'name' => ['required', 'string', 'min:5', 'max:50'],
            'email' => [
                'required',
                'email',
                'min:5',
                'max:50',
                Rule::unique('users', 'email')->ignore($id, 'id'),
            ],
            'role' => ['required'],
            'department' => ['nullable', 'string'],
            'is_active' => ['nullable', 'in:0,1,2'],
        ];

        /**
         * Conditional password validation
         */
        if ($isValidatePassword) {
            $rules['password'] = [
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).+$/',
            ];
        }

        return Validator::make(
            $inputs,
            $rules,
            [
                'name.required' => __('Name can not be empty'),
                'name.min' => __('Minimum character length :min', [':min']),
                'name.max' => __('Maximum character length :max', [':max']),

                'email.required' => __('Must be a valid email'),
                'email.email' => __('Must be a valid email'),
                'email.min' => __('Minimum character length :min', [':min']),
                'email.max' => __('Maximum character length :max', [':max']),
                'email.unique' => __('The email has already been taken'),

                'role.required' => __('Please select a role'),

                'password.required' => __('Password is required'),
                'password.min' => __('Password must be at least :min characters'),
                'password.max' => __('Password must not exceed :max characters'),
                'password.regex' => __(
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                ),
            ]
        )->validate();
    }



    /**
     * Resource registration
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceRegistration(array $inputs)
    {
        try {
            ## Central user
            $centralUser = Auth::user();
            $department  = $inputs['department'] ?? null;
            $emailVerifyToken = _generateUniqueEmailVerifyToken("App\Models\User");
            if (empty($emailVerifyToken)) {
                throw new Exception('Verify token is empty');
            }
            $userData = [
                'name' => $inputs['name'],
                'email' => $inputs['email'],
                // 'password' => Hash::make($inputs['password']),
                'global_id' => $centralUser->global_id, ## Using central user ID as reference
            ];

            $user = User::create($userData);

            $userData['email_verify_token'] =  $emailVerifyToken;
            $userData['email_verify_start_at'] = now();

            CentralUser::create($userData);

            if ($department) {
                $user->department()->sync($department);
            }
            // dd($emailVerifyToken, $userData);

            if ($user) {

                $contact = Contact::create(['first_name' => '', 'email' => $user->email, 'nickname' => $user->name]);

                $contact->causer_id = $contact->id;
                $contact->owner_id = $contact->id;
                $contact->save();

                $user->contactUser()->sync($contact->id);
                $user->assignRole($inputs['role']);

                /** why this is required */
                // $this->assignDefaultPermissionsToTenantUserRole($inputs['role']);


                dispatch((new TenantRegisterEmailVerifyTokenJob([
                    'subject' => 'The introduction to the notification',
                    'to' => $inputs['email'],
                    'link' => route('tenant.register.verify', [
                        'type' => encrypt('USER'),
                        'email' => encrypt($inputs['email'])
                    ]),
                    'emailVerifyToken' => $emailVerifyToken,
                    'remarks' => 'Thank you for using our application!',
                ]))->onQueue('high'));
                return true;
            }
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), ' Line: ' . $th->getLine());
        }
    }


    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceList($requests): mixed
    {
        try {
            return $this->getPaginatedModels($requests);
        } catch (Throwable $th) {
            throw new Exception($th);
        }
    }



    /**
     * Resource edit data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($userId): mixed
    {
        try {
            $data = [];
            $user = $this->getSingleModel($userId, ['roles', 'department']);

            $roles = $this->tenantRoleService->getAllModels();

            $departments = $this->tenantDepartmentService->getAllModels();

            $data['users'] = $user;
            $data['roles'] = $roles;
            $data['departments'] = $departments;
            return $data;
        } catch (Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function userDelete($userId): mixed
    {
        try {
            $tenantUser = User::findOrFail($userId);

            ## Will query the central database now
            $centralUser = CentralUser::where('email', $tenantUser->email)->first();
            if ($centralUser) {
                $centralUser->delete();
            }
            $tenantUser->delete();
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => 'User deleted successfully']
            ]);
        } catch (Exception $e) {
            throw new Exception(COMMON_MSG);
        }
    }

    /**
     * @method dorResourceUpdate
     * Resource Update Method 
     *
     * @description
     * This method performs a synchronized update between a tenant user and their corresponding central user record.
     * It ensures complete data consistency across both systems by updating core profile fields (name, email, is_active),
     * optionally updating the password on both sides when provided, syncing assigned roles, and managing department relationships.
     * Both user models are saved individually, and timestamps are touched to trigger cache invalidation where applicable.
     * The operation is wrapped in a try-catch block to properly propagate any exceptions.
     *
     * All original functionality is preserved while improving code readability, structure, and maintainability.
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     * @author Mamun <mamunhossen149191@gmail.com>
     */
    public function dorResourceUpdate(array $inputs, $user): mixed
    {
        try {
        ## Retrieve the tenant user - will throw ModelNotFoundException if not found
            /** @var \App\Models\User $tenantUser */
            $tenantUser = User::findOrFail($user);

            ## Extract department input (may be null)
            $department = $inputs['department'] ?? null;

        ## Locate the matching central user by current tenant email
            /** @var \App\Models\CentralUser|null $centralUser */
            $centralUser = CentralUser::where('email', $tenantUser->email)->first();

            ## Only proceed with central updates if a matching central user exists
            if ($centralUser) {
                ## Update shared fields on central user
                $centralUser->name      = $inputs['name'];
                $centralUser->email     = $inputs['email'];
                $centralUser->is_active = $inputs['is_active'];

                ## Mirror the same fields on tenant user
                $tenantUser->name       = $inputs['name'];
                $tenantUser->email      = $inputs['email'];
                $tenantUser->is_active  = $inputs['is_active'];

                ## Handle optional password update - hash once and apply to both records
                if (!empty($inputs['password'])) {
                    $hashedPassword = Hash::make($inputs['password']);
                    $centralUser->password = $hashedPassword;
                    $tenantUser->password  = $hashedPassword;
                }

                ## Persist both records
                $centralUser->save();
                $tenantUser->save();

                ## Sync role assignments (Spatie/Laravel Permission assumed)
                $tenantUser->syncRoles($inputs['role']);

                ## Sync department relationships if provided
                if ($department !== null) {
                    $tenantUser->department()->sync($department);
                }

                ## Touch both records to update timestamps (useful for cache busting)
                $tenantUser->touch();
                $centralUser->touch();
            }

            return true;
        } catch (Throwable $th) {
            ## Re-throw with full context for better debugging
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }


    /**
     * Resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange(array $inputs): mixed
    {

        try {
            ## Central user
            $userId = $inputs['userId'] ?? null;

            if (!$userId) {
                throw new Exception(__('User ID is required.'));
            }

            $user = User::findOrFail($userId);

            if (!$user) {
                throw new Exception(__('User not found'));
            }
            $centralUser = CentralUser::where('email', $user->email)->first();
            if (empty($centralUser)) {
                throw new Exception(__('User not found'));
            }
            if (empty($centralUser->email_verified_at)) {
                throw new Exception(__('User not verified yet'));
            }

            # Toggle is_active status
            $user->is_active = $user->is_active == '1' ? '0' : '1';

            if ($centralUser) {
                $centralUser->is_active = $user->is_active;
                $centralUser->save();
                $user->save();
            }
            return true;
        } catch (Throwable $th) {
            throw new Exception(
                $th->getMessage(),
                $th->getCode(),
                $th
            );
        }
    }

    /**
     * Get user-wise model data (associates and owners summary).
     *
     * @param  array $inputs
     * @return array
     * @throws Exception
     */
    public function userWiseModel($inputs)
    {
        try {
            $id = $inputs['user'];

            $userInfo = $this->model->with([
                'contactReference' => function ($query) {
                    return $query->withCount([
                        'leads',
                        'opportunity',
                        'tasks',
                        'notes',
                        'organizations',
                        'contacts',
                        'leadOwner',
                        'opportunityOwner',
                        'taskOwner',
                        'noteOwner',
                        'organizationOwner',
                        'contactOwner'
                    ]);
                }
            ])
                ->find($id);

            $referenceData =  @$userInfo->contactReference[0];

            $allUser  = $this->getAllModels();

            $userData['associate'] = [];
            $userData['owner']     = [];

            ## Build Associate Data (related by association)

            if (!empty($referenceData->leads_count)) {
                $userData['associate']['lead'] = [
                    'label' => 'Lead associate',
                    'title' => 'Lead',
                    'labelValue' => $referenceData->leads_count,
                    'name' => 'leadUser',
                    'method' => 'handleLeadChange',
                    'value' => 'selectedLead',
                ];
            }
            if (!empty($referenceData->opportunity_count)) {
                $userData['associate']['opportunity'] = [
                    'label' => 'Opportunity associate',
                    'title' => 'Opportunity',
                    'labelValue' => $referenceData->opportunity_count,
                    'name' => 'opportunityUser',
                    'method' => 'handleOpportunityChange',
                    'value' => 'selectedOpportunity',
                ];
            }
            if (!empty($referenceData->tasks_count)) {
                $userData['associate']['task'] = [
                    'label' => 'Task associate',
                    'title' => 'Task',
                    'labelValue' => $referenceData->tasks_count,
                    'name' => 'taskUser',
                    'method' => 'handleTaskChange',
                    'value' => 'selectedTask',
                ];
            }
            if (!empty($referenceData->note_count)) {
                $userData['associate']['note'] = [
                    'label' => 'Note associate',
                    'labelValue' => $referenceData->note_count,
                    'title' => 'Note',
                    'name' => 'noteUser',
                    'method' => 'handleNoteChange',
                    'value' => 'selectedNote',
                ];
            }
            if (!empty($referenceData->organizations_count)) {
                $userData['associate']['organization'] = [
                    'label' => 'Organization associate',
                    'labelValue' => $referenceData->organizations_count,
                    'title' => 'Organization',
                    'name' => 'organizationUser',
                    'method' => 'handleOrganizationChange',
                    'value' => 'selectedOrganization',
                ];
            }
            if (!empty($referenceData->contacts_count)) {
                $userData['associate']['contact'] = [
                    'label' => 'Contact associate',
                    'labelValue' => $referenceData->organizations_count,
                    'title' => 'Contact',
                    'name' => 'contactUser',
                    'method' => 'handleContactChange',
                    'value' => 'selectedContact',
                ];
            }

            ## Build Owner Data (records owned by the user)

            if (!empty($referenceData->lead_owner_count)) {
                $userData['owner']['lead'] = [
                    'label' => 'Lead owner',
                    'labelValue' => $referenceData->lead_owner_count,
                    'title' => 'Lead',
                    'name' => 'ownerLeadUser',
                    'method' => 'handleOwnerLeadChange',
                    'value' => 'selectedOwnerLead',
                ];
            }
            if (!empty($referenceData->opportunity_owner_count)) {
                $userData['owner']['opportunity'] = [
                    'label' => 'Opportunity owner',
                    'labelValue' => $referenceData->opportunity_owner_count,
                    'title' => 'Opportunity',
                    'name' => 'ownerOpportunityUser',
                    'method' => 'handleOwnerOpportunityChange',
                    'value' => 'selectedOwnerOpportunity',
                ];
            }
            if (!empty($referenceData->task_owner_count)) {
                $userData['owner']['task'] = [
                    'label' => 'Task owner',
                    'labelValue' => $referenceData->task_owner_count,
                    'title' => 'Task',
                    'name' => 'ownerTaskUser',
                    'method' => 'handleOwnerTaskChange',
                    'value' => 'selectedOwnerTask',
                ];
            }
            if (!empty($referenceData->note_owner_count)) {
                $userData['owner']['note'] = [
                    'label' => 'Note owner',
                    'labelValue' => $referenceData->note_owner_count,
                    'title' => 'Note',
                    'name' => 'ownerNoteUser',
                    'method' => 'handleOwnerNoteChange',
                    'value' => 'selectedOwnerNote',
                ];
            }
            if (!empty($referenceData->organization_owner_count)) {
                $userData['owner']['organization'] = [
                    'label' => 'Organization owner',
                    'labelValue' => $referenceData->organization_owner_count,
                    'title' => 'Organization',
                    'name' => 'ownerOrganizationUser',
                    'method' => 'handleOwnerOrganizationChange',
                    'value' => 'selectedOwnerOrganization',
                ];
            }
            if (!empty($referenceData->contact_owner_count)) {
                $userData['owner']['contact'] = [
                    'label' => 'Contact owner',
                    'labelValue' => $referenceData->contact_owner_count,
                    'title' => 'Contact',
                    'name' => 'ownerContactUser',
                    'method' => 'handleOwnerContactChange',
                    'value' => 'selectedOwnerContact',
                ];
            }


            $userData['user']     = $allUser;
            $userData['result']   = true;
            $userData['userId']   = $id;
            $userData['contactId'] = @$referenceData->id;
            $userData['userName'] = $userInfo->name;

            return $userData;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Reassign or delete a user and its related models
     *
     * @param array $requestData
     * @return \Illuminate\Http\RedirectResponse
     * @throws Exception
     */
    public function userReassignOrDelete($requestData)
    {
        try {

            $contactId = $requestData['contactId'] ?? null;
            $userId = $requestData['userId'] ?? null;

            ## Associate Reassign (non-owner relationships)

            $noteUser         = $requestData['noteUser'] ?? null;
            $leadUser         = $requestData['leadUser'] ?? null;
            $taskUser         = $requestData['taskUser'] ?? null;
            $opportunityUser  = $requestData['opportunityUser'] ?? null;
            $userContact      = $requestData['contactUser'] ?? null;
            $organizationUser = $requestData['organizationUser'] ?? null;

            ## Fetch contacts with relation
            $contactUsers = $this->getAllModels(with: ['contactUser']);

            $contacts = ['DONTREASSIGN' => 'DONTREASSIGN'];
            foreach ($contactUsers as $user) {
                foreach ($user->contactUser as $contact) {
                    $contacts[$user->id] = $contact->id;
                }
            }

            ## Define mapping (relation => new user id)

            $relations = [
                'leads'        => $contacts[$leadUser]        ?? null,
                'tasks'        => $contacts[$taskUser]        ?? null,
                'notes'         => $contacts[$noteUser]        ?? null,
                'opportunity'  => $contacts[$opportunityUser] ?? null,
                'contacts'     => $contacts[$userContact]     ?? null,
                'organization' => $contacts[$organizationUser] ?? null,
            ];

            ## Load only needed relations
            $userData = $this->getSingleModel($userId, [
                'contactReference.leads',
                'contactReference.tasks',
                'contactReference.notes',
                'contactReference.opportunity',
                'contactReference.contacts',
                'contactReference.organization',
            ]);

            if ($userData) {
                foreach ($userData->contactReference as $key => $contactRef) {
                    foreach ($relations as $relation => $newUser) {
                        if (!empty($contactRef->$relation) && $newUser && $newUser !== 'DONTREASSIGN') {
                            foreach ($contactRef->$relation as $key => $item) {
                                $item->associates()->sync([$newUser]);
                            }
                        }
                    }
                }
            }

            ## Owner Update (direct owner_id fields)

            $ownerLeadUser         = $requestData['ownerLeadUser'] ?? null;
            $ownerOpportunityUser  = $requestData['ownerOpportunityUser'] ?? null;
            $ownerTaskUser         = $requestData['ownerTaskUser'] ?? null;
            $ownerNoteUser         = $requestData['ownerNoteUser'] ?? null;
            $ownerOrganizationUser = $requestData['ownerOrganizationUser'] ?? null;
            $ownerContactUser      = $requestData['ownerContactUser'] ?? null;


            if ($ownerLeadUser) {
                $this->reassignOrDelete(Lead::class, $contacts[$ownerLeadUser], $contactId);
            }

            if ($ownerOpportunityUser) {
                $this->reassignOrDelete(Opportunity::class, $contacts[$ownerOpportunityUser], $contactId);
            }

            if ($ownerTaskUser) {
                $this->reassignOrDelete(Task::class,  $contacts[$ownerTaskUser], $contactId);
            }

            if ($ownerNoteUser) {
                $this->reassignOrDelete(Note::class, $contacts[$ownerNoteUser], $contactId);
            }

            if ($ownerOrganizationUser) {
                $this->reassignOrDelete(Organization::class, $contacts[$ownerOrganizationUser], $contactId);
            }

            if ($ownerContactUser) {
                $this->reassignOrDelete(Contact::class, $contacts[$ownerContactUser], $contactId);
            }

            ## Finally delete the user itself

            $this->deleteModelById($userId);

            return true;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Reassigns or deletes related records for a given model.
     *
     * @param string $model      The Eloquent model class (e.g., Lead::class, Task::class)
     * @param mixed  $ownerUser  The new owner user ID, or 'DONTREASSIGN' for deletion
     * @param int    $userId     The current user ID whose records should be reassigned or deleted
     *
     * @return void
     */
    protected function reassignOrDelete($model, $ownerUser, $contactId)
    {
        $records = $model::where('owner_id', $contactId)->get();
        /*
        * If new owner is provided (not DONTREASSIGN):
        *  - Update owner_id with the new user's ID
        *  - Save changes for each record
        */
        if ($ownerUser !== 'DONTREASSIGN') {
            foreach ($records as $record) {
                $record->owner_id = $ownerUser;
                $record->save();
            }
        }
    }
}
