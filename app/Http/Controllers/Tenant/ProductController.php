<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Tenant\Product;
use Illuminate\Http\JsonResponse;
use App\Services\Tenant\TenantProductService;
use App\Http\Controllers\BaseTenantController;

class ProductController extends BaseTenantController
{

    /***
     * ProductController constructor.
     *
     * Initializes the TenantProductService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantProductService $tenantProductService
     */
    public function __construct(private TenantProductService $tenantProductService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantProductService->getRouteNames()
        );
    }

    /**
     * Resource list
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index(Request $request)
    {
        _hasPermissionOrAbort('products-list');
        try {
            $products = $this->tenantProductService->resourceList($request->all());
            return Inertia::render(
                'Tenant/Product/ProductListPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'products' => $products,
                    'filterOptions' => $request->all(),
                ]

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
        _hasPermissionOrAbort('products-create');
        try {
            $data = $this->tenantProductService->resourceCreateData();
            return Inertia::render('Tenant/Product/ProductCreatePage',
             [
                ...$this->data,
                 'tenant' => tenant('id'),
                'categories' => $data['categories']
            ]);
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantProductService->doResourceValidation($request->all());
        // dd($validatedData);
        try {
            if (! $this->tenantProductService->doResourceStore($validatedData)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
          
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }



    /**
     * Resource edit form 
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($product)
    {
        _hasPermissionOrAbort('products-edit');
        try {
            $data = $this->tenantProductService->resourceEditData($product);

            return Inertia::render(
                'Tenant/Product/ProductEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'products' =>  $data['products'],
                    'categories' =>  $data['categories']
                ]
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
       
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $product)
    {
        $validatedData = $this->tenantProductService->doResourceValidation([...$request->all(), 'id' => $product]);
        try {
            if (! $this->tenantProductService->doResourceUpdate($request->all(), $product)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
         
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($product)
    {
        _hasPermissionOrAbort('products-delete');
        try {
            if (! $this->tenantProductService->doResourceDelete($product)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function productStatusChange()
    {
        try {
            if (! $this->tenantProductService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Fetch product link data with optional search filtering.
     *
     * This method retrieves product link data by delegating the request
     * to the tenantProductService. A search keyword may be passed via
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
    public function productsLinkData()
    {
        try {
            $result = $this->tenantProductService->getProductsLinkData(request('search'));

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
     * Link a project to a lead, opportunity, organization.
     *
     * This method accepts request data and delegates the project-linking
     * process to the ContactModelService. It supports linking projects
     * with different entity types such as leads, opportunities,
     * organizations.
     *
     * On successful linking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function addProductsLink()
    {
        try {
            $result = $this->tenantProductService->addProductsLink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Product linked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Unlink a product from a lead, opportunity, organization.
     *
     * This method removes an existing association between a product
     * and a related entity such as a lead, opportunity, organization,
     * The unlinking logic is handled by the TenantProductService
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
    public function productsUnLink()
    {
        try {
            $result = $this->tenantProductService->productUnlink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Product unlinked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
