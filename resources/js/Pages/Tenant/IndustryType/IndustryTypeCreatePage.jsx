import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { TenantIndustryTypeSchema } from "@/schemas/tenants/tenantIndustryTypeSchema";
import { TenantIndustryTypeCreateInputs } from "@/utils/forms/industryTypeInputs";
import { IndustryTypeListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import { swalToast } from "@/utils/toast";
import ButtonComponent from "@/Components/ButtonComponent";
import { router, useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import React, { useEffect, useMemo, useState } from "react";
import { useRoute } from "ziggy";

export default function IndustryTypeCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const { tenant, routeNames, categoryType } = usePage().props;
    const metaTitle = __("Category");
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
            types: [],
        });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantIndustryTypeSchema(__), []);

    const options = [
        {
            value: "",
            label: "Select Type",
            isDisabled: true,
        },
        ...categoryType.map((category) => ({
            value: category.value,
            label: category.label,
            isDisabled: false,
        })),
    ];
    const [selectedOptions, setSelectedOptions] = useState([]);
    const handleIndustryTypeSubmit = (e) => {
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
        console.log(data);

        post(route(routeNames.industryTypesStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
        });
    };
    const resetData = (formId) => {
        setData({ name: "", types: "" });
    };

    const handleChange = (selected) => {
        setSelectedOptions(selected);

        const types = selected.map((option) => option.value);
        setData("types", types);
        if (errors.types) {
            clearErrors("types");
        }
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
            if (toastAlert.type == "success") {
                setData({
                    name: "",
                    types: "",
                });
                setSelectedOptions([]);
            }
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                btnIcon="list"
                navItems={[...IndustryTypeListNavItems, { name: "Create" }]}
                link="tenant.industryTypes.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id=""
                    className="space-y-6"
                    onSubmit={handleIndustryTypeSubmit}
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
                                text="Submit"
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
