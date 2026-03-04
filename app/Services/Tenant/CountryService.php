<?php

namespace App\Services\Tenant;

use Exception;
use App\Services\BaseModelService;
use App\Models\Tenant\SystemCountry;
use Nnjeim\World\Models\City;
use Throwable;

class CountryService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param Profile $model
     */
    public function __construct(SystemCountry $model)
    {
        parent::__construct($model);
    }


    /**
     * user setting country data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function countryDataForUserSetting(): mixed
    {
        $datas = [];
        $countries = [];
        $salutations = [];
        $currencies = [];
        $timezones = [];


        $allCountries = SystemCountry::with('timezones', 'currencies')->get();

        foreach (_salutations() as $key => $salutation) {
            $salutations[] = [
                'value' => $key,
                'label' => $salutation,
            ];
        }
        foreach ($allCountries as $key => $country) {
            $countries[] = [
                'value' => $country->name,
                'label' => $country->name,
            ];

            if (!isset($currencies[$country['name']])) {
                $currencies[$country['name']] = [];
            }
            if (isset($country['currencies']) && $country['currencies']) {
                foreach ($country['currencies'] as $currency) {
                    $currencies[$country['name']][] = [
                        'value' => $currency->name,
                        'label' => $currency->name,
                    ];
                }
            }

            if (!isset($timezones[$country['name']])) {
                $timezones[$country['name']] = [];
            }
            if (isset($country['timezones']) && $country['timezones']) {
                foreach ($country['timezones'] as $timezone) {
                    $timezones[$country['name']][] = [
                        'value' => $timezone->name,
                        'label' => $timezone->name,
                    ];
                }
            }
        }


        $datas['countries'] = $countries;
        $datas['salutations'] = $salutations;
        $datas['currencies'] = $currencies;
        $datas['timezones'] = $timezones;
        return $datas;
    }

    /**
     * country list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function getAllCountry(array $relations = [])
    {
        $query = SystemCountry::query();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->get();
    }

    /**
     * country by id
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function getCountryById(int $id, array $relations = [])
    {
        $query = SystemCountry::query();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->find($id);
    }

    /**
     * country by name
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function getCountryByName(string|null $name, array $relations = [])
    {
        if (empty($name)) {
            return null;
        }

        $query = SystemCountry::query();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where('name', $name)->first();
    }


    /**
     * City by name
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function getCityByName(string|null $name)
    {
        if (empty($name)) {
            return null;
        }

        $query = City::query();

        return $query->where('name', $name)->first();
    }


    /**
     * country wise city
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function countryWiseCities($request)
    {
        try {
            if (!empty($request['countryName'])) {
                return SystemCountry::with('cities')
                    ->where('name', $request['countryName'])
                    ->get();
            }
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . $th->getLine());
        }
    }


    /**
     * Retrieve all currencies grouped by country or as a flat list.
     *
     * This method loads all countries with their related currencies.
     * Depending on the `$showCountryAsKey` flag:
     * 
     * - If `true`: Returns an associative array with country names as keys
     *   and arrays of currencies as values. Example:
     *   [
     *       "Bangladesh" => ["name" => "Taka", "code" => "BDT", "symbol" => "৳", "symbol_native" => "৳"]
     *   ]
     * 
     * - If `false`: Returns a flat indexed array of currencies without country grouping.  Example:
     *   [
     *       ["name" => "Taka", "code" => "BDT", "symbol" => "৳", "symbol_native" => "৳"],
     *       ["name" => "Dollar", "code" => "USD", "symbol" => "$", "symbol_native" => "$"]
     *   ]
     *
     * @param  bool  $showCountryAsKey  Whether to use country names as array keys.
     * @return array<int|string, array<string, string>> List of currencies.
     *
     * @throws \Exception If an error occurs while fetching the data.
     * 
     * @author 
     * Mamun <mamunhossen149191@gmail.com>
     * Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getAllCurrency(bool $showCountryAsKey = true): array
    {
        try {
            $allCountries = SystemCountry::with('currencies')->get();
            $currencies = [];

            foreach ($allCountries as $country) {
                if (!empty($country->currencies)) {
                    foreach ($country->currencies as $currency) {
                        $currencyData = [
                            'name'          => $currency->name,
                            'code'          => $currency->code,
                            'symbol'        => $currency->symbol,
                            'symbol_native' => $currency->symbol_native,
                        ];

                        if ($showCountryAsKey) {
                            $currencies[$country->name] = $currencyData;
                        } else {
                            $currencies[] = $currencyData;
                        }
                    }
                }
            }

            return $currencies;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }

    /**
     * Get all currencies as key-value pairs.
     *
     * The result will have the currency code as the key
     * and a human-readable label (name + native symbol) as the value.
     *
     * Example:
     * [
     *     "BDT" => "Taka (৳)",
     *     "USD" => "US Dollar ($)"
     * ]
     *
     * @return array<string, string>
     *
     * @throws \Exception If an error occurs while fetching the data.
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getCurrencyByKeyValue(): array
    {
        try {
            $currencies = $this->getAllCurrency(false);
            $formatted = [];

            foreach ($currencies as $currency) {
                $formatted[$currency['code']] = sprintf(
                    "%s (%s)",
                    $currency['name'],
                    $currency['symbol_native']
                );
            }

            return $formatted;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }

    public function getCitiesByCountryId(string|int $id)
    {
        try {
            if (empty($id)) {
                return null; 
            }

            return City::where('country_id', $id)
                ->pluck('name', 'id');
        } catch (\Throwable $th) {
            throw new \Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }


    public function getCityById(int $id, array $relations = [])
    {
        try {
            $query = City::query();

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->find($id);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
