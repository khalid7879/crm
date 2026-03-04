<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Tag;
use App\Services\BaseModelService;
use Illuminate\Support\Str;
use Exception;

/**
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class TagModelService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param Tag $model
     */
    public function __construct(Tag $model)
    {
        parent::__construct($model);
    }

    /**
     * Store resources
     * 
     * @param string $inputs     
     * @return array array of matching id's
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceStoreAll(array $inputs): array
    {

        if (!is_array($inputs) || count($inputs) <= 0) throw new Exception('Tags missing');

        ## First, get existing tags for these names
        $existingTags = Tag::whereIn('name', $inputs)->get();

        ## Get names of existing tags
        $existingNames = $existingTags->pluck('name')->all();

        ## Find names not yet in DB
        $newNames = array_diff($inputs, $existingNames);

        $newTags = collect();

        try {
            ## Insert new tags with ULIDs as IDs
            foreach ($newNames as $name) {
                $newTags->push(Tag::create([
                    'id' => (string) Str::ulid(),
                    'name' => $name,
                ]));
            }

            ## Merge existing and newly created tags
            $allTags = collect($existingTags->concat($newTags))->pluck('id')->toArray();            
            return $allTags;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
