<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;

trait CleansUpMorphRelationsTrait
{
    /**
     * Register a deleting event to clean up polymorphic pivot tables.
     *
     * @param  array  $relations  Array of [table, typeColumn, idColumn]
     * @param  string  $morphClass  The related morph class (e.g., Task::class)
     * @return void
     */
    protected static function bootCleansUpMorphRelations(array $relations, string $morphClass): void
    {
        static::deleting(function ($model) use ($relations, $morphClass) {
            foreach ($relations as $relation) {
                [$table, $typeColumn, $idColumn] = $relation;

                DB::table($table)
                    ->where($typeColumn, $morphClass)
                    ->where($idColumn, $model->id)
                    ->delete();
            }
        });
    }

    /**
     * Automatically register deleting hooks for given tables.
     *
     * @param  array  $tables  ['table_name' => 'column_name']
     * @return void
     */
    protected static function deleteFromPivotTables(array $tables): void
    {
        static::deleting(function ($model) use ($tables) {
            foreach ($tables as $table => $column) {
                DB::table($table)->where($column, $model->id)->delete();
            }
        });
    }
}
