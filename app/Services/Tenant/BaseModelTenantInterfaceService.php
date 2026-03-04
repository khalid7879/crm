<?php
namespace App\Services\Tenant;

use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
interface BaseModelTenantInterfaceService
{
    public function getSingleModel(string|int $id): ?object;
    public function getAllModels(): Collection|array;
    public function getPaginatedModels(): LengthAwarePaginator |array;
}
