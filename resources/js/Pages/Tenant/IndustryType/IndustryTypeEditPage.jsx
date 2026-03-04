import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantIndustryTypeSchema } from "@/schemas/tenants/tenantIndustryTypeSchema";
import { TenantIndustryTypeCreateInputs } from "@/utils/forms/industryTypeInputs";
import { IndustryTypeListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo,useState } from "react";
import Select from "react-select";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function IndustryTypeEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const { tenant, routeNames, industryTypes, categoryTypes } =
        usePage().props;
    const metaTitle = __("Category");
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        setError,
        clearErrors,
    } = useForm({
        name: industryTypes[0].name || "",
        types: industryTypes?.type || [],
    });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantIndustryTypeSchema(__), []);
    const options = [
        {
            value: "",
            label: "Select Stage",
            isDisabled: true,
        },
        ...categoryTypes.map((category) => ({
            value: category.value,
            label: category.label,
            isDisabled: false,
        })),
    ];

    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        if (industryTypes && Array.isArray(industryTypes)) {
            // Extract all unique types
            const selectedTypes = [
                ...new Set(industryTypes.map((type) => type.type)),
            ];

            // Match these types to your dropdown options
            const matchedOptions = options.filter((opt) =>
                selectedTypes.includes(opt.value)
            );

            setSelectedOptions(matchedOptions);
            setData("types", selectedTypes);
        }
    }, [industryTypes]);

     const handleChange = (selected) => {
         setSelectedOptions(selected);
         const types = selected.map((option) => option.value);
         setData("types", types);
     };

    const handleModelUpdate = (e) => {
        e.preventDefault();

        clearErrors();
        const { error } = schema.validate(
            {
                name: data.name,
                types: data.types,
            },
            { abortEarly: false }
        );

        if (error) {
            const joiErrors = {};
            error.details.forEach((detail) => {
                const field = detail.path[0];
                joiErrors[field] = detail.message;
            });

            clearErrors();
            setError(joiErrors);
            return;
        }

        clearErrors();

        put(
            route(routeNames.industryTypesUpdate, {
                tenant,
                industryType: industryTypes[0].id,
            }),
            data,
            {
                preserveScroll: true,
                onSuccess: (response) => {
                    // Handle success
                    console.log("Industry Type updated successfully");
                },
                onError: (errors) => {
                    // Handle errors
                    console.error("Update failed:", errors);
                },
            }
        );
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);
     const resetData = (formId = "") => {
         setData({ name: "", types: [] });
         setSelectedOptions([]);
     };

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...IndustryTypeListNavItems, { name: "Edit" }]}
                btnIcon="list"
                link="tenant.industryTypes.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelUpdate}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantIndustryTypeCreateInputs.map((field) => (
                        <CommonFormInputComponent
                            key={field.name}
                            field={field}
                            data={data}
                            errors={errors}
                            setData={setData}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}

                    <Select
                        isMulti
                        name="types"
                        options={options}
                        className={`basic-multi-select ${
                            errors.types ? "border border-red-500 rounded" : ""
                        }`}
                        classNamePrefix="select"
                        onChange={handleChange}
                        value={selectedOptions}
                    />
                    {errors.types && (
                        <div className="text-red-600 text-sm mt-1">
                            {errors.types}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="buttons flex justify-between">
                        <div>
                            <ButtonComponent
                                type="submit"
                                icon="add"
                                text="Update"
                                loading={processing}
                                className="btn btn-sm btn-accent flex items-center"
                                iconClass="base-100 h-4 w-4"
                            />
                        </div>
                        <ResetFormButtonComponent method={resetData} />
                    </div>
                </form>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
