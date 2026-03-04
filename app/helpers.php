<?php

use Carbon\Carbon;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;

/**
 * Log name for log table @author MamunHossen
 */
define('TENANT_REGISTER', 'TENANT_REGISTER');
define('ROOT_USER_REGISTER', 'ROOT_USER_REGISTER');
define('SUCCESS', 'SUCCESS');
define('COMMON_MSG', 'Something went wrong');
define('COMMON_ERROR_MSG', 'Something went wrong');
define('INSERT_MSG', 'Created successfully');
define('DELETE_MSG', 'Deleted successfully');
define('UPDATE_MSG', 'Updated successfully');
define('STATUS_CHANGE', 'Status changed successfully');
define('LEAD', 'LEAD');
define('OPPORTUNITY', 'OPPORTUNITY');
define('PROJECT', 'PROJECT');
define('STATE', 'STATE');
define('SMS', 'SMS');
define('EMAIL', 'EMAIL');
define('SYSTEM', 'SYSTEM');
define('FACEBOOK', 'FACEBOOK');
define('YOU_TUBE', 'YOU_TUBE');
define('WHATS_APP', 'WHATS_APP');
define('LINKEDIN', 'LINKEDIN');
define('MODULE', 'MODULE');
define('PERMISSION', 'PERMISSION');
define('ROLE', 'ROLE');
define('DEPARTMENT', 'DEPARTMENT');
define('USER', 'USER');
define('PRODUCT', 'PRODUCT');
define('DATA_CATEGORY', 'DATA_CATEGORY');
define('DATA_SOURCE', 'DATA_SOURCE');
define('STAGE', 'STAGE');
define('DATA_PRIORITY', 'DATA_PRIORITY');
define('DATA_DESIGNATION', 'DATA_DESIGNATION');
define('DATA_RATING', 'DATA_RATING');
define('DATA_CONTACT_TIME', 'DATA_CONTACT_TIME');
define('DATA_EMP_SIZE', 'DATA_EMP_SIZE');
define('SOCIAL_LINK', 'SOCIAL_LINK');
define('NOTIFICATION_EVENT', 'NOTIFICATION_EVENT');
define('NOTIFICATION_SETTING', 'NOTIFICATION_SETTING');
define('INDUSTRY', 'ORGANIZATION');
define('MODEL_OR_METHOD_NOT_FOUND', 'Model or method not found');
define('INVALID_TOKEN', 'Invalid token');
define('MISSING_FIELD', 'Required field missing');
define('COMPANY_SETTING', 'COMPANY_SETTING');
define('USER_PROFILE', 'USER_PROFILE');
define('TASK', 'TASK');
define('NOTE', 'NOTE');
define('UPPER', 'UPPER');
define('DOWN', 'DOWN');
define('MAX', 'MAX');
define('MIN', 'MIN');
define('MIDDLE', 'MIDDLE');
define('INVALID_REQUEST', 'Invalid request');
define('SHIPPING', 'SHIPPING');
define('BILLING', 'BILLING');
define('COUNTRY', 'COUNTRY');
define('CITY', 'CITY');
define('DATA_REVENUE', 'DATA_REVENUE');
define('LEAD_NOT_FOUND', 'Lead not found or may have been deleted');
define('OPPORTUNITY_NOT_FOUND', 'Opportunity not found or may have been deleted');
define('CONTACT_NOT_FOUND', 'Contact not found or may have been deleted');
define('ORGANIZATION', 'ORGANIZATION');
define('TAG', 'TAG');
define('CONTACT', 'CONTACT');
define('SALUTATION', 'SALUTATION');
define('GENDER', 'GENDER');
define('CONTACT_METHOD', 'CONTACT_METHOD');
define('DATA_RELATED_TYPE', 'DATA_RELATED_TYPE');
define('CURRENCY', 'CURRENCY');
define('PROJECT_NOT_FOUND', 'PROJECT_NOT_FOUND');
define('SUPER_ADMIN', 'Super Admin');
define('DATE_CREATED', 'DATE_CREATED');
define('DATE_UPDATED', 'DATE_UPDATED');

