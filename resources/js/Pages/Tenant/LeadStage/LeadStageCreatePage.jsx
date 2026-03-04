import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { TenantLeadStageSchema } from "@/schemas/tenants/tenantLeadStageSchema";
import { TenantLeadStageCreateInputs } from "@/utils/forms/leadStageInputs";
import { LeadStageListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import { swalToast } from "@/utils/toast";
import ButtonComponent from "@/Components/ButtonComponent";
import { router, useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import React, { useEffect, useMemo, useState } from "react";
import { useRoute } from "ziggy";

export default function LeadStageCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Stage");
    const { tenant, routeNames, stagesType } = usePage().props;

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
            label: "",
            stage_percent: "",
            types: [],
            resolution_days: "",
            resolution_hours: "",
        });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantLeadStageSchema(__), []);

    const handleLabelChange = (field, value) => {
        setData(field, value);

        if (field === "name") {
            setData("label", value);
        }
    };

    const options = [
        {
            value: "",
            label: "Select Type",
            isDisabled: true,
        },
        ...stagesType.map((module) => ({
            value: module.value,
            label: module.label,
            isDisabled: false,
        })),
    ];

    const [selectedOptions, setSelectedOptions] = useState([]);
    const handleChange = (selected) => {
        setSelectedOptions(selected);

        const types = selected.map((option) => option.value);
        setData("types", types);
        if (errors.types) {
            clearErrors("types");
        }
    };

    const handleModelSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        const { error } = schema.validate(
            {
                name: data.name,
                types: data.types,
                label: data.label,
                stage_percent: data.stage_percent,
                resolution_days: data.resolution_days,
                resolution_hours: data.resolution_hours,
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
        post(route(routeNames.stagesStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
        });
    };
    const resetData = (formId = "") => {
        setData({
            name: "",
            types: [],
            label: "",
            stage_percent: "",
            resolution_days: "",
            resolution_hours: "",
        });
        setSelectedOptions([]);
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
                    types: [],
                    label: "",
                    stage_percent: "",
                    resolution_days: "",
                    resolution_hours: "",
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
                navItems={[...LeadStageListNavItems, { name: "Create" }]}
                link="tenant.stages.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id=""
                    className="space-y-6"
                    onSubmit={handleModelSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantLeadStageCreateInputs.map((field) => (
                        <CommonFormInputComponent
                            key={field.name}
                            field={field}
                            data={data}
                            errors={errors}
                            setData={(name, value) =>
                                handleLabelChange(name, value)
                            }
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
