<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\SocialLink;
use App\Services\BaseModelService;

class TenantSocialLinkService extends BaseModelService
{
    public function __construct(SocialLink $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined social link routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'socialLinksList' => 'tenant.social-links.index',
            'socialLinksCreate' => 'tenant.social-links.create',
            'socialLinksStore' => 'tenant.social-links.store',
            'socialLinksEdit' => 'tenant.social-links.edit',
            'socialLinksUpdate' => 'tenant.social-links.update',
            'socialLinksDelete' => 'tenant.social-links.destroy',
            'socialLinksStatusChange' => 'tenant.social-links.status.change',
            'socialLinksOrderChange' => 'tenant.social-links.order.change',
        ];
    }

    /**
     * User registration validation
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'socialLink' => ['required', !isset($inputs['id']) ? 'unique:social_links,name' : 'unique:social_links,name,' . $inputs['id'], 'min:3', 'max:50'],
            ],
            [
                'socialLink.required' => __('Name can not be empty'),
                'socialLink.min' => __('Minimum character length :min', [':min']),
                'socialLink.max' => __('Maximum character length :max', [':max']),
                'socialLink.unique' => __('The name has already been taken'),

            ]
        )->validate();
    }

    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs): mixed
    {

        try {
            $socialLinks = _socialLinks();
            $icon = '';
            $socialLink = '';
            foreach ($socialLinks as $item) {
                if ($item['value'] == $inputs['socialLink']) {
                    $icon = $item['icon'];
                    $socialLink =  $item['label'];
                    break;
                }
            }
            $maxOrder = SocialLink::max('order');
            $socialLink = [
                'name'  => $socialLink,
                'icon'  => $icon,
                'order' => $maxOrder ? $maxOrder + 1 : 2,
            ];

            $resource = SocialLink::create($socialLink);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
        return true;
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceList($requests): mixed
    {
        try {
            $socialLink =  $this->getPaginatedModels($requests);
            $result = _addOrderStatus($socialLink);
            return $result;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource edit data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($socialLinkId): mixed
    {
        try {
            $socialLink = $this->getSingleModel($socialLinkId);
            return $socialLink;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceDelete($id): mixed
    {
        try {
            $resource = SocialLink::findOrFail($id);
            if (empty($resource)) throw new Exception(INVALID_REQUEST);
            $resource->delete();

            return true;
        } catch (\Exception $e) {
            throw new Exception($e);
        }
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $socialLink): mixed
    {
        try {
            $socialLink = SocialLink::findOrFail($socialLink);
            if (empty($socialLink)) throw new Exception(INVALID_REQUEST);
            $socialLink->name = $inputs['name'];
            $socialLink->icon = $inputs['icon'] ?? '';
            $socialLink->save();
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
            $socialLinkId = $inputs['socialLinkId'];
            $socialLink = $this->getSingleModel($socialLinkId);
            if (empty($socialLink)) throw new Exception(INVALID_REQUEST);

            $socialLink->is_active = $socialLink->is_active == '1' ? '0' : '1';
            $socialLink->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource order change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceOrderChange($request): mixed
    {
        try {
            $id   = $request['id'] ?? null;
            $type = $request['type'] ?? '';

            if (!$id || !in_array($type, [UPPER, DOWN])) {
                throw new \Exception(INVALID_REQUEST);
            }

            $socialLink = $this->getSingleModel($id);
            if (!$socialLink) {
                throw new \Exception(INVALID_REQUEST);
            }

            $currentOrder = (int) $socialLink->order;

            ## Find the nearest neighbor depending on type
            $neighbor = $type === UPPER
                ? SocialLink::where('order', '<', $currentOrder)->orderBy('order', 'desc')->first()
                : SocialLink::where('order', '>', $currentOrder)->orderBy('order', 'asc')->first();

            if (!$neighbor) {
                throw new \Exception('No neighbor found');
            }

            ## Swap the orders
            [$socialLink->order, $neighbor->order] = [$neighbor->order, $socialLink->order];

            $socialLink->save();
            $neighbor->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }



    /**
     * Format resources by keys (primary key - id)
     * Key as array index and other props as values
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     * @return array
     */
    public function formatByKeys($model = null): array
    {
        $models = $this->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'isActive' => true]);

        $result = !empty($models) ? collect($models)
            ->sortBy(fn($item) => (int)$item['order'])
            ->mapWithKeys(function ($item) {
                return [
                    $item['id'] => [
                        "name"  => $item['name'],
                        "icon"  => $item['icon'],
                        "order" => $item['order'],
                        "value" => "",
                    ]
                ];
            })
            ->toArray() : [];

        if (!empty($model) && isset($model?->get_lead_socials)) {
            $result = array_replace_recursive($result, $model?->get_lead_socials);
        }

        return $result;
    }
}