define('LEAD_REPORT_HEAD', 'LEAD_REPORT_HEAD');
define('CONTACT_REPORT_HEAD', 'CONTACT_REPORT_HEAD');
define('TASK_REPORT_HEAD', 'TASK_REPORT_HEAD');
define('PROJECT_REPORT_HEAD', 'PROJECT_REPORT_HEAD');
define('OPPORTUNITY_REPORT_HEAD', 'OPPORTUNITY_REPORT_HEAD');
define('ORGANIZATION_REPORT_HEAD', 'ORGANIZATION_REPORT_HEAD');
define('USER_ACTIVITY_REPORT_HEAD', 'USER_ACTIVITY_REPORT_HEAD');
define('USER_ACTIVITY_LOG_REPORT_HEAD', 'USER_ACTIVITY_LOG_REPORT_HEAD');
define('USER_OWNER_ASSOCIATE_REPORT_HEAD', 'USER_OWNER_ASSOCIATE_REPORT_HEAD');
define('USER_OWNER_ASSOCIATE', 'USER_OWNER_ASSOCIATE');
define('USER_ACTIVITY_LOG', 'USER_ACTIVITY_LOG');
define('USER_ACTIVITY', 'USER_ACTIVITY');

define('OPPORTUNITIES_BY_MONTH', 'OPPORTUNITIES_BY_MONTH');
define('OPPORTUNITIES_BY_STAGES', 'OPPORTUNITIES_BY_STAGES');
define('OPPORTUNITIES_BY_SOURCE', 'OPPORTUNITIES_BY_SOURCE');
define('OPPORTUNITIES_BY_TOP_OWNERS', 'OPPORTUNITIES_BY_TOP_OWNERS');

define('ORGANIZATIONS_BY_MONTH', 'ORGANIZATIONS_BY_MONTH');
define('ORGANIZATIONS_BY_TOP_OWNERS', 'ORGANIZATIONS_BY_TOP_OWNERS');

define('PROJECTS_BY_MONTH', 'PROJECTS_BY_MONTH');
define('PROJECTS_BY_TOP_OWNERS', 'PROJECTS_BY_TOP_OWNERS');
define('PROJECTS_BY_CATEGORY', 'PROJECTS_BY_CATEGORY');
define('PROJECTS_BY_STAGES', 'PROJECTS_BY_STAGES');

define('TASKS_BY_MONTH', 'TASKS_BY_MONTH');
define('TASKS_BY_CATEGORY', 'TASKS_BY_CATEGORY');
define('TASKS_BY_STAGES', 'TASKS_BY_STAGES');
define('TASKS_BY_PRIORITY', 'TASKS_BY_PRIORITY');
define('TASKS_BY_TOP_OWNERS', 'TASKS_BY_TOP_OWNERS');

