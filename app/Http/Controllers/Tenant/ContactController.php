<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Inertia;
use App\Models\Tenant\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use App\Services\Tenant\ContactModelService;
use App\Http\Controllers\BaseTenantController;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ContactController extends BaseTenantController
{
    /**
     * Class instance
     *
     * @param ContactModelService $taskModelService
     */
    public function __construct(private ContactModelService $contactModelService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->contactModelService->getRouteNames()
        );
    }


    /**
     * Resource list
     * 
     *  @author Mamun Hossen
     */
    public function index()
    {
        _hasPermissionOrAbort('contacts-list');
        // return request()->all();
        $dataList =  $this->contactModelService->resourceList(request()->all());


        ## Load all required dropdown/preload dependencies. `fromActivity` ensures activity-based dependency filtering (if required)
        $dependencies = $this->contactModelService->getModelDependencies(fromActivity: CONTACT, neededData: [USER, SALUTATION, TAG, SOCIAL_LINK, DATA_DESIGNATION, COUNTRY, CITY]);

        return Inertia::render(
            'Tenant/Contact/ContactListPage',
            array_merge(
                $this->data,
                $dependencies,
                [
                    'tenant' => tenant('id'),
                    'dataList' => $dataList,
                    'filterOptions' => request()->all(),
                ]
            )
        );
    }

    /**
     * Store a newly created contact resource.
     *
     * This method validates the incoming request data, creates a new contact record,
     * attaches associates (including the owner), and optionally changes the stage to 
     * 
     *
     * @return \Illuminate\Http\RedirectResponse
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function store()
    {
        // dd(request()->all());
        $validatedData = $this->contactModelService
            ->doResourceValidation(request()->all());
        // dd($validatedData);

        ## Format social links
        if (request()->filled('social_links')) {
            $validatedData['social_links'] = $this->contactModelService
                ->removeEmptyValuesToStore(request('social_links'));
        }
        try {
            ## Assign owner id as associate if associates exist
            if (request()->filled('associates')) {
                $validatedData['associates'] = array_merge(
                    request('associates'),
                    [request('owner_id')]
                );
            }

            $newModel = $this->contactModelService
                ->doResourceStore($validatedData);


            if (!$newModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * get cities by country id
     * 
     *  @author Mamun Hossen
     */
    public function citiesByCountryId()
    {
        try {
            $dataList = $this->contactModelService->getCitiesByCountryId(request()->all());

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'cities' => $dataList]
            ]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Display the specified contact with relational data.
     *
     * Returns a JSON response containing task details if found.
     * On failure, returns a JSON error response.
     *
     * @param  \App\Models\Tenant\Contact  $contact  The contact instance resolved via route model binding
     * @param  bool $isFormattedShort  Set and get what type of data structure this method returns 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception If task retrieval fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    // : JsonResponse
    public function show(Contact $contact): JsonResponse
    {
        try {
            if (!$contact) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->contactModelService->getModelFormattedData($contact) : $this->contactModelService->getModelFormattedDataAll($contact);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }


            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Contact details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Contact not found',
                'data'    => [],
            ], 404);
        }
    }


    /**
     * Show the form for editing the specified opportunity.
     *
     * @param  string|int  $opportunity
     * @return string|\Inertia\Response
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function edit($contact)
    {
        _hasPermissionOrAbort('contacts-edit');
        ## Temporary maintenance placeholder
        try {
            $model = $this->contactModelService->contactEditRelatedData($contact);
            // dd($model);
            return Inertia::render('Tenant/Contact/ContactEditPage', [
                ...$this->data,
                'tenant' => tenant('id'),
                ...$model,

            ]);
        } catch (ModelNotFoundException $th) {
            ## Redirect back with a user-friendly flash message
            return redirect()->route($this->data['routeNames']['contactsList'], tenant('id'))->with([
                'toastResponse' => ['type' => 'error', 'message' => CONTACT_NOT_FOUND]
            ]);
        }
    }

    /**
     * Update an existing contact resource.
     *
     * Validates the request data, assigns associates (including the owner),
     * and delegates persistence to the OrganizationModelService.
     *
     * @param  int|string  $contact  The contact ID or identifier to update
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception  When the update process fails
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function update($contact): RedirectResponse
    {
        // dd($contact, request()->all());
        // ## Validate incoming data
        $validatedData = $this->contactModelService->doResourceValidation(request()->all());

        ## Format social links
        if (request()->filled('social_links')) {
            $validatedData['social_links'] = $this->contactModelService
                ->removeEmptyValuesToStore(request('social_links'));
        }

        ## Assign owner as an associate if associates exist
        if (request()->filled('associates')) {
            $validatedData['associates'] = [
                ...request('associates'),
                request('owner_id'),
            ];
        }
        // dd($validatedData['associates']);

        ## Attach organization ID for update
        if (!empty($contact)) {
            $validatedData['id'] = $contact;
        }


        try {
            $updatedModel = $this->contactModelService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Delete a task resource.
     *
     * Attempts to delete the given task by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Contact  $task  The task instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Contact $contact): RedirectResponse
    {
        try {
            $model = $this->contactModelService->getSingleModel($contact);
            if(empty($model)) throw new Exception('Contact not found !');

            if(!$model->is_delete) throw new Exception('You can not delete this contact.');
            if (!$this->contactModelService->deleteModelById($contact)) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData()
    {
        _hasPermissionOrAbort('contacts-delete');
        try {
            $deleteData = $this->contactModelService->resourceDeleteDependencyData(request()->all());

            return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'deleteData' => $deleteData]]);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     * * @author Mamun Hossen
     */
    public function resourceDeleteWithDependency()
    {
        _hasPermissionOrAbort('contacts-delete');
        try {
            // dd(request()->all());
            $this->contactModelService->resourceDeleteWithDependency(request()->all());
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Get a list of leads formatted as label-value pairs for UI selection.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLabelValueFormattedList(): JsonResponse
    {
        try {
            $result = $this->contactModelService->getLabelValueFormattedList(request('search'));
            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'data'    => $result
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'code'    => 404,
                'message' => $th->getMessage(),
                'data'    => []
            ]);
        }
    }

    /**
     * Fetch contact link data with optional search filtering.
     *
     * This method retrieves contact link data by delegating the request
     * to the ContactModelService. A search keyword may be passed via
     * the request to filter the results.
     *
     * On success, it returns a standardized JSON response containing
     * the fetched data. If any exception occurs, a common error response
     * is returned.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Throwable
     */
    public function contactsLinkData()
    {
        try {
            $result = $this->contactModelService->getContactsLinkData(request('search'));

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'data'    => $result,
            ]);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Link a contact to a lead, opportunity, organization, or project.
     *
     * This method accepts request data and delegates the contact-linking
     * process to the ContactModelService. It supports linking contacts
     * with different entity types such as leads, opportunities,
     * organizations, and projects.
     *
     * On successful linking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function addContactLink()
    {
        try {
            $result = $this->contactModelService->addContactLink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Contact linked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Unlink a contact from a lead, opportunity, organization, or project.
     *
     * This method removes an existing association between a contact
     * and a related entity such as a lead, opportunity, organization,
     * or project. The unlinking logic is handled by the ContactModelService
     * using the provided request data.
     *
     * On successful unlinking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function contactUnlink()
    {
        try {
            $result = $this->contactModelService->contactUnlink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Contact Unlinked Successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
