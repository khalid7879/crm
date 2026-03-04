<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Product;
use App\Models\Tenant\Project;
use App\Traits\TenantCommonTrait;
use App\Models\Tenant\Opportunity;
use App\Services\BaseModelService;
use App\Models\Tenant\Organization;
use App\Models\Tenant\Productable;
use Illuminate\Support\Facades\Validator;
use App\Services\Tenant\TenantIndustryTypeService;

class TenantProductService extends BaseModelService
{
    use TenantCommonTrait;

    public function __construct(Product $model, private TenantIndustryTypeService $tenantIndustryTypeService)
    { {
            parent::__construct($model);
        }
    }

    /**
     * Return predefined product routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'productsList'   => 'tenant.products.index',
            'productsCreate' => 'tenant.products.create',
            'productsStore'  => 'tenant.products.store',
            'productsEdit'   => 'tenant.products.edit',
            'productsUpdate' => 'tenant.products.update',
            'productsDelete' => 'tenant.products.destroy',
            'productsStatusChange' => 'tenant.products.status.change',
            'productsShow'     => 'tenant.products.show',
            'productsLinkData' => 'tenant.products.link.data',
            'addProductsLink'  => 'tenant.products.add.link',
            'productsUnLink'   => 'tenant.products.unlink',
        ];
    }

    /**
     * resource store and update validation
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:products,name' : 'unique:products,name,' . $inputs['id'], 'min:3', 'max:50'],
                'category' => ['required'],
                'price' => [
                    'nullable',
                    'numeric',
                    'regex:/^\d{1,8}(\.\d{1,2})?$/',
                ],

            ],
            [
                'name.required' => __('Name can not be empty'),
                'name.min' => __('Minimum character length :min', [':min']),
                'name.max' => __('Maximum character length :max', [':max']),
                'name.unique' => __('The name has already been taken'),
                'category.required' => __('Category can not be empty'),
                'price.regex' => __('Price must be up to 8 digits and can contain up to 2 decimal places'),


            ]
        )->validate();
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceList($requests = []): mixed
    {
        try {
            return $this->getPaginatedModels([...$requests, 'with' => ['categories']]);
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceCreateData(): mixed
    {
        try {
            $data = [];
            $categories =  $this->tenantIndustryTypeService->getModelsByColumn('type', INDUSTRY);
            $data['categories'] = $categories;
            return $data;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * resource store process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs): mixed
    {
        try {
            $product = [
                'name' => $inputs['name'],
                'price' => $inputs['price'] ?? 0,
            ];
            $product =  Product::create($product);

            $category = $inputs['category'] ?? '';
            if ($category) {
                $product->categories()->sync($category);
            }

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource edit data
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($productId): mixed
    {
        try {
            $data = [];

            $products = $this->getSingleModel($productId, ['categories']);
            $categories = $this->tenantIndustryTypeService->getModelsByColumn('type', INDUSTRY);

            $data['products'] = $products;
            $data['categories'] = $categories;

            return $data;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource delete
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($productId): mixed
    {
        try {
            $product = $this->getSingleModel($productId);
            if (empty($product)) throw new Exception(INVALID_REQUEST);

            $product->delete();
            return true;
        } catch (\Exception $e) {
            throw new Exception($e);
        }
    }

    /**
     * Resource Update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $product): mixed
    {
        try {

            $product = $this->getSingleModel($product);
            if (empty($product)) throw new Exception(INVALID_REQUEST);

            $product->name = $inputs['name'];
            $product->price = $inputs['price'] ?? 0;
            $product->save();

            $category = $inputs['category'] ?? '';
            if ($category) {
                $product->categories()->sync($category);
            }
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
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
            $productId = $inputs['product'];
            $product = $this->getSingleModel($productId);
            if (empty($product)) throw new Exception(INVALID_REQUEST);

            $product->is_active = $product->is_active == '1' ? '0' : '1';
            $product->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    public function getProductsLinkData($searchText = '')
    {
        try {

            return $this->getModelData(
                columns: ['id', 'name', 'price', 'created_at'],
                limit: 10,
                orderBy: 'created_at',
                orderType: 'DESC',
                searchText: $searchText,
                fromAction: PRODUCT
            )->map(function ($item) {
                return [
                    'label' => $item->name,
                    'value' => $item->id,
                    'price' => $item->price,
                ];
            });
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function addProductsLink(array $inputs)
    {
        try {
            $relatedToId   = $inputs['related_to_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;
            $productId     = $inputs['product_id'] ?? null;
            $customizedValue     = $inputs['price'] ?? 0;

            // dd($inputs);
            if (empty($productId)) throw new Exception('Product is empty !');

            $model = $this->model::select('id', 'price')->findOrFail($productId);

            if (empty($model)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            if (empty($relatedToType || $relatedToId)) {
                throw new Exception('Related to type or id is empty !');
            }
         
            if ($relatedToType && $relatedToId) {
                $allTypes = [
                    PROJECT,
                    ORGANIZATION,
                    LEAD,
                    OPPORTUNITY,
                ];

                if (!in_array($relatedToType, $allTypes)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

                $parentModel = $this->getParentModel($relatedToType, $relatedToId);
                if (empty($parentModel)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

                if ($parentModel) {
                    $this->doAttachWithParentModel(
                        parentModel: $parentModel,
                        childModel: $model->id,
                        relationalMethod: 'products',
                        additionalInputs: ['face_value' => $model->price, 'customized_value' => $customizedValue],
                        syncType: 'attach'
                    );
                    $parentModel->touch();
                    return true;
                }
            }
            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function productUnlink($inputs)
    {
        try {
            $baseId = $inputs['base_id'] ?? null;
            $productId = $inputs['product_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;

            if (!$relatedToType) throw new Exception('Related to type is empty');
            if (!$baseId) throw new Exception('Base ID is empty');
            if (!$productId) throw new Exception('Product ID is empty');

            $relatedToTypes = [
                PROJECT,
                ORGANIZATION,
                LEAD,
                OPPORTUNITY,
            ];
            
            if (!in_array($relatedToType, $relatedToTypes)) {
                throw new Exception('Related to type not found');
            }

            // dd($inputs);

            $baseModelMap = [
                PROJECT      => Project::class,
                LEAD         => Lead::class,
                OPPORTUNITY  => Opportunity::class,
                ORGANIZATION => Organization::class,
            ];

            $baseModel = $baseModelMap[$relatedToType]::find($baseId);

            if (!$baseModel) throw new Exception('Base model not found');

            $result = Productable::where('product_id', $productId)
                ->where('productable_id', $baseId)
                ->first();

            if ($result) {
                $result->delete();
                $baseModel->touch();
                return true;
            }

            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }
}