/**
 * _getStaticImage function returns static image path
 * 
 * @return string
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

if (!function_exists('_getStaticImage')) {
    function _getStaticImage(string $key = ''): mixed
    {
        $list = [
            'logo' => Vite::imageRoot('common/logo.png'),
            'favicon' => Vite::imageRoot('common/favicon.png'),
            'registerBg' => Vite::imageRoot('common/app-dashboard.png'),
            'bgAuth' => Vite::imageRoot('common/app-dashboard.png'),
            'bgTask' => Vite::imageRoot('common/app-task.png'),
            'bgLeadInfo' => Vite::imageRoot('common/app-leadInfo.png'),
        ];
        return !empty($key) && array_key_exists($key, $list) ? $list[$key] :  $list;
    }
}

/**
 * _getAuthGuardName check authentication guard
 * @return string
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
if (!function_exists('_getAuthGuardName')) {
    function _getAuthGuardName(): string
    {
        return auth('web')->check() ? 'web' : 'tenant';
    }
}

/**
 * _getCategoryType check authentication guard
 * 
 * @return string
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
if (!function_exists('_getCategoryType')) {
    function _getCategoryType(): array
    {
        return [
            ['value' => INDUSTRY, 'label' => 'Organizations'],
            ['value' => PRODUCT, 'label' => 'Product'],
            ['value' => TASK, 'label' => 'Task'],
            ['value' => OPPORTUNITY, 'label' => 'Opportunity'],
        ];
    }
}

/**
 * _getStagesType check authentication guard
 * 
 * @return string
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
if (!function_exists('_getStagesType')) {
    function _getStagesType(): array
    {
        return [
            ['value' => LEAD, 'label' => 'Lead'],
            ['value' => PROJECT, 'label' => 'Project'],
            ['value' => OPPORTUNITY, 'label' => 'Opportunity'],
            ['value' => STATE, 'label' => 'State'],
            ['value' => TASK, 'label' => 'Task'],
        ];
    }
}

/**
 * _getNotificationChanel
 * @return string
 * @author Mamun Hossen
 */
if (!function_exists('_getNotificationChanel')) {
    function _getNotificationChanel(): array
    {
        return [
            ['value' => SYSTEM, 'label' => 'System'],
            ['value' => SMS, 'label' => 'SMS'],
            ['value' => EMAIL, 'label' => 'Email'],
        ];
    }
}

/**
 * _getAuthInformation
 * @return array
 * @author Mamun Hossen <mamunhossen149191@gmail.com>
 */

if (!function_exists('_getAuthInformation')) {
    function _getAuthInformation($index = ''): mixed
    {
        $authUser =  Auth::user()?->toArray();
        if (!empty($index) && array_key_exists($index, $authUser)) {
            return $authUser[$index];
        }
        return $authUser;
    }
}

/**
 * _getAuthPermissions 
 * @return array
 * @author Mamun Hossen <mamunhossen149191@gmail.com>
 */

if (!function_exists('_getAuthPermissions')) {
    function _getAuthPermissions(): mixed
    {
        if (!auth()->check()) {
            return [];
        }

        $roleId = auth()->user()->roles->first()?->id;

        if (!$roleId) {
            return [];
        }

        ## checking purpose comment
        if ($roleId && auth()->user()->getRoleNames()->first() === 'Super Admin') {
            return Permission::all()->pluck('name');
        }

        return Role::find($roleId)?->permissions->pluck('name') ?? [];
    }
}
/**
 * _hasPermissionOrAbort 
 * @return array
 * @author Mamun Hossen <mamunhossen149191@gmail.com>
 */
if (!function_exists('_hasPermissionOrAbort')) {
    function _hasPermissionOrAbort(string $permission): void
    {
        $roleName = auth()->user()->roles->first()?->name;
        if ($roleName != SUPER_ADMIN) {
            $permissions = collect(_getAuthPermissions())->toArray();

            if (!in_array($permission, $permissions)) {
                abort(403, 'Unauthorized');
            }
        }
    }
}


/**
 * _dateFormat function format date as user needs
 * 
 * @param string $date date('Y-m-d')
 * @param string $format "Y-m-d"
 * @return string $date
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
if (!function_exists('_dateFormat')) {
    /**
     * Format any given date into custom format.
     *
     * @param \DateTimeInterface|string|int|null $date   Date instance, string, timestamp, or null
     * @param string $format                             Desired output format
     * @return string|null
     */
    function _dateFormat($date = null, string $format = "Y-m-d H:i", string $tz = ''): ?string
    {
        if (empty($date)) {
            return null;
        }

        try {
            $tz = $tz ?: config('app.timezone', 'UTC');

            if ($date instanceof \DateTimeInterface) {
                return $date->setTimezone(new DateTimeZone($tz))->format($format);
            }

            if (is_numeric($date)) {
                return \Carbon\Carbon::createFromTimestamp($date)->setTimezone($tz)->format($format);
            }

            if (is_string($date)) {
                return \Carbon\Carbon::parse($date)->setTimezone($tz)->format($format);
            }
        } catch (\Throwable $e) {
            return (string) $date;
        }

        return null;
    }
}



