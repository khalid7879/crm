<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\Stage;
use App\Services\BaseModelService;


class TenantLeadStageService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param Stage $model
     */
    public function __construct(Stage $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined stage routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'stagesList' => 'tenant.stages.index',
            'stagesCreate' => 'tenant.stages.create',
            'stagesStore' => 'tenant.stages.store',
            'stagesEdit' => 'tenant.stages.edit',
            'stagesUpdate' => 'tenant.stages.update',
            'stagesDelete' => 'tenant.stages.destroy',
            'stagesStatusChange' => 'tenant.stages.status.change',
            'StageTypeStatusChange' => 'tenant.stages.type.status.change',
            'StageOrderChange' => 'tenant.stages.order.change',

        ];
    }

    /**
     * Resource validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => [
                    'required',
                    'min:3',
                    'max:50',
                ],
                'label' => [
                    'required',
                    'min:3',
                    'max:50',
                ],
                'types' => ['required'],
                'stage_percent' => ['required', 'numeric', 'min:1', 'max:100'],
                'resolution_hours' => ['required', 'numeric', 'min:1', 'max:999'],
                'resolution_days' => ['required', 'numeric', 'min:1', 'max:999'],
            ],
            [
                'name.required' => __('Name can not be empty'),
                'name.min' => __('Minimum character length :min',  [':min']),
                'name.max' => __('Maximum character length :max', [':max']),
                'types.required' => __('Field can not be empty'),
                'name.unique' => __('The combination of name and type must be unique.'),
                'resolution_hours.min' => 'Resolution hours cannot be negative or zero.',
                'resolution_hours.max' => 'Resolution hours cannot exceed 100.',
                'resolution_days.min' => 'Resolution hours cannot be negative or zero.',
                'resolution_days.max' => 'Resolution hours cannot exceed 100.',
                'stage_percent.min' => 'Stage percentage negative or zero.',
                'stage_percent.max' => 'The stage percent field must not be greater than 100.',
            ]
        )->validate();
    }

    /**
     * Resource Store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs): bool
    {
        try {
            $types        = $inputs['types'] ?? [];
            $name         = $inputs['name'] ?? null;
            $label        = $inputs['label'] ?? null;
            $stagePercent = $inputs['stage_percent'] ?? null;
            $resolution_hours = $inputs['resolution_hours'] ?? 0;
            $resolution_days = $inputs['resolution_days'] ?? 0;

            if (empty($types) || empty($name) || empty($label)) {
                return false;
            }

            $maxOrder   = Stage::max('order') ?? 1;
            $createdAny = false;

            foreach ($types as $type) {
                $maxOrder++;
                $exists = Stage::where('name', $name)
                    ->where('type', $type)
                    ->exists();

                if ($exists) {
                    throw new Exception($name . ' and type ' . $type . ' this combination already exits!');
                }
                $leadStage = Stage::create([
                    'name'          => $name,
                    'type'          => $type,
                    'label'         => $label,
                    'order'         => $maxOrder,
                    'stage_percent' => $stagePercent,
                    'resolution_hours' => $resolution_hours,
                    'resolution_days' => $resolution_days,
                    'is_delete'     => 1,
                ]);

                if ($leadStage) {
                    $createdAny = true;
                }
            }

            return $createdAny;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
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
            $leadStageList =  $this->getPaginatedModels($requests);
            $result = _addOrderStatus($leadStageList, 'type');
            return $result;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource edit data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($stageId): mixed
    {
        try {
            $stage = $this->getSingleModel($stageId);
            $stages = Stage::where('name', $stage->name)->get();
            return $stages;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($leadStageId): mixed
    {
        try {
            $leadStage = $this->getSingleModel($leadStageId);

            if (empty($leadStage)) throw new Exception(INVALID_REQUEST);

            $leadStage->delete();

            return true;
        } catch (\Exception $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $leadStage): mixed
    {
        try {
            $types = $inputs['types'];
            $name  = $inputs['name'];
            $label = $inputs['label'];
            $stagePercent = $inputs['stage_percent'];
            $resolution_hours = $inputs['resolution_hours'];
            $resolution_days = $inputs['resolution_days'];
            $singleStage = Stage::find($leadStage);
            $stages = Stage::where('name', $singleStage->name)
                ->get()
                ->keyBy('type');

            if (!empty($stages)) {
                foreach ($types as $type) {
                    if (isset($stages[$type])) {
                        $stages[$type]->name = $name;
                        $stages[$type]->type = $type;
                        $stages[$type]->label = $label;
                        $stages[$type]->stage_percent = $stagePercent;
                        $stages[$type]->resolution_hours = $resolution_hours;
                        $stages[$type]->resolution_days = $resolution_days;
                        $stages[$type]->save();
                    } else {
                        $exists = Stage::where('name', $name)
                            ->where('type', $type)
                            ->exists();

                        if ($exists) {
                            throw new Exception($name . ' and type ' . $type . ' this combination already exits!');
                        }
                        Stage::create([
                            'name' => $name,
                            'type' => $type,
                            'label' => $label,
                            'stage_percent' => $stagePercent,
                            'is_delete' => '1',
                            'resolution_hours' => $resolution_hours,
                            'resolution_days' => $resolution_days,
                        ]);
                    }
                }

                foreach ($stages as $type => $stage) {
                    $result = in_array($type, $types);
                    if (empty($result) && $stage->is_delete == '1') {
                        $stage->delete();
                    }
                }
            }
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function stageStatusChange(array $inputs)
    {
        try {
            ## Central user
            $leadStageId = $inputs['leadStageId'];
            $leadStage = Stage::findOrFail($leadStageId);
            if ($leadStage) {
                $stages = Stage::where('name', $leadStage->name)->get();
                foreach ($stages as $key => $stage) {
                    $stage->is_active = $stage->is_active == '1' ? '0' : '1';
                    $stage->save();
                }
                return true;
            }
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Get stages by type ex: LEAD,OPPORTUNITY,STATE etc, excluded item and default stage
     * 
     * @param array $inputs
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getStagesByType(array $inputs): array
    {
        $data = [];
        $type = strtoupper($inputs['type'] ?? 'LEAD');
        $default = $inputs['default'] ?? '';
        $exclude = (array) ($inputs['exclude'] ?? []);

        ## get stages
        $stages = $this->getPaginatedModels([
            'orderBy'   => 'order',
            'orderType' => 'asc',
            'isPaginate' => false,
            'isActive'  => true,
            'wheres'    => [
                'type' => $type,
            ],
        ]);

        ## transform into required structure
        $list = $stages->mapWithKeys(function ($stage) {
            return [
                $stage->id => [
                    'id'  => $stage->id,
                    'name'  => $stage->name,
                    'type'  => $stage->type,
                    'label' => ucfirst($stage->label) ?? ucfirst($stage->name),
                    'is_default' => $stage->is_default,
                    'is_final_stage' => $stage->is_final_stage,
                    'stage_percent' => $stage->stage_percent,
                    'created_at' => $stage->created_at,
                    'updated_at' => $stage->updated_at,
                ],
            ];
        })->toArray();

        $data['list'] = $list;

        ## generate default stage (set model id as value)
        if (!empty($default)) {
            $data['default'] = $default;
        } elseif (is_array($list) && count($list)) {
            $stageDefaultKey = collect($list)
                ->filter(fn($item) => $item['is_default'] === "1")
                ->sortByDesc('updated_at')
                ->keys()
                ->first();
            $data['default'] = $stageDefaultKey;
        }

        ## Check the stage of currently active lead is in final stage
        $finalStageKey = collect($list)
            ->filter(fn($item) => $item['is_final_stage'] === "1")
            ->keys()
            ->first();

        ## This is required for lead. when lead converted(final) then stage dropdown must be readonly
        if ($finalStageKey === @$data['default']) {
            $data['inForm'] = collect($list)->pluck('name', 'id')->toArray();
            $data['isReadOnly'] = true;
        } elseif (!empty($exclude)) {
            ## generate list after excluding selected items (by name or id)
            $itemsAfterExclude = collect($list)->reject(function ($item, $id) use ($exclude) {
                return in_array($id, $exclude, true) || in_array($item['label'], $exclude, true);
            })->toArray();

            $data['inForm'] = collect($itemsAfterExclude)->pluck('name', 'id')->toArray();
            $data['isReadOnly'] = false;
        }
        return $data;
    }

    /**
     * Get formatted stages passed by model itself 
     * 
     * @param array $items - List of stages passed by model
     * @return array - Formatted list of items
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getModelStages(array $items): array
    {
        $list = [];

        foreach ($items as $key => $stage) {
            $createdAt = $stage['pivot']['created_at'] ?? null;
            $duration  = $stage['pivot']['duration'] ?? null;
            $causerId  = $stage['pivot']['causer_data']['name'] ?? null;

            ## Use given duration or calculate from created_at
            $durationData = $duration ?? _getTotalDaysBetweenDays($createdAt);

            ## Always decode safely
            $durationArr  = json_decode($durationData ?: '{}', true);

            $durationStr  = collect($durationArr)
                ->map(fn($val, $key) => "$val $key")
                ->implode(', ');

            ## Before storing in list, set stage['id']
            $list[$key] = [
                'causer_id'  => $causerId,
                'name'       => $stage['name'],
                'created_at' => _dateFormat($createdAt, 'd M, Y - h:i A'),
                'duration'   => $durationStr,
            ];
        }

        return $list;
    }

    /**
     * Stage type status change
     *
     * @param [type] $requests
     * @return void
     */
    public function stageTypeStatusChange($requests)
    {
        try {
            $type      = $requests['type'];
            $id        = $requests['id'];
            $attribute = $requests['attribute'];

            $stage = $this->getSingleModel($id);

            $exitsStages = Stage::where('type', $type)->get()->keyBy('id');

            if (!isset($exitsStages[$stage->id])) throw new Exception("Stage not found in this type");

            if ($attribute === 'DEFAULT_STAGE') {
                if ($stage->is_final_stage == '1') throw new Exception("Stage already marked as final, cannot be default");

                $stage->is_default = '1';
                $stage->save();

                foreach ($exitsStages as $otherStage) {
                    if ($otherStage->id != $stage->id && $otherStage->is_default == '1') {
                        $otherStage->is_default = '0';
                        $otherStage->save();
                    }
                }
            }

            if ($attribute === 'FINAL_STAGE') {

                if ($stage->is_default == '1') throw new Exception("Stage already marked as default, cannot be final.");

                $stage->is_final_stage = '1';
                $stage->save();

                foreach ($exitsStages as $otherStage) {
                    if ($otherStage->id != $stage->id && $otherStage->is_final_stage == '1') {
                        $otherStage->is_final_stage = '0';
                        $otherStage->save();
                    }
                }
            }

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
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

            $stage = Stage::find($id);
            if (!$stage) throw new \Exception(INVALID_REQUEST);


            $currentOrder = (int) $stage->order;

            if ($type === UPPER) {
                ## Find the nearest stage with smaller order (above current one)
                $neighbor = Stage::where('type', $stage->type)
                    ->where('order', '<', $currentOrder)
                    ->orderBy('order', 'desc')
                    ->first();
            } else {
                ## Find the nearest stage with larger order (below current one)
                $neighbor = Stage::where('type', $stage->type)
                    ->where('order', '>', $currentOrder)
                    ->orderBy('order', 'asc')
                    ->first();
            }

            if (!$neighbor) throw new Exception('No neighbor found');

            ## Swap the orders
            [$stage->order, $neighbor->order] = [$neighbor->order, $stage->order];

            $stage->save();
            $neighbor->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
