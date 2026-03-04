import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantLeadStageSchema } from "@/schemas/tenants/tenantLeadStageSchema";
import { TenantLeadStageCreateInputs } from "@/utils/forms/leadStageInputs";
import { LeadStageListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import React, { useEffect, useMemo, useState } from "react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function LeadStageEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Stage");
    const { tenant, routeNames, leadStages, stagesType } = usePage().props;
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
        name: leadStages[0].name || "",
        types: leadStages?.type || [],
        label: leadStages[0]?.label || [],
        resolution_days: leadStages[0]?.resolution_days || "",
        resolution_hours: leadStages[0]?.resolution_hours || "",
        stage_percent: leadStages[0]?.stage_percent || [],
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
            label: "Select Stage",
            isDisabled: true,
        },
        ...stagesType.map((module) => ({
            value: module.value,
            label: module.label,
            isDisabled: false,
        })),
    ];

    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        if (leadStages && Array.isArray(leadStages)) {
            // Extract all unique types
            const selectedTypes = [
                ...new Set(leadStages.map((stage) => stage.type)),
            ];

            // Match these types to your dropdown options
            const matchedOptions = options.filter((opt) =>
                selectedTypes.includes(opt.value)
            );

            setSelectedOptions(matchedOptions);
            setData("types", selectedTypes);
        }
    }, [leadStages]);

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
        put(
            route(routeNames.stagesUpdate, {
                tenant,
                stage: leadStages[0].id,
            }),
            data,
            {
                preserveScroll: true,
                onSuccess: (response) => {
                    console.log("Lead source updated successfully");
                },
                onError: (errors) => {
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
        setData({
            name: "",
            types: [],
            label: "",
            resolution_days,
            resolution_hours,
        });
        setSelectedOptions([]);
    };

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...LeadStageListNavItems, { name: "Edit" }]}
                btnIcon="list"
                link="tenant.stages.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelUpdate}
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
                        name="stages"
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