/**
 * _salutations list of salutations
 * 
 * @param int $index
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

if (!function_exists('_salutations')) {
    function _salutations($index = -1)
    {
        $list = [
            '1' => 'Mr',
            '2' => 'Mrs',
            '3' => 'Miss',
            '4' => 'None'
        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}

/**
 * _genders list of genders
 * 
 * @param int $index
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

if (!function_exists('_genders')) {
    function _genders($index = -1)
    {
        $list = [
            '1' => 'Male',
            '2' => 'Female',
            '3' => 'Common',
            '4' => 'None'
        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}


/**
 * _socialLinks list of genders
 * 
 * @param int $index
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
if (!function_exists('_socialLinks')) {
    function _socialLinks($index = -1)
    {
        $list = [
            FACEBOOK =>  ['value' => FACEBOOK, "label" => 'Facebook', 'icon' => 'facebook'],
            YOU_TUBE =>   ['value' => YOU_TUBE, "label" => 'You Tube', 'icon' => 'youtube'],
            WHATS_APP =>  ['value' => WHATS_APP, "label" => 'Whats App', 'icon' => 'whatsapp'],
            LINKEDIN => ['value' => LINKEDIN, "label" => 'LinkedIn', 'icon' => 'linkedIn'],
        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}

/**
 * _dataRating
 * 
 */

