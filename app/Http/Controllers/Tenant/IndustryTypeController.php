<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantIndustryTypeService;
use App\Http\Controllers\BaseTenantController;
class IndustryTypeController extends BaseTenantController
{
    /***
     * IndustryTypeController constructor.
     *
     * Initializes the TenantIndustryTypeService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantModuleService $tenantIndustryTypeService
     */
    public function __construct(private TenantIndustryTypeService $tenantIndustryTypeService)
    {
        /**
         * @author Mamun Hossen <mamunhossen149191@gmail.com>
         */

        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantIndustryTypeService->getRouteNames(),
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('industry-types-list');
        try {
            $filterData = ['orderType' => 'asc', 'isPaginate' => 0, ...request()->all()];
            $industryTypeList =  $this->tenantIndustryTypeService->resourceList($filterData);
            return Inertia::render(
                'Tenant/IndustryType/IndustryTypeListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'industryTypeList' => $industryTypeList,
                        'filterOptions' => request()->all(),
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
       
    }

    /**
     * Resource create form show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        return Inertia::render(
            'Tenant/IndustryType/IndustryTypeCreatePage',
            array_merge(
                $this->data,
                ['tenant' => tenant('id'), 'categoryType' => _getCategoryType()],
            )
        );
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantIndustryTypeService->doResourceValidation($request->all());
        try {
            if (! $this->tenantIndustryTypeService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage()?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource edit form
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($industryType)
    {
        _hasPermissionOrAbort('industry-types-edit');
        try {
            $categories = $this->tenantIndustryTypeService->resourceEditData($industryType);
            return Inertia::render(
                'Tenant/IndustryType/IndustryTypeEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'industryTypes' =>  $categories,
                    'categoryTypes' => _getCategoryType()
                ]
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
       
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $industryType)
    {
        // return $request->all();
        $validatedData = $this->tenantIndustryTypeService->doResourceValidation([...$request->all(), 'id' => $industryType]);
        try {
         
            if (!$this->tenantIndustryTypeService->doResourceUpdate($request->all(), $industryType)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
            
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($industryType)
    {
        _hasPermissionOrAbort('industry-types-delete');
        try {
            if (!$this->tenantIndustryTypeService->doResourceDelete($industryType)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function industryTypeStatusChange()
    {
        try {
            if (!$this->tenantIndustryTypeService->industryTypeStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
