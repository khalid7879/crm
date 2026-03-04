import React, { useEffect, useState } from "react";
import TenantUserSettingLayout from "@/Components/Tenant/TenantUserSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { UserSettingsBreadItems } from "@/utils/common/BreadcrumbNavItems";
import { router, useForm, usePage } from "@inertiajs/react";
import ButtonComponent from "@/Components/ButtonComponent";
import Select from "react-select";
import { swalToast, swalAlert } from "@/utils/toast";
import { useRoute } from "ziggy";

export default function UserDetailsPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("User settings");
    const { toastAlert } = usePage().props;
    const {
        tenant,
        languages,
        countries,
        salutations,
        routeNames,
        currencies,
        timezones,
        dateFormats,
        timeFormats,
        profiles,
        userData,
        cities,
    } = usePage().props;

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        salutation: profiles?.salutation || "",
        name: userData?.name || "",
        note: profiles?.note || "",
        phone: profiles?.mobile_phone || "",
        language: profiles?.language || "",
        timezone: profiles?.time_zone || "",
        currency: profiles?.currency || "",
        country: userData?.address?.country || "",
        city: userData?.address?.city || "",
        dateFormat: profiles?.date_format || "",
        timeFormat: profiles?.time_format || "",
    });

    const [city, setCities] = useState([]);
    const [timezone, setTimezones] = useState([]);
    const [currency, setCurrencies] = useState([]);

    const [loading, setLoading] = useState(false);

    const countryWiseInfo = (countryName) => {
        if (countryName) {
            post(
                route(routeNames.countryWiseCities, {
                    tenant,
                    countryName: countryName,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        console.log("Status updated successfully!"),
                }
            );
            setLoading(true);
            setTimeout(() => {
                setTimezones(timezones[countryName] ?? []);
                setCurrencies(currencies[countryName] ?? []);
                setData("country", countryName);
                setLoading(false);
            }, 1000);
        }
    };

    const handleModelSubmit = (e) => {
        e.preventDefault();

        post(route(routeNames.userSettingsStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
        });
    };

    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }

        if (data.country) {
            setTimezones(timezones[data.country] ?? []);
            setCurrencies(currencies[data.country] ?? []);
            setCities(cities ?? []);
        }
        if (toastAlert?.cities) {
            const cityList = toastAlert.cities ?? [];

            if (!cityList.find((c) => c.value === data.city)) {
                setData("city", "");
            }
            setCities(cityList);
            setData("city", cityList[0]?.value || "");
            setData("timezone", timezone[0]?.value || "");
            setData("currency", currency[0]?.value || "");
        }
    }, [data.country, timezones, currencies, toastAlert]);

    return (
        <TenantUserSettingLayout>
            <Breadcrumb
                title={metaTitle}
                navItems={[...UserSettingsBreadItems]}
            />
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelSubmit}
                    noValidate
                >
                    {/* --- User Details --- */}
                    <div className="flex items-center w-full">
                        <label className="font-bold text-lg mr-2">
                            User Details
                        </label>
                        <div className="flex-grow border-b border-gray-300"></div>
                    </div>
                    <div className="flex items-center gap-4 ">
                        <label className="w-24 text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <div className="flex items-center gap-3 w-full p-2">
                            <Select
                                name="salutation"
                                options={salutations}
                                className="basic-multi-select input-bordered w-1/4"
                                classNamePrefix="select"
                                placeholder="Salutation"
                                value={
                                    salutations.find(
                                        (opt) => opt.label === data.salutation
                                    ) || null
                                }
                                onChange={(selected) =>
                                    setData("salutation", selected?.label || "")
                                }
                            />
                            <input
                                type="text"
                                placeholder="Name"
                                name="name"
                                className="input input-bordered w-1/4"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-24 text-sm font-medium text-gray-700 pt-2">
                            Note
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-1/3"
                            name="note"
                            rows="2"
                            placeholder="Write your note..."
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-24 text-sm font-medium text-gray-700 pt-2">
                            Phone
                        </label>
                        <input
                            type="text"
                            placeholder="Phone"
                            name="phone"
                            className="input input-bordered w-1/4"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                        />
                    </div>

                    {/* --- Language --- */}
                    <div className="flex items-center w-full">
                        <label className="font-bold text-lg mr-2">
                            Language Setting
                        </label>
                        <div className="flex-grow border-b border-gray-300"></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="">Preferred Language</label>
                        <div className="flex items-center gap-3 w-full">
                            <Select
                                name="language"
                                options={languages}
                                className="basic-multi-select input-bordered w-1/4"
                                classNamePrefix="select"
                                placeholder="Language"
                                value={
                                    languages.find(
                                        (opt) => opt.value === data.language
                                    ) || null
                                }
                                onChange={(selected) =>
                                    setData("language", selected?.value || "")
                                }
                            />
                        </div>
                    </div>

                    {/* --- Regional Setting --- */}
                    <div className="flex items-center w-full">
                        <label className="font-bold text-lg mr-2">
                            Regional Setting
                        </label>
                        <div className="flex-grow border-b border-gray-300"></div>
                    </div>
                    <div className="flex p-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                            Country
                        </label>
                        <Select
                            name="country"
                            options={countries}
                            className="basic-multi-select input-bordered w-1/4"
                            classNamePrefix="select"
                            placeholder="Country"
                            value={
                                countries.find(
                                    (opt) => opt.value === data.country
                                ) || null
                            }
                            onChange={(selected) =>
                                countryWiseInfo(selected?.value)
                            }
                        />
                    </div>

                    <div className="flex p-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                            City
                        </label>
                        <Select
                            name="city"
                            isLoading={loading}
                            options={city}
                            className="basic-multi-select input-bordered w-1/4"
                            classNamePrefix="select"
                            placeholder="City"
                            value={
                                city.find((opt) => opt.value === data.city) ||
                                city[0] ||
                                null
                            }
                            onChange={(selected) =>
                                setData("city", selected?.value || "")
                            }
                        />
                    </div>

                    <div className="flex p-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                            Timezone
                        </label>
                        <Select
                            name="timezone"
                            isLoading={loading}
                            options={timezone}
                            className="basic-multi-select input-bordered w-1/4"
                            classNamePrefix="select"
                            placeholder="Timezone"
                            value={
                                timezone.find(
                                    (opt) => opt.value === data.timezone
                                ) ||
                                timezone[0] ||
                                null
                            }
                            onChange={(selected) =>
                                setData("timezone", selected?.value || "")
                            }
                        />
                    </div>

                    <div className="flex p-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                            Currency
                        </label>
                        <Select
                            name="currency"
                            isLoading={loading}
                            options={currency}
                            className="basic-multi-select input-bordered w-1/4"
                            classNamePrefix="select"
                            placeholder="Currency"
                            value={
                                currency.find(
                                    (opt) => opt.value === data.currency
                                ) ||
                                currency[0] ||
                                null
                            }
                            onChange={(selected) =>
                                setData("currency", selected?.value || "")
                            }
                        />
                    </div>

                    {/* --- Date/Time --- */}
                    <div className="flex items-center w-full">
                        <label className="font-bold text-lg mr-2">
                            Date Time Setting
                        </label>
                        <div className="flex-grow border-b border-gray-300"></div>
                    </div>
                    <div className="flex p-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                            Date Format
                        </label>
                        <Select
                            name="dateFormat"
                            options={dateFormats}
                            className="basic-multi-select input-bordered w-1/4"
                            classNamePrefix="select"
                            placeholder="Date format"
                            value={
                                dateFormats.find(
                                    (opt) => opt.value === data.dateFormat
                                ) || null
                            }
                            onChange={(selected) =>
                                setData("dateFormat", selected?.value || "")
                            }
                        />
                    </div>

                    <div className="flex p-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                            Time Format
                        </label>
                        <Select
                            name="timeFormat"
                            options={timeFormats}
                            className="basic-multi-select input-bordered w-1/4"
                            classNamePrefix="select"
                            placeholder="Time format"
                            value={
                                timeFormats.find(
                                    (opt) => opt.value === data.timeFormat
                                ) || null
                            }
                            onChange={(selected) =>
                                setData("timeFormat", selected?.value || "")
                            }
                        />
                    </div>

                    {/* Submit & Reset */}
                    <div className="buttons flex justify-between">
                        <ButtonComponent
                            type="submit"
                            icon="add"
                            text="Submit"
                            loading={processing}
                            className="btn btn-sm btn-accent flex items-center"
                            iconClass="base-100 h-4 w-4"
                        />
                    </div>
                </form>
            </TableCardComponent>
        </TenantUserSettingLayout>
    );
}