if (!function_exists('_dataRatings')) {
    function _dataRatings($index = -1)
    {
        $list = [
            ['value' => 1, "label" => '1'],
            ['value' => 2, "label" => '2'],
            ['value' => 3, "label" => '3'],
            ['value' => 4, "label" => '4'],
            ['value' => 5, "label" => '5'],
        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}

/**
 * Unique email verify token generate process
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
if (!function_exists('_generateUniqueEmailVerifyToken')) {
    function _generateUniqueEmailVerifyToken(string $modelClass): string
    {
        // Check if the class exists
        if (!class_exists($modelClass)) {
            throw new \InvalidArgumentException("Model class {$modelClass} not found.");
        }

        do {
            $token = (string) mt_rand(100000, 999999);
        } while (Tenant::where('email_verify_token', $token)->exists());

        return $token;
    }
}


/**
 * Generate unique lead id
 *  @author Mamun <mamunhossen149191@gmail.com>
 */

if (!function_exists('_generateUniqueId')) {
    // function _generateUniqueId(string $model, string $column, string $prefix = '', int $length = 6): string
    // {
    //     $modelClass = "App\\Models\\Tenant\\{$model}";

    //     if (!class_exists($modelClass)) {
    //         throw new \InvalidArgumentException("Model class {$modelClass} not found.");
    //     }

    //     ## Get all existing numeric parts (e.g. "LEAD-00000123" => 123)
    //     $existingNumbers = $modelClass::where($column, 'like', "{$prefix}-%")
    //         ->pluck($column)
    //         ->map(function ($id) use ($prefix) {
    //             if (preg_match('/(\d+)$/', $id, $matches)) {
    //                 return (int)$matches[1];
    //             }
    //             return null;
    //         })
    //         ->filter()
    //         ->unique()
    //         ->sort()
    //         ->values();

    //     ## Find the first missing number in sequence (gap or end)
    //     $nextNumber = 1;
    //     foreach ($existingNumbers as $num) {
    //         if ($num != $nextNumber) {
    //             break;
    //         }
    //         $nextNumber++;
    //     }

    //     $padded = str_pad($nextNumber, $length, '0', STR_PAD_LEFT);
    //     return $prefix ? "{$prefix}-{$padded}" : $padded;
    // }
    function _generateUniqueId(
        string $model,
        string $column,
        string $prefix = 'LEAD',
        int $length = 8
    ): string {
        $modelClass = "App\\Models\\Tenant\\{$model}";

        if (!class_exists($modelClass)) {
            throw new InvalidArgumentException("Model class {$modelClass} not found.");
        }

        return DB::transaction(function () use ($modelClass, $column, $prefix, $length) {
        
         ## Get MAX numeric value after "LEAD-"
            $maxNumber = $modelClass::where($column, 'like', "{$prefix}-%")
                ->lockForUpdate()
                ->selectRaw("MAX(CAST(SUBSTRING_INDEX({$column}, '-', -1) AS UNSIGNED)) as max_num")
                ->value('max_num');

            $nextNumber = ($maxNumber ?? 0) + 1;

            return sprintf('%s-%0' . $length . 'd', $prefix, $nextNumber);
        });
    }
}

/**
 * _preferredContactMethod methods show list of preferable contact method
 * 
 * @return string
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
if (!function_exists('_preferredContactMethod')) {
    function _preferredContactMethod($index = 0, $all = true)
    {

        $list = [
            '1' => 'Call',
            '2' => 'Email',
            '3' => 'Sms',
        ];
        if ($all) {
            return $list;
        }
        return array_key_exists($index, $list) ?  $list[$index] : '';
    }
}




if (!function_exists('_getAlphabeticalColorName')) {
    /**
     * Get alphabetical color names.
     *
     * @param string|null $index First letter of the color name (a-z)
     * @return string|array|null
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    function _getAlphabeticalColorName(?string $index = null): string|array|null
    {
        ## Predefined alphabetical color names
        $colors = [
            'a' => '#06b6d4', // aqua -> cyan-500
            'b' => '#000000', // black
            'c' => '#0891b2', // cyan -> cyan-700
            'd' => '#1e3a8a', // darkblue -> blue-900
            'e' => '#065f46', // emerald -> emerald-800
            'f' => '#a21caf', // fuchsia -> fuchsia-700
            'g' => '#92400e', // gold -> amber-800
            'h' => '#9d174d', // hotpink -> pink-800
            'i' => '#4b5563', // ivory -> gray-600 (darker substitute)
            'j' => '#047857', // jade -> emerald-700
            'k' => '#6b7280', // khaki -> gray-500
            'l' => '#6d28d9', // lavender -> violet-700
            'm' => '#86198f', // magenta -> fuchsia-800
            'n' => '#1e40af', // navy -> blue-800
            'o' => '#3f6212', // olive -> lime-800
            'p' => '#6b21a8', // purple -> purple-800
            'q' => '#57534e', // quartz -> stone-600
            'r' => '#b91c1c', // red -> red-700
            's' => '#404040', // silver -> neutral-700
            't' => '#115e59', // teal -> teal-800
            'u' => '#312e81', // ultramarine -> indigo-900
            'v' => '#581c87', // violet -> violet-900
            'w' => '#374151', // white -> gray-700 (so it contrasts)
            'x' => '#14532d', // xanadu -> green-900
            'y' => '#854d0e', // yellow -> amber-800
            'z' => '#365314', // zucchini -> green-800
        ];


        ## If no index, return all
        if ($index === null) {
            return $colors;
        }

        ## Normalize index to lowercase
        $index = strtolower($index);

        ## Return matching color if index match otherwise return random color if invalid index
        return array_key_exists($index, $colors) ? $colors[$index] : $colors[array_rand($colors)];
    }
}


if (! function_exists('_getTotalDaysBetweenDays')) {
    /**
     * Get total days, hours, and minutes between two datetimes (default: now).
     *
     * @param  string|\DateTimeInterface  $fromDate
     * @param  string|\DateTimeInterface|null  $toDate
     * @return array{days:int, hours:int, minutes:int}
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    function _getTotalDaysBetweenDays(string|\DateTimeInterface $fromDate, string|\DateTimeInterface|null $toDate = null): mixed
    {
        $start = Carbon::parse($fromDate);
        $end   = $toDate ? Carbon::parse($toDate) : Carbon::now();

        ## Ensure fromDate <= toDate
        if ($start->greaterThan($end)) {
            return json_encode(['days' => 0, 'hours' => 0, 'minutes' => 0]);
        }

        $diff = $start->diff($end);

        return json_encode([
            'days'    => $diff->d + ($diff->m * 30) + ($diff->y * 365),
            'hours'   => $diff->h,
            'minutes' => $diff->i,
        ]);
    }
}

/**
 * _language
 * 
 * @param int $index
 * @author Mamun Hossen
 */

if (!function_exists('_languages')) {
    function _languages($index = -1)
    {
        $list = [
            ['value' => 'English', "label" => 'English'],
            ['value' => 'Bangla', "label" => 'Bangla'],
        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}

/**
 * _dateFormat
 * 
 * @param int $index
 * @author Mamun Hossen
 */

if (!function_exists('_dateFormats')) {
    function _dateFormats($index = -1)
    {
        $list = [
            ['value' => 'm/d/y', "label" => 'm/d/y'],
            ['value' => 'M/d/y', "label" => 'M/d/y'],
            ['value' => 'm/d/Y', "label" => 'm/d/Y'],
            ['value' => 'd/m/y', "label" => 'd/m/y'],
            ['value' => 'd/M/y', "label" => 'd/M/y'],
            ['value' => 'd/m/Y', "label" => 'd/m/Y'],
            ['value' => 'Y/m/d', "label" => 'Y/m/d'],

        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}

/**
 * _dateFormat
 * 
 * @param int $index
 * @author Mamun Hossen
 */

if (!function_exists('_timeFormats')) {
    function _timeFormats($index = -1)
    {
        $list = [
            ['value' => 'H:i:s', "label" => 'H:i:s'],
            ['value' => 'h:i:s', "label" => 'h:i:s'],
            ['value' => 'g:i:s A', "label" => 'g:i:s A'],
        ];
        if ($index <= 0) return $list;
        return array_key_exists($index, $list) ?  $list[$index] : $list;
    }
}

/**
 * Add "order_status" (MIN, MIDDLE, MAX) to each item.
 * Optionally group by a given column, and sort ascending by "order".
 *
 * @param  \Illuminate\Support\Collection|array  $resourceList
 * @param  string|null  $groupBy  Column name to group by (optional)
 * @return \Illuminate\Support\Collection
 * 
 * Example:
 *   _addOrderStatus($leadStageList, 'type'); // grouped
 *   _addOrderStatus($leadStageList);         // flat
 */

if (!function_exists('_addOrderStatus')) {
    function _addOrderStatus($resourceList, $groupBy = null)
    {
        try {

            ## Convert to Collection if not already
            $resources = $resourceList instanceof \Illuminate\Support\Collection
                ? $resourceList
                : collect($resourceList->items());


            ## If grouping is required
            if ($groupBy) {
                return $resources
                    ->groupBy($groupBy) ## Group by column (e.g., "type")
                    ->map(function ($group) {
                        $min = $group->min('order');
                        $max = $group->max('order');

                        return $group->map(function ($item) use ($min, $max) {

                            if (!empty($item['stage_percent'])) {
                                $item['name'] .= '(' . $item['stage_percent'] . '%)';
                            }

                            if ($item['order'] == $max) {
                                $item['order_status'] = MAX;
                            } elseif ($item['order'] == $min) {
                                $item['order_status'] = MIN;
                            } else {
                                $item['order_status'] = MIDDLE;
                            }

                            return $item;
                        })
                            ->sortBy('order')
                            ->values();   ## Re-index
                    });
            }

            ## If no grouping, just flat processing
            $min = $resources->min('order');
            $max = $resources->max('order');

            return $resources->map(function ($item) use ($min, $max) {
                if (!empty($item['stage_percent'])) {
                    $item['name'] .= '(' . $item['stage_percent'] . '%)';
                }

                if ($item['order'] == $max) {
                    $item['order_status'] = 'MAX';
                } elseif ($item['order'] == $min) {
                    $item['order_status'] = 'MIN';
                } else {
                    $item['order_status'] = 'MIDDLE';
                }

                return $item;
            })
                ->sortBy('order')
                ->values();
        } catch (\Throwable $th) {
            throw new \Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}

/**
 * Flash a toast message to session and redirect back.
 *
 * @param string $type    success|error|info|warning
 * @param string $message The message to show in toast
 * @return \Illuminate\Http\RedirectResponse
 */
if (!function_exists('_commonSuccessOrErrorMsg')) {

    function _commonSuccessOrErrorMsg(string $type, string $message)
    {
        return redirect()->back()->with([
            'toastResponse' => [
                'type'    => $type,   ## Example: 'success', 'error'
                'message' => $message
            ],
        ]);
    }
}

if (!function_exists('_getSubString')) {
    /**
     * Get sub string of given string
     *
     * @param string $text Original text
     * @param int $length How many characters to return
     * @param bool $showEllipsis To show suffix (...) 3 dots after text
     * @param array $options Additional options: ['trim' => true, 'preserveWords' => false]
     * @return string
     * 
     * @author Sakil Jomadder
     */
    function _getSubString($text, int $length, bool $showEllipsis = true, array $options = []): string
    {
        if (!$text) {
            return '';
        }

        $trim = $options['trim'] ?? true;
        $preserveWords = $options['preserveWords'] ?? false;

        $str = (string) $text;
        if ($trim) {
            $str = trim($str);
        }

        // Return full string if full string length is less than required length or length is less than 0
        if (mb_strlen($str) <= $length || $length < 0) {
            return $str;
        }

        // Return nothing if length is 0
        if ($length == 0) {
            return '';
        }

        $truncated = mb_substr($str, 0, $length);

        if ($preserveWords) {
            $lastSpace = mb_strrpos($truncated, ' ');
            if ($lastSpace !== false) {
                // Cut off broken last word
                $truncated = mb_substr($truncated, 0, $lastSpace);
            }
            // If no space found, just return empty string is skipped, or optionally return first part
        }

        return $showEllipsis && mb_strlen($truncated) > 0 ? $truncated . '...' : $truncated;
    }
}


/**
 * Get the current active tenant from session.
 *
 * @return string|null
 */
if (! function_exists('_getActiveTenant')) {

    function _getActiveTenant()
    {
        $tenant = session('ACTIVE_TENANT');

        if (!empty($tenant)) {
            return $tenant;
        }

        return null; // or '' if you prefer empty string
    }
}


/**
 * 
 * _getModelStatus - This helper function returns the human-readable status label based on the provided index.
 * The available statuses are:
 * - 0 => Inactive
 * - 1 => Active
 * - 2 => Pending
 *
 * Behaviour:
 * - If a valid $index (0, 1, or 2) is provided, the corresponding label string is returned.
 * - If $index is -1 (default), the full array of all status labels is returned.
 * - If $index does not match any key, null is returned (no fallback to a default label).
 *
 * @param int $index The status index (0=Inactive, 1=Active, 2=Pending). Default: -1
 * @return string|array|null The status label string, full array (when -1), or null if index not found
 * 
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
if (! function_exists('_getModelStatus')) {

    function _getModelStatus(int $index = -1): mixed
    {
        ## Define the status mapping array
        $items = [
            0 => ['Inactive', 'bg-gray-500 text-white', 'badge badge-neutral text-gray-100/75'],
            1 => ['Active', 'bg-success text-black', 'badge badge-success text-green-900'],
            2 => ['Unverified', 'bg-warning text-black', 'badge badge-warning text-orange-700'],
        ];

        ## Return all statuses when the default index (-1) is used
        if ($index === -1) {
            return $items;
        }

        ## Return the specific label if the index exists; otherwise return null
        return $items[$index] ?? null;
    }
}
